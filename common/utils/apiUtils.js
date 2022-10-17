const config = require('config');

const self = module.exports = {
  /**
   *
   * @param otp
   * @returns {Promise<void>}
   */
  otpEmail : async function(options) {
    const Mailjet = require('node-mailjet');
    const config = require('config');

    if(config.mail_jet.no_email){//if a config flag is set we will just skip. Especially in development
      console.log("Skipping email")
      return {"success" : "success"};
    }
    const mailjet = new Mailjet({
      apiKey: config.mail_jet.api_key,
      apiSecret: config.mail_jet.api_secret,
    });
    const request = mailjet.post('send', {'version': 'v3.1'}).request({
      Messages: [
        {
          From: {
            Email: config.user_email,
            Name: 'Frank',
          },
          To: [
            {
              Email: options.email,
              Name: options.full_name,
            },
          ],
          Subject: 'Online Ticketing Service',
          TextPart: 'OTP request',
          HTMLPart: "<h3>Dear " + options.full_name + ",<br/><p>You requested for a new OTP from our Mobile APP</p> <p> Your new 4 digit OTP is: " +
            "<b>" + options.otp  + "</b></p><br/> Thanks, <br/> Online Ticketing Office" ,
          'CustomID': 'Testing app',
        },
      ],
    });
    request.then((result) => {
      console.log(result.body);
      return {"success" : "success"}
    }).catch((err) => {
      console.log(err.statusCode);
      return {"success" : "failed"}
    });
  },
  /**
   * Does this user have at least one of these roles
   * @param model
   * @param userRoles
   * @returns {null|*}
   */
  isAllowed: function(model, userRoles) {
    const _ = require('underscore');
    const modelJSON = model.toJSON();
    if (modelJSON.roles && modelJSON.roles.length > 0) {
      return _.find(userRoles, function(role) {
        return _.findWhere(modelJSON.roles, {name: role});
      });
    } else {
      return null;
    }

  },
  hasApiKey : function(ctx){
    const req = ctx.req;
   return req.headers['api_key'] || req.query.api_key || req.body.api_key
     | req.headers['access_token'] || req.query.access_token || req.body.access_token;
  },
  /**
   *
   * @param user_key
   * @param allowedRoles
   * @returns {Promise<boolean>}
   */
  validUser: async function(ctx) {
    const app = require('../../server/server');
    try {
      const api_key = self.hasApiKey(ctx);
      if(!api_key){
        throw new Error('API key required.');
      }
      const user = await app.models.User.findOne({
        where: {api_key: api_key},
        include: ['roles']
      });
      if (!user) {
        throw new Error('Invalid API key.');
      }
      return user;
    } catch (ee) {
      throw ee;
    }
  },
  /**
   *
   * @param user_key
   * @param allowedRoles
   * @returns {Promise<boolean>}
   */
  hasPermission: async function(ctx, allowedRoles) {
    try {
      const user = await self.validUser(ctx)
      const isAllowed = self.isAllowed(user, allowedRoles);
      if (isAllowed) {
        return true;
      }
      throw new Error('You don\'t have access to this resource.');
    } catch (ee) {
      throw ee;
    }
  },
  /**
   *
   * @param ctx
   * @returns {Promise<boolean>}
   */
  admin_authorization: async function(ctx) {
    const api_key = self.hasApiKey(ctx);
    if (api_key) {
      return await self.hasPermission(ctx, ['MANAGER', 'ADMIN']);
    } else {
      throw new Error('You don\'t have access to this resource.');
    }
  },
};
module.exports = self;
