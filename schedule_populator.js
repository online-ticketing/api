//const fetch = require('node-fetch');
const gps_location = {
  lat: 0,
  lng: 0,
};
const app = require('./server/server');
const _ = require('underscore');
const moment = require('moment');
const generateSchedules = async function(routes, buses,user_id) {
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
      promises.push(generateBusSchedules(evenBuses,driver.userId,route.id,user_id));
    }else{
      promises.push(generateBusSchedules(oddBuses,driver.userId,route.id,user_id));
    }
  }
  await Promise.all(promises);
  return "done";
};
const generateBusSchedules = async function(buses, driver_id, route_id,user_id) {

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
      'gps_location': gps_location,
      'ghana_post_address': 'GP1',
      'status': 1,
      created_by_id: user_id,
      seq_order: 1,
      r: 'ACCRA-KUMASI',
    },
    {
      'name': 'Achimota Old Station Bus Stop, Accra, Ghana',
      'gps_location': gps_location,
      'ghana_post_address': 'GP2',
      'status': 1,
      created_by_id: user_id,
      seq_order: 2,
      r: 'ACCRA-KUMASI',
    },
    {
      'name': 'China Mall Amasaman, PM8V+G82, Amasaman, Ghana',
      'gps_location': gps_location,
      'ghana_post_address': 'GP3',
      'status': 1,
      created_by_id: user_id,
      seq_order: 3,
      r: 'ACCRA-KUMASI',
    },
    {
      'name': 'MEDIE, QM6G+RJW, Medie, Ghana',
      'gps_location': gps_location,
      'ghana_post_address': 'GP4',
      'status': 1,
      created_by_id: user_id,
      seq_order: 4,
      r: 'ACCRA-KUMASI',
    },
    {
      'name': 'Teye Lawer Ent., RJ9W+MCR, Nsawam Road, Nsawam, Ghana',
      'gps_location': gps_location,
      'ghana_post_address': 'GP5',
      'status': 1,
      created_by_id: user_id,
      seq_order: 5,
      r: 'ACCRA-KUMASI',
    },
    {
      'name': 'MCANIM SERVICE STATION, Nsawam - Suhum Rd, Teacher Mante, Ghana',
      'gps_location': gps_location,
      'ghana_post_address': 'GP6',
      'status': 1,
      created_by_id: user_id,
      seq_order: 6,
      r: 'ACCRA-KUMASI',
    },
    {
      'name': 'Asuboi Health centre,Asuboe, Ghana',
      'gps_location': gps_location,
      'ghana_post_address': 'GP7',
      'status': 1,
      created_by_id: user_id,
      seq_order: 7,
      r: 'ACCRA-KUMASI',
    },
    {
      'name': 'Sankofa filling Station,Amanase, Ghana',
      'gps_location': gps_location,
      'ghana_post_address': 'GP8',
      'status': 1,
      created_by_id: user_id,
      seq_order: 8,
      r: 'ACCRA-KUMASI',
    },
    {
      'name': 'Asafo Market, Nhyiaeso, Kumasi, Ghana',
      'gps_location': gps_location,
      'ghana_post_address': 'GP10',
      'status': 1,
      created_by_id: user_id,
      seq_order: 1.,
      r: 'KUMASI-ACCRA',
    },
    {
      'name': 'Hotel Georgia, Ahodwo Round About, Southern By-Pass, Kumasi, Ghana',
      'gps_location': gps_location,
      'ghana_post_address': 'GP11',
      'status': 1,
      created_by_id: user_id,
      seq_order: 2,
      r: 'KUMASI-ACCRA',
    },
    {
      'name': 'Kumasi City Mall, Lake Rd, Kumasi, Ghana',
      'gps_location': gps_location,
      'ghana_post_address': 'GP12',
      'status': 1,
      seq_order: 3,
      created_by_id: user_id,
      r: 'KUMASI-ACCRA',
    },
    {
      'name': 'Tech Junction overpass bridge, MCPG+PFG, Ejisu Road, Kumasi, Ghana',
      'gps_location': gps_location,
      'ghana_post_address': 'GP13',
      'status': 1,
      seq_order: 4,
      created_by_id: user_id,
      r: 'KUMASI-ACCRA',
    },
    {
      'name': 'Kindle Organic, Ejisu Kwamu main road, beside Kwamu Chief\'s Palace Digital Address: AE-0197-3789, Kumasi, Ghana',
      'gps_location': gps_location,
      'ghana_post_address': 'GP14',
      'status': 1,
      created_by_id: user_id,
      seq_order: 5,
      r: 'KUMASI-ACCRA',
    },
    {
      'name': 'Anita Hotel, Kumasi, Konongo - Ejisu Rd, Ghana',
      'gps_location': gps_location,
      'ghana_post_address': 'GP15',
      'status': 1,
      created_by_id: user_id,
      seq_order: 6,
      r: 'KUMASI-ACCRA',
    },
    {
      'name': 'Pacific filling station, MJ7P+W9, Kubease, Ghana',
      'gps_location': gps_location,
      'ghana_post_address': 'GP16',
      'status': 1,
      created_by_id: user_id,
      seq_order: 7,
      r: 'KUMASI-ACCRA',
    },
    {
      'name': 'Konongo Market, Konongo, Ghana',
      'gps_location': gps_location,
      'ghana_post_address': 'GP17',
      'status': 1,
      created_by_id: user_id,
      seq_order: 8,
      r: 'KUMASI-ACCRA',
    },
    {
      'name': 'JULAN HOTEL, HVRM+PCW, Atwedie Road, Juaso, Ghana',
      'gps_location': gps_location,
      'ghana_post_address': 'GP18',
      'status': 1,
      created_by_id: user_id,
      seq_order: 9,
      r: 'KUMASI-ACCRA',
    },
    {
      'name': 'Kwame Nkrumah Circle, Dr. Busia Hwy, Accra, Ghana',
      'gps_location': gps_location,
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
  const payload = [];
  for (let route of routes) {
    const route_id = route.id;
    const busStops = _.where(data, {r: route.name});
    for (let busStop of busStops) {
      const foundBS = _.findWhere(bus_stops, {ghana_post_address: busStop.ghana_post_address});
      const bus_id = foundBS.id;
      const py = {
        'seq_order': busStop.seq_order,
        'routeId': route_id,
        'busStopId': bus_id,
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
    const UserModel = app.models.user;
    const user = await UserModel.findOne({where: {email: 'jacob.asiedu@gmail.com'}});
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
    promises.push(generateSchedules(routes,buses,user.id));
    promises.push(generateRouteBusStop(routes, busStops));
    responses = await Promise.all(promises);
    console.log("done");
    return "done"
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
// const buses = [];
// for (let index = 1; index <= 13; index++) {
//   buses.push(index);
// }
// const p = generateBusSchedules(buses, 1, 2);
// console.log(p);


