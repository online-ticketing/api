'use strict';

const utils = require('../utils/apiUtils');
module.exports = function(Role) {
  Role.beforeRemote('**', async function(ctx) {
    const utils = require('../utils/apiUtils');
    const user = await utils.validUser(ctx);
    const methodName = ctx.method.name.toLowerCase();
    if (methodName === 'create') {
      ctx.req.body.created_by_id = user.id;
    }
    return await utils.admin_authorization(ctx);
  });
};
