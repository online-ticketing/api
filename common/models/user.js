'use strict';

module.exports = function(User) {
    //?access_token=adfdafda
  User.beforeRemote("**", async function (ctx, ununsed) {
    let api_key = ctx.req.headers.access_token || ctx.req.query.access_token || ctx.req.body.access_token;
    //create if no api key allow
    console.log("api_key",api_key);
    const methodName = ctx.method.name;
    const list = ["patchorcreate","find","replaceorcreate","deleteById"]
    const allow = ["create"];
    const user_admin= [
      "patchattributes",
      'findbyid',
      'exists',
      '__delete__bookings',
      'replacebyid',
      '__get__bookings',
      '__create__bookings',
      '__findById__bookings',
      '__updateById__bookings',
      '__destroyById__bookings',
      '__get__roles',
      '__create__roles'
    ];

    console.log("methodName",methodName);
    return;
  });
};
