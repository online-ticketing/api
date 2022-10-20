const gps_location = {
  lat: 0,
  lng: 0,
};
const app = require('./server/server');
const _ = require('underscore');
const moment = require('moment');

const generateSchedules = async function(routes, buses, user_id) {
  const RoleModel = app.models.role;
  const UserRoleModel = app.models.user_role;
  const driverRole = await RoleModel.findOne({where: {name: 'DRIVER'}});
  const drivers = await UserRoleModel.find({where: {roleId: driverRole.id}});
  //there should be two drivers and two routes each driver takes a route

  const evenBuses = buses.filter((value, i) => {
    if (i % 2 === 0) {
      return value;
    }
  });

  const oddBuses = buses.filter((value, i) => {
    if (i % 2 != 0) {
      return value;
    }
  });
  const promises = [];
  for (let index = 0; index < routes.length; index++) {
    const route = routes[index];
    const driver = drivers[index];
    if (index % 2 === 0) {
      promises.push(generateBusSchedules(evenBuses, driver.userId, route.id, user_id));
    } else {
      promises.push(generateBusSchedules(oddBuses, driver.userId, route.id, user_id));
    }
  }
  await Promise.all(promises);
  return 'done';
};
const generateBusSchedules = async function(buses, driver_id, route_id, user_id) {

  const year = moment().format('YYYY');
  const month = moment().format('MM');
  const day = moment().format('DD');

  const schedule_date = new Date(parseInt(year), (parseInt(month) - 1), parseInt(day));
  const schedules = [];
  for (let index = 1; index <= buses.length; index++) {
    const bus = buses[index - 1];
    const departure_time = moment(schedule_date).add((index), 'hours');
    const estimated_arrival_time = moment(departure_time).add(5, 'hours');
    const schedule = {
      bus_id: bus.id,
      created_by_id: user_id,
      driver_id: driver_id,
      route_id: route_id,
      schedule_date: toISOLocal(schedule_date),
      departure_time: departure_time.toISOString(),
      estimated_arrival_time: estimated_arrival_time.toISOString(),
    };
    schedules.push(schedule);
  }

  const BusScheduleModel = app.models.bus_schedule;
  const x = await BusScheduleModel.create(schedules);
  return x;
};

function toISOLocal(d) {
  var z = n => ('0' + n).slice(-2);
  var zz = n => ('00' + n).slice(-3);
  var off = d.getTimezoneOffset();
  var sign = off > 0 ? '-' : '+';
  off = Math.abs(off);

  return d.getFullYear() + '-'
    + z(d.getMonth() + 1) + '-' +
    z(d.getDate());
}

const runD = async function() {
  try {
    const UserModel = app.models.user;
    const RouteModel = app.models.route;
    const BusModel = app.models.bus;
    const promises = [];
    promises.push(UserModel.findOne({where: {email: 'jacob.asiedu@gmail.com'}}));
    promises.push(RouteModel.find({}));
    promises.push(BusModel.find({}));
    const responses = await Promise.all(promises);

    const buses = responses[2];
    const routes = responses[1];
    const user = responses[0];
    await generateSchedules(routes, buses, user.id);
    return 'done';
  } catch (er) {
    console.error(er);
  }
};
const p = runD();
p.then(function(r) {
  console.log(r);
}).catch(function(err) {
  console.log(err);
}).finally(function(x) {
  process.exit();
});


