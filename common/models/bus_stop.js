'use strict';

const utils = require('../utils/apiUtils');
module.exports = function(BusStop) {
  BusStop.beforeRemote('**', async function(ctx) {
    const utils = require('../utils/apiUtils');
    const methodName = ctx.method.name.toLowerCase();
    const user = await utils.validUser(ctx);
    if (methodName === 'find' || methodName === 'findbyid') {
      return;
    }
    if (methodName === 'create') {
      ctx.req.body.created_by_id = user.id;
    }

    //otherwise ypu must be an admin or manager
    return await utils.admin_authorization(ctx);
  });
};
