'use strict';

module.exports = function(VBusRoute) {
  VBusRoute.beforeRemote('**', async function(ctx) {
    const utils = require('../utils/apiUtils');
    await utils.validUser(ctx);

    const methodName = ctx.method.name.toLowerCase();
    if(methodName === "find"){
      return;
    }
    throw (methodName + " not yet implemented!!")
  });
};
