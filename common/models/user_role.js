'use strict';

module.exports = function(UserRole) {
  UserRole.beforeRemote('**', async function(ctx) {
    const utils = require("../utils/apiUtils");
    return await utils.admin_authorization(ctx);
  });
};
