'use strict';

const utils = require('../utils/apiUtils');
module.exports = function(Route) {
  Route.beforeRemote('**', async function(ctx) {
    const methodName = ctx.method.name.toLowerCase();
    const utils = require('../utils/apiUtils');
    const user = await utils.validUser(ctx);
    //You can only see your own payments

    if (methodName === 'find' || methodName === 'findbyid') {
      return;
    }
    if (methodName === 'create') {
      ctx.req.body.created_by_id = user.id;
    }
    return await utils.admin_authorization(ctx);
  });
};
