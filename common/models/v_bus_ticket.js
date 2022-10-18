'use strict';

const app = require('../../server/server');
module.exports = function(VBusTicket) {
  VBusTicket.beforeRemote('**', async function(ctx) {
    const utils = require('../utils/apiUtils');
    const user = await utils.validUser(ctx);

    const isAllowed = utils.isAllowed(user, ['MANAGER', 'ADMIN']);
    if (isAllowed) {
      return;
    }

    const methodName = ctx.method.name.toLowerCase();
    if (methodName === 'find') {
      let filter = ctx.args.filter || {};
      if (typeof filter === 'string') {
        filter = JSON.parse(filter);
      }
      //filter by user_id
      filter.where = {user_id: user.id};
      ctx.args.filter = filter;
      return;
    }
    if (methodName === 'findbybookingid') {
      //make sure the booking belongs to this user
      const Booking =  VBusTicket.app.models.booking;
      const booking = await Booking.findById(ctx.args.id);
      if (!booking) {
        throw new Error('You do not have access to this resource');
      }
      if (booking.passengerId === user.id) {//This user can view this booking
        return;
      }
    }
    return await utils.admin_authorization(ctx);
  });
  /**
   *
   * @returns {Promise<*>}
   */
  VBusTicket.findByBookingId = async function(booking_id) {
    try {
      const f = await VBusTicket.find({where: {booking_id: booking_id}});
      return f;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
  VBusTicket.remoteMethod('findByBookingId', {
    http: {
      path: '/findByBookingId/:id',
      verb: 'get',
    },
    description: 'return all tickets given a booking id',
    accepts: [
      {
        arg: 'id',
        description: 'ID of the resource to view in morpheus',
        type: 'number',
        required: true,
      },
    ],
    returns: {
      root: true, 'type': 'v_bus_ticket',
    },
  });
};
