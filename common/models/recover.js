'use strict';

module.exports = function(Recover) {
  Recover.beforeRemote('**', async function(ctx) {
    const methodName = ctx.method.name.toLowerCase();
    const email = ctx.req.body.email;
    if(!email){
      throw new Error('Email is required to change/reset your password');
    }
    const User = Recover.app.models.user;
    const user = await User.findOne({where: {email: email}});
    if(!user){
      throw new Error('Email does not exist in system');
    }
    if (methodName === 'create') {//create an otp
      const otpGenerator = require('otp-generator')
      const otp = otpGenerator.generate(4, { lowerCaseAlphabets: false,upperCaseAlphabets: false, specialChars: false });
      ctx.req.body.otp = otp;
      return;
    }
    if(methodName === 'verifyemail' || methodName === 'resetpassword' ){
      const otp = ctx.req.body.otp;
      if(!otp){
        throw new Error('OTP is required to verify email or reset password');
      }
      if(methodName === 'resetpassword'){
        const pwd = ctx.req.body.password;
        if(!pwd){
          throw new Error('Password is required');
        }
      }
      return;
    }
    throw new Error(methodName + " not implemented")
  });

  /**
   *
   */
  Recover.afterRemote("**", async function (ctx, modelInstance) {
    const methodName = ctx.method.name;
    if(methodName.toLowerCase() === "create"){
      const utils = require('../utils/apiUtils');
      const user = await Recover.app.models.User.findOne({where: {email: ctx.result.email}});
      const options = {email: ctx.result.email,otp: ctx.result.otp, full_name: user.full_name};
      ctx.result = await utils.otpEmail(options);
    }
  })
  /**
   *
   * @param data
   * @param options
   * @returns {Promise<{otp: string}>}
   */
  Recover.verifyemail = async function (data) {
    const email = data.email;
    const otp = data.otp;

    const VRecover = Recover.app.models.v_recover;
    const whereClause = {where: {and: [{email: email}, {otp:otp}]}};

    const responseData = await VRecover.find(whereClause);
    if(!responseData || responseData.length === 0){
      return {"otp" : "expired"};
    }
    return {otp : otp, email: email };
  }
  Recover.remoteMethod('verifyemail', {
    http: {
      path: '/verifyemail',
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
    description: 'Verify the identity of a user',
    returns: {
      "type": ["recover"],
      "root": true
    }
  });

  /**
   *
   * @param data
   * @returns {Promise<{otp: string}>}
   */
  Recover.resetpassword = async function (data) {
    const email = data.email;
    const otp = data.otp;
    const pwd = data.password;

    const VRecover = Recover.app.models.v_recover;
    const whereClause = {where: {and: [{email: email}, {otp:otp}]}};

    const responseData = await VRecover.find(whereClause);
    if(!responseData || responseData.length === 0){
      return {"otp" : "expired"};
    }
    //Externalize in a class of constants
    const saltRounds = 10;
    const bcrypt = require('bcrypt');
    const password = await bcrypt.hash(pwd, saltRounds);
    const User = Recover.app.models.user;
    const user = await User.findOne({where: {email: email}});
    if(!user){
      return {"otp" : "expired"};
    }
    await user.updateAttributes({"password": password})
    return {otp : otp, email: email };
  }
  Recover.remoteMethod('resetpassword', {
    http: {
      path: '/resetpassword',
      verb: 'post'
    },
    accepts: [{
      arg: 'data',
      description: "JSON data to reset the password",
      type: 'object',
      http: {
        source: 'body'
      },
      required: true
    }],
    description: 'Set the password as sent by user',
    returns: {
      "type": ["recover"],
      "root": true
    }
  });
};
