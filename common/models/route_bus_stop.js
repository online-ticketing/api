'use strict';

module.exports = function(RouteBusStop) {
  RouteBusStop.beforeRemote('**', async function(ctx) {
    const utils = require("../utils/apiUtils");
    return await utils.admin_authorization(ctx);
  });
};
