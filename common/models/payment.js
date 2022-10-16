'use strict';

const utils = require('../utils/apiUtils');
const _ = require('underscore');
const crypto = require('crypto');
module.exports = function(Payment) {
  Payment.beforeRemote('**', async function(ctx) {
    const methodName = ctx.method.name.toLowerCase();
    const utils = require('../utils/apiUtils');
    //validate that there is an api key and that it is valid
    const user = await utils.validUser(ctx);
    if (methodName === 'create') {
      ctx.req.body.passengerId = user.id;
      return;
    }

    //  Ypu are a valid user, so you can create a ticket
    const isAllowed = utils.isAllowed(user, ['MANAGER', 'ADMIN']);
    if (isAllowed) {
      return;
    }

    //A user should be able to only see their own bookings
    //Admins see everything
    if (methodName === 'find' || methodName=== 'findbyid') {
      if (methodName=== 'findbyid') {
        const payment = await Payment.findById(ctx.args.id);
        if(payment && (payment.passengerId === user.id)){
          return;
        }
        else{
          throw new Error('You don\'t have permission to perform this action on this resource.');
        }
      } else {//add the passenger Id to this resource
        let filter = ctx.args.filter || {};
        if (typeof filter === 'string') {
          filter = JSON.parse(filter);
        }
        filter.where = {passengerId: user.id};
        ctx.args.filter = filter;
      }
    }else{
      return await utils.admin_authorization(ctx);
    }
    return;
  });
};
