'use strict';
const bcrypt = require('bcrypt');
const saltRounds = 10;
module.exports = function(User) {
  User.beforeRemote('**', async function(ctx) {
    const methodName = ctx.method.name.toLowerCase();
    if (methodName === 'create') {
      let pwd = ctx.req.body.password;
      if (pwd) {
        pwd = await bcrypt.hash(pwd, saltRounds)
        ctx.req.body.password = pwd;
        const crypto = require("crypto");
        const api_key = crypto.randomBytes(20).toString('hex');
        ctx.req.body.api_key = api_key;
      }
      return;
    }
    if (methodName === 'login') {
      return;
    }
    //Only admins/managers should be able to access this resource
    const utils = require("../utils/apiUtils");
    return await utils.admin_authorization(ctx);
  });
  /**
   *
   * @param data
   * @returns {Promise<*>}
   */
  User.login = async function (data) {
    try {
      const phone = data.contact_number;
      const password = data.password;
      const users = await User.find({where: {contact_number: phone}});
      if(users && users.length === 1){
        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
          throw new Error("phone/password did not match")
        }
        return {phone : user.contact_number, full_name: user.full_name, api_key: user.api_key};
      }else{
        throw new Error("phone/password did not match")
      }
    } catch (error) {
      console.log(error)
      throw error
    }
  }
  User.remoteMethod('login', {
    http: {
      path: '/login',
      verb: 'post'
    },
    accepts: [{
      arg: 'data',
      description: "JSON data to validate user login",
      type: 'object',
      http: {
        source: 'body'
      },
      required: true
    }],
    description: 'Check user name and password and login if successful',
    returns: {
      root: true, "type": "object"
    }
  });
};
