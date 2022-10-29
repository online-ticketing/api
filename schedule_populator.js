const gps_location = {
  lat: 0,
  lng: 0,
};
const app = require('./server/server');
const _ = require('underscore');
const moment = require('moment');
const loopback = require('loopback');


const runSqlFile = (sql_path) => {
  const Runner = require('run-my-sql-file');
  const config = require('config');
  Runner.connectionOptions({
    host: config.db.host,
    user: config.db.username,
    password: config.db.password,
  });
  return new Promise((resolve, reject) => {
    Runner.runFile(sql_path, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

const dropCreateTables = async function() {
  const sql_path = __dirname + '/sql/script_01.sql';
  const x = await runSqlFile(sql_path);
  return x;
};
const createUserRoles = async function(users, roles) {
  const UserRoleModel = app.models.user_role;
  const data = [];
  const q = _.findWhere(users, {email: 'jacob.asiedu@gmail.com'});
  const f = _.findWhere(users, {email: 'boakyef213@gmail.com'});

  const manager = _.findWhere(roles, {name: 'MANAGER'});
  data.push({roleId: manager.id, userId: q.id});

  const admin = _.findWhere(roles, {name: 'ADMIN'});
  data.push({roleId: admin.id, userId: q.id});

  const passenger = _.findWhere(roles, {name: 'PASSENGER'});
  data.push({roleId: passenger.id, userId: q.id});

  const driver = _.findWhere(roles, {name: 'DRIVER'});
  data.push({roleId: driver.id, userId: f.id});
  data.push({roleId: driver.id, userId: q.id});
  data.push({roleId: passenger.id, userId: f.id});
  const userRole = await UserRoleModel.create(data);
  return userRole;
};
const createRoles = async function(user_id) {
  const RoleModel = app.models.role;
  const roleString = ['MANAGER', 'BOOK_MAN', 'DRIVER', 'ADMIN', 'CONDUCTOR', 'PASSENGER'];
  const data = [];
  for (let role of roleString) {
    data.push({
      'name': role,
      'description': 'Some description',
      'created_by_id': user_id,
    });
  }
  const roles = await RoleModel.create(data);
  return roles;
};
const createUsers = async function() {
  const crypto = require('crypto');
  const utils = require('./common/utils/apiUtils');
  const pwdEncrypt = await utils.encrypt('Kwabenah2');

  const UserModel = app.models.user;
  const data = [
    {
      'full_name': 'Kwabena Asiedu',
      'contact_number': '6174819043',
      'email': 'jacob.asiedu@gmail.com',
      'password': pwdEncrypt,
      'account_status': 1,
      api_key: crypto.randomBytes(20).toString('hex'),
    },
    {
      'full_name': 'Frank Boakye',
      'contact_number': '0245666208',
      'email': 'boakyef213@gmail.com',
      'password': pwdEncrypt,
      'account_status': 1,
      api_key: crypto.randomBytes(20).toString('hex'),
    },
  ];
  const users = await UserModel.create(data);
  return users;
};
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

const fetchBusStops = function(user_id) {
  return [
    {
      'name': 'Kwame Nkrumah Circle, Dr. Busia Hwy, Accra, Ghana',
      'gps_location': {lat: 5.569984006856294, lng: -0.2154947295661747},
      'ghana_post_address': 'GP1',
      'status': 1,
      created_by_id: user_id,
      seq_order: 1,
      r: 'ACCRA-KUMASI',
    },
    {

      'name': 'Achimota Old Station Bus Stop, Accra, Ghana',
      'gps_location': {lat: 5.61699215168164, lng: -0.22966864491063455},
      'ghana_post_address': 'GP2',
      'status': 1,
      created_by_id: user_id,
      seq_order: 2,
      r: 'ACCRA-KUMASI',
    },
    {

      'name': 'China Mall Amasaman, PM8V+G82, Amasaman, Ghana',
      'gps_location': {lat: 5.715921183209992, lng: -0.30786651607441196},
      'ghana_post_address': 'GP3',
      'status': 1,
      created_by_id: user_id,
      seq_order: 3,
      r: 'ACCRA-KUMASI',
    },
    {

      'name': 'MEDIE, QM6G+RJW, Medie, Ghana',
      'gps_location': {lat: 5.7623153136965986, lng: -0.32337898723823644},
      'ghana_post_address': 'GP4',
      'status': 1,
      created_by_id: user_id,
      seq_order: 4,
      r: 'ACCRA-KUMASI',
    },
    {

      'name': 'Teye Lawer Ent., RJ9W+MCR, Nsawam Road, Nsawam, Ghana',
      'gps_location': {lat: 5.819493687316645, lng: -0.35392898723819066},
      'ghana_post_address': 'GP5',
      'status': 1,
      created_by_id: user_id,
      seq_order: 5,
      r: 'ACCRA-KUMASI',
    },
    {

      'name': 'MCANIM SERVICE STATION, Nsawam - Suhum Rd, Teacher Mante, Ghana',
      'gps_location': {lat: 5.9001940957840775, lng: -0.3878769449103359},
      'ghana_post_address': 'GP6',
      'status': 1,
      created_by_id: user_id,
      seq_order: 6,
      r: 'ACCRA-KUMASI',
    },
    {

      'name': 'Asuboi Health centre,Asuboe, Ghana',
      'gps_location': {lat: 5.951237642096986, lng: -0.4151194737464036},
      'ghana_post_address': 'GP7',
      'status': 1,
      created_by_id: user_id,
      seq_order: 7,
      r: 'ACCRA-KUMASI',
    },
    {

      'name': 'Sankofa filling Station,Amanase, Ghana',
      'gps_location': {lat: 6.000109377161529, lng: -0.4324451449102176},
      'ghana_post_address': 'GP8',
      'status': 1,
      created_by_id: user_id,
      seq_order: 8,
      r: 'ACCRA-KUMASI',
    },
    {
      name: 'Asafo Market, Nhyiaeso, Kumasi, Ghana',
      gps_location: {lat: 6.673774886386574, lng: -1.6165512449092443},
      ghana_post_address: 'GP9',
      status: 1,
      created_by_id: user_id,
      seq_order: 9.,
      r: 'ACCRA-KUMASI',
    },
    {

      'name': 'Asafo Market, Nhyiaeso, Kumasi, Ghana',
      'gps_location': {lat: 6.673774886386574, lng: -1.6165512449092443},
      'ghana_post_address': 'GP10',
      'status': 1,
      created_by_id: user_id,
      seq_order: 1.,
      r: 'KUMASI-ACCRA',
    },
    {

      'name': 'Hotel Georgia, Ahodwo Round About, Southern By-Pass, Kumasi, Ghana',
      'gps_location': {lat: 6.669632288462265, lng: -1.6153895025815086},
      'ghana_post_address': 'GP11',
      'status': 1,
      created_by_id: user_id,
      seq_order: 2,
      r: 'KUMASI-ACCRA',
    },
    {

      'name': 'Kumasi City Mall, Lake Rd, Kumasi, Ghana',
      'gps_location': {lat: 6.671567543682903, lng: -1.6070654449092332},
      'ghana_post_address': 'GP12',
      'status': 1,
      seq_order: 3,
      created_by_id: user_id,
      r: 'KUMASI-ACCRA',
    },
    {

      'name': 'Tech Junction overpass bridge, MCPG+PFG, Ejisu Road, Kumasi, Ghana',
      'gps_location': {lat: 6.687013800478961, lng: -1.5738236890898323},
      'ghana_post_address': 'GP13',
      'status': 1,
      seq_order: 4,
      created_by_id: user_id,
      r: 'KUMASI-ACCRA',
    },
    {

      'name': 'Kindle Organic, Ejisu Kwamu main road, beside Kwamu Chief\'s Palace Digital Address: AE-0197-3789, Kumasi, Ghana',
      'gps_location': {lat: 6.716302620216888, lng: -1.5030155872369322},
      'ghana_post_address': 'GP14',
      'status': 1,
      created_by_id: user_id,
      seq_order: 5,
      r: 'KUMASI-ACCRA',
    },
    {
      'name': 'Anita Hotel, Kumasi, Konongo - Ejisu Rd, Ghana',
      'gps_location': {lat: 6.725698305253024, lng: -1.459199616073042},
      'ghana_post_address': 'GP15',
      'status': 1,
      created_by_id: user_id,
      seq_order: 6,
      r: 'KUMASI-ACCRA',
    },
    {
      'name': 'Pacific filling station, MJ7P+W9, Kubease, Ghana',
      'gps_location': {lat: 6.6650577907529165, lng: -1.363961629564786},
      'ghana_post_address': 'GP16',
      'status': 1,
      created_by_id: user_id,
      seq_order: 7,
      r: 'KUMASI-ACCRA',
    },
    {
      'name': 'Konongo Market, Konongo, Ghana',
      'gps_location': {lat: 6.623960954040001, lng: -1.2113609872370985},
      'ghana_post_address': 'GP17',
      'status': 1,
      created_by_id: user_id,
      seq_order: 8,
      r: 'KUMASI-ACCRA',
    },
    {
      'name': 'JULAN HOTEL, HVRM+PCW, Atwedie Road, Juaso, Ghana',
      'gps_location': {lat: 6.592116527066808, lng: -1.1163967737455047},
      'ghana_post_address': 'GP18',
      'status': 1,
      created_by_id: user_id,
      seq_order: 9,
      r: 'KUMASI-ACCRA',
    },
    {
      'name': 'Kwame Nkrumah Circle, Dr. Busia Hwy, Accra, Ghana',
      'gps_location': {lat: 5.569984006856294, lng: -0.2154947295661747},
      'ghana_post_address': 'GP19',
      'status': 1,
      created_by_id: user_id,
      seq_order: 10,
      r: 'KUMASI-ACCRA',
    },
  ];
};
const generateBusStops = async function(user_id) {
  const BusStopModel = app.models.bus_stop;
  const data = fetchBusStops(user_id);
  const busStops = await BusStopModel.create(data);
  return busStops;
};
const generateRouteBusStop = async function(routes, bus_stops) {
  const data = fetchBusStops('foo');
  console.log(data);
  const payload = [];
  for (let route of routes) {
    const route_id = route.id;
    const busStops = _.where(data, {r: route.name});

    for (let busStop of busStops) {
      const foundBS = _.findWhere(bus_stops, {ghana_post_address: busStop.ghana_post_address});
      const bus_stop_id = foundBS.id;
      const py = {
        'seq_order': busStop.seq_order,
        'routeId': route_id,
        'busStopId': bus_stop_id,
      };
      payload.push(py);
    }
  }
  const RouteBusStopModel = app.models.route_bus_stop;
  const x = RouteBusStopModel.create(payload);
  return x;
};
const generateBuses = async function(num_buses, user_id) {
  const data = [];
  for (let index = 0; index < num_buses; index++) {
    const bus_no = 'A' + (index + 1);
    const plate_no = 'AZ 10' + index;
    const payload = {
      bus_number: bus_no,
      gps_location: gps_location,
      plate_number: plate_no,
      capacity: 60,
      status: 1,
      created_by_id: user_id,
    };
    data.push(payload);
  }
  const BusModel = app.models.bus;
  const x = await BusModel.create(data);
  return x;
};
const getRoutes = function(user_id) {
  return [
    {
      name: 'ACCRA-KUMASI',
      fare: 70,
      created_by_id: user_id,
    },
    {
      name: 'KUMASI-ACCRA',
      fare: 70,
      created_by_id: user_id,
    },
  ];
};
const generateRoutes = async function(user_id) {
  const data = getRoutes(user_id);
  const RouteModel = app.models.route;
  const x = await RouteModel.create(data);
  return x;
};

const runD = async function() {
  try {
    const xc = await dropCreateTables();
    const users = await createUsers();
    const user = _.findWhere(users, {email: 'jacob.asiedu@gmail.com'});
    const roles = await createRoles(user.id);
    await createUserRoles(users, roles);
    let promises = [];
    const num_buses = 28;
    promises.push(generateRoutes(user.id));
    promises.push(generateBuses(num_buses, user.id));
    promises.push(generateBusStops(user.id));
    let responses = await Promise.all(promises);
    const routes = responses[0];
    const buses = responses[1];
    const busStops = responses[2];

    promises = [];
    promises.push(generateSchedules(routes, buses, user.id));
    promises.push(generateRouteBusStop(routes, busStops));
    responses = await Promise.all(promises);
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


