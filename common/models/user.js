'use strict';
const bcrypt = require('bcrypt');
const saltRounds = 10;
module.exports = function(User) {
  User.beforeRemote('**', async function(ctx) {
    const methodName = ctx.method.name;
    if (methodName.toLowerCase() === 'create') {
      let pwd = ctx.req.body.password;
      if (pwd) {
        pwd = await bcrypt.hash(pwd, saltRounds)
        ctx.req.body.password = pwd;
        const crypto = require("crypto");
        const api_key = crypto.randomBytes(20).toString('hex');
        ctx.req.body.api_key = api_key;
      }
    }
    const list = ['patchorcreate', 'find', 'replaceorcreate', 'deleteById'];
    const allow = ['create'];
    const user_admin = [
      'patchattributes',
      'findbyid',
      'exists',
      '__delete__bookings',
      'replacebyid',
      '__get__bookings',
      '__create__bookings',
      '__findById__bookings',
      '__updateById__bookings',
      '__destroyById__bookings',
      '__get__roles',
      '__create__roles',
    ];

    return;
  });
  /**
   *
   * @param data
   * @returns {Promise<*>}
   */
  User.login = async function (data) {
    try {
      console.log(data);
      const phone = data.contact_number;
      const password = data.password;
      const users = await User.find({where: {contact_number: phone}});
      if(users && users.length === 1){
        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
          throw new Error("phone/password did not match")
        }
      }else{
        throw new Error("phone/password did not match")
      }
      return "success";
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
