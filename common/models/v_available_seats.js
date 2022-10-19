'use strict';

module.exports = function(VAvailableSeats) {
  VAvailableSeats.beforeRemote('**', async function(ctx) {
    const methodName = ctx.method.name.toLowerCase();
    if (methodName.startsWith("find")) {
      return;
    }
    const utils = require('../utils/apiUtils');
    return await utils.admin_authorization(ctx);
  });
};
