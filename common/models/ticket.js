'use strict';

const utils = require('../utils/apiUtils');
module.exports = function(Ticket) {
  Ticket.beforeRemote('**', async function(ctx) {
    const methodName = ctx.method.name.toLowerCase();
    const utils = require('../utils/apiUtils');

    //validate that there is an api key and that it is valid
    const user = await utils.validUser(ctx);

    //  Ypu are a valid user, so you can create a ticket
    if (methodName === 'create') {
      const crypto = require("crypto");
      ctx.req.body.serial_number = crypto.randomBytes(16).toString("hex");
      ctx.req.body.passengerId = user.id;
      ctx.req.body.seat_number = Math.floor(Math.random() * 60) + 1
      return;
    }

    //A user should be able to only see their own bookings
    //Admins see everything
    if (methodName === 'find' || methodName === 'findbyid') {
      const isAllowed = utils.isAllowed(user, ['MANAGER', 'ADMIN']);
      if (isAllowed) {
        return;
      }
      if (methodName === 'findbyid') {
        //only the owner can view this resource
        const ticket = await Ticket.findById(ctx.args.id);
        if(ticket && (ticket.passengerId === user.id)){
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
        //filter by passengerId
        filter.where = {passengerId: user.id};
        ctx.args.filter = filter;
      }
    }else{
      return await utils.admin_authorization(ctx);
    }
    return;
  });
};
