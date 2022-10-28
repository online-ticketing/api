'use strict';
const bcrypt = require('bcrypt');
const utils = require('../utils/apiUtils');
const app = require('../../server/server');
const otpGenerator = require('otp-generator');
module.exports = function(User) {
  User.beforeRemote('**', async function(ctx) {

    const methodName = ctx.method.name.toLowerCase();
    if (methodName === 'create') {
      const pwdPlain = ctx.req.body.password;
      if (pwdPlain) {
        const pwdEncrypt = await utils.encrypt(pwdPlain);
        ctx.req.body.password = pwdEncrypt;
        const crypto = require('crypto');
        const api_key = crypto.randomBytes(20).toString('hex');
        ctx.req.body.api_key = api_key;
        ctx.req.body.account_status = 0;
      }
      return;
    }
    if (methodName === 'login' || methodName === 'authenticateotp') {
      return;
    }
    //Only admins/managers should be able to access this resource
    if (methodName === "patchattributes") {
      if (ctx.args.data) {
        const userId = ctx.req.params.id;
        const user = await User.findById(userId);
        const apiKey = ctx.args.data.api_key;
        if ((user && user.api_key === apiKey) || (utils.isAllowed(user, ['ADMIN', 'MANAGER']))) {
          if (ctx.args.data.password) {
           throw new Error("Password cannot be changed using this URL")
          }
          delete ctx.args.data.api_key;
          return;
        }
      }
    }
    return await utils.admin_authorization(ctx);
  });
  User.afterRemote('**', async function(ctx, modelInstance) {
    const methodName = ctx.method.name.toLowerCase();
    if (methodName === 'create') {

      let cuser = null;
      if (Array.isArray(modelInstance)) {
        cuser = ctx.result[0];
      } else {
        cuser = ctx.result;
      }
      const user = await User.findById(cuser.id, {include: ['roles']});
      const app = require('../../server/server');
      const RoleModel = app.models.role;
      const UserRoleModel = app.models.user_role;
      const role = await RoleModel.find({where: {name: 'PASSENGER'}});
      await UserRoleModel.create({userId: user.id, roleId: role[0].id});
      const RecoverModel = app.models.recover;
      const otpGenerator = require('otp-generator')
      const otp = otpGenerator.generate(4, { lowerCaseAlphabets: false,upperCaseAlphabets: false, specialChars: false });
      const options = {email: user.email,otp: otp};
      await RecoverModel.create(options);
      options.full_name = user.full_name;
      //create OTP and send OTP
      const answer = await utils.otpEmail(options);
      return  ctx.result = answer;
    }

    //Remove all passwords from output
    if (Array.isArray(ctx.result)) {
      ctx.result.forEach(function (result) {
        if(result.__data && result.__data.password) {
          delete result.__data.password;
        }
      });
    } else {
      if(ctx.result.__data && ctx.result.__data.password) {
        delete ctx.result.__data.password;
      }
    }
    return ctx.result;
  });
  /**
   *
   * @param data
   * @returns {Promise<*>}
   */
  User.login = async function(data) {
    try {
      const phone = data.contact_number;
      const password = data.password;
      const user = await User.findOne({where: {contact_number: phone}});
      if (user) {
        if(user.status === 0){
          throw new Error('Account is inactive. Activate account');
        }

        const isMatch = await utils.comparePwd(password, user.password);
        if (!isMatch) {
          throw new Error('phone/password did not match');
        }
        return {
          phone: user.contact_number,
          full_name: user.full_name,
          api_key: user.api_key,
          email: user.email,
          date_created: user.date_created,
          last_modified: user.last_modified,
          apiKey: user.api_key
        };
      } else {
        throw new Error('phone/password did not match');
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
  User.remoteMethod('login', {
    http: {
      path: '/login',
      verb: 'post',
    },
    accepts: [{
      arg: 'data',
      description: 'JSON data to validate user login',
      type: 'object',
      http: {
        source: 'body',
      },
      required: true,
    }],
    description: 'Check user name and password and login if successful',
    returns: {
      root: true, 'type': 'object',
    },
  });
  /**
   *
   * @param data
   * @returns {Promise<{otp: string}>}
   *
   */
  User.authenticateOTP = async function (data) {
    const email = data.email;
    const otp = data.otp;

    const VRecover = User.app.models.v_recover;
    const whereClause = {where: {and: [{email: email}, {otp:otp}]}};

    const responseData = await VRecover.find(whereClause);
    if(!responseData || responseData.length === 0){
      return {"otp" : "expired"};
    }

    const user = await User.findOne({where: {email: email}});
    if(!user){
      return {"otp" : "expired"};
    }
    await user.updateAttributes({account_status: 1});
    return {otp : otp, email: email };
  };
  User.remoteMethod('authenticateOTP', {
    http: {
      path: '/authenticateOTP',
      verb: 'post'
    },
    accepts: [{
      arg: 'data',
      description: "JSON data to verify email",
      type: 'object',
      http: {
        source: 'body'
      },
      required: true
    }],
    description: 'Authenticate the OTP sent by user',
    returns: {
      "type": "user",
      "root": true
    }
  });
};
