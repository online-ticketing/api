'use strict';
const bcrypt = require('bcrypt');
const utils = require('../utils/apiUtils');
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
      }
      return;
    }
    if (methodName === 'login') {
      return;
    }
    //Only admins/managers should be able to access this resource

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
      const users = await User.find({where: {contact_number: phone}});
      if (users && users.length === 1) {
        const user = users[0];
        const isMatch = await utils.comparePwd(password, user.password);
        if (!isMatch) {
          throw new Error('phone/password did not match');
        }
        return {
          phone: user.contact_number,
          full_name: user.full_name,
          api_key: user.api_key,
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
};
