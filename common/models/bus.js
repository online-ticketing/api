'use strict';

const utils = require('../utils/apiUtils');
module.exports = function(Bus) {
  Bus.beforeRemote('**', async function(ctx) {
    const utils = require('../utils/apiUtils');
    const methodName = ctx.method.name.toLowerCase();
    const user = await utils.validUser(ctx);
    if (methodName === 'create') {
      ctx.req.body.created_by_id = user.id;
    }
    if (methodName === 'findbyid') {
      return;
    }
    return await utils.admin_authorization(ctx);
  });
};
