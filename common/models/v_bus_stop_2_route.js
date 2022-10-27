'use strict';
module.exports = function(Model) {

  Model.beforeRemote('**', async function(ctx) {
    const methodName = ctx.method.name.toLowerCase();
    if (methodName.startsWith('findbyrouteid')) {
      return;
    }
    const utils = require('../utils/apiUtils');
    return await utils.admin_authorization(ctx);
  });
  /**
   *
   * @returns {Promise<*>}
   */
  Model.findByRouteId = async function(route_id) {
    try {
      const f = await Model.find({where: {route_id: route_id}});
      return f;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
  Model.remoteMethod('findByRouteId', {
    http: {
      path: '/findByRouteId/:id',
      verb: 'get',
    },
    description: 'return all routes given id',
    accepts: [
      {
        arg: 'id',
        description: 'ID of the route',
        type: 'number',
        required: true,
      },
    ],
    returns: {
      root: true, 'type': 'v_bus_stop_2_route',
    },
  });
};
