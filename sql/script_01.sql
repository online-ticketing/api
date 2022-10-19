-- -----------------------------------------------------
-- Schema online_ticketing
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `online_ticketing` ;

-- -----------------------------------------------------
-- Schema online_ticketing
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `online_ticketing`;


CREATE TABLE IF NOT EXISTS `online_ticketing`.`user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(50) NOT NULL,
  `contact_number` varchar(10) NOT NULL,
  `email` varchar(30) DEFAULT NULL,
  `password` varchar(100) NOT NULL,
  `api_key` VARCHAR(45) NOT NULL,
  `account_status` int NOT NULL DEFAULT '0',
  `date_created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_modified` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `contact_number_UNIQUE` (`contact_number`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `api_key_UNIQUE` (`api_key`)
);

CREATE TABLE IF NOT EXISTS `online_ticketing`.`role` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `created_by_id` int NOT NULL,
  `description` varchar(100) NOT NULL,
  `date_created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_modified` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`),
  KEY `fk_user_id2_idx` (`created_by_id`),
  CONSTRAINT `fk_user_id2` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `online_ticketing`.`user_role` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_id` int NOT NULL,
  `user_id` int NOT NULL,
  `date_created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_modified` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_user_uq` (`role_id`,`user_id`),
  KEY `role_id` (`role_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_role_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`),
  CONSTRAINT `user_role_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
);

CREATE TABLE IF NOT EXISTS `online_ticketing`.`bus` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bus_number` varchar(15) NOT NULL,
  `plate_number` varchar(15) NOT NULL,
  `capacity` int NOT NULL,
  `gps_location` point NOT NULL,
  `created_by_id` int NOT NULL,
  `date_created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_modified` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `plate_number_UNIQUE` (`plate_number`),
  KEY `user_id` (`created_by_id`),
  CONSTRAINT `bus_ibfk_1` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `online_ticketing`.`bus_stop` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `gps_location` point NOT NULL,
  `ghana_post_address` varchar(30) NOT NULL,
  `created_by_id` int NOT NULL,
  `date_created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_modified` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ghana_post_address_UNIQUE` (`ghana_post_address`),
  KEY `user_id` (`created_by_id`),
  CONSTRAINT `bus_stop_ibfk_1` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`)
);

CREATE TABLE IF NOT EXISTS `online_ticketing`.`route` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `created_by_id` int NOT NULL,
  `date_created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_modified` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `fare` float NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`),
  KEY `created_by_user_id` (`created_by_id`),
  CONSTRAINT `route_ibfk_1` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`)
);

CREATE TABLE IF NOT EXISTS `online_ticketing`.`route_bus_stop` (
  `id` int NOT NULL AUTO_INCREMENT,
  `seq_order` varchar(30) NOT NULL,
  `route_id` int NOT NULL,
  `bus_stop_id` int NOT NULL,
  `date_created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_modified` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `bus_stop_route_uq` (`route_id`,`bus_stop_id`),
  KEY `bus_stop_id` (`bus_stop_id`),
  KEY `route_id` (`route_id`),
  CONSTRAINT `route_bus_stop_ibfk_1` FOREIGN KEY (`bus_stop_id`) REFERENCES `bus_stop` (`id`),
  CONSTRAINT `route_bus_stop_ibfk_2` FOREIGN KEY (`route_id`) REFERENCES `route` (`id`)
);

CREATE TABLE IF NOT EXISTS `online_ticketing`.`bus_schedule` (
  `id` int NOT NULL AUTO_INCREMENT,
  `schedule_date` date NOT NULL,
  `departure_time` timestamp NOT NULL,
  `estimated_arrival_time` timestamp NULL DEFAULT NULL,
  `note` longtext,
  `bus_id` int NOT NULL,
  `driver_id` int NOT NULL,
  `route_id` int NOT NULL,
  `created_by_id` int NOT NULL,
  `date_created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_modified` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `bus_id` (`bus_id`),
  KEY `route_id` (`route_id`),
  KEY `user_id` (`created_by_id`),
  KEY `bus_schedule_lbfk_6` (`driver_id`),
  CONSTRAINT `bus_schedule_ibfk_2` FOREIGN KEY (`bus_id`) REFERENCES `bus` (`id`),
  CONSTRAINT `bus_schedule_ibfk_4` FOREIGN KEY (`route_id`) REFERENCES `route` (`id`),
  CONSTRAINT `bus_schedule_ibfk_5` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`),
  CONSTRAINT `bus_schedule_lbfk_6` FOREIGN KEY (`driver_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `online_ticketing`.`booking` (
  `id` int NOT NULL AUTO_INCREMENT,
  `status` int NOT NULL,
  `user_id` int NOT NULL,
  `bus_stop_id` int NOT NULL,
  `bus_schedule_id` int NOT NULL,
  `date_created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_modified` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `number_of_seats` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `bus_stop_id` (`bus_stop_id`),
  KEY `bus_schedule_id` (`bus_schedule_id`),
  CONSTRAINT `booking_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `booking_ibfk_2` FOREIGN KEY (`bus_stop_id`) REFERENCES `bus_stop` (`id`),
  CONSTRAINT `booking_ibfk_3` FOREIGN KEY (`bus_schedule_id`) REFERENCES `bus_schedule` (`id`)
);

CREATE TABLE IF NOT EXISTS `online_ticketing`.`payment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `amount_paid` float NOT NULL,
  `payment_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `payment_method` varchar(30) NOT NULL,
  `booking_id` int NOT NULL,
  `created_by_id` int DEFAULT NULL,
  `last_modified` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `date_created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `note` longtext,
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  KEY `user_id` (`created_by_id`),
  CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`id`),
  CONSTRAINT `payment_ibfk_2` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`)
);


CREATE TABLE IF NOT EXISTS `online_ticketing`.`ticket` (
  `id` int NOT NULL AUTO_INCREMENT,
  `seat_number` int NOT NULL,
   `user_id` int NOT NULL,
  `serial_number` varchar(150) NOT NULL,
  `booking_id` int NOT NULL,
  `date_created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_modified` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
   KEY `user_id` (`user_id`),
  UNIQUE KEY `serial_number_UNIQUE` (`serial_number`),
  KEY `booking_id` (`booking_id`),
   CONSTRAINT `ticket_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `ticket_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`id`)
);

CREATE TABLE `online_ticketing`.`recoveries`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(45) NOT NULL,
  `expiry` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `otp` varchar(5) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_r_expiry` (`expiry`)
);
-- insert users
INSERT INTO `online_ticketing`.`user` (`full_name`,`contact_number`,`email`,`password`,`account_status`,`api_key`)
VALUES("Kwabena Asiedu","6174819043","jacob.asiedu@gmail.com","$2a$10$ZldWMzJiLeoUlyyFOxiiPeVmROBYsY3V7f/NXw.rIywfZDbrlP8eS",1,'xxxxxxxxx1'),
("Frank Boakye","0245666208","boakyef213@gmail.com","$2a$10$ZldWMzJiLeoUlyyFOxiiPeVmROBYsY3V7f/NXw.rIywfZDbrlP8eS",1,'xxxxxxxxx2');

-- Insert Drivers, Managers and Admin
INSERT INTO `online_ticketing`.`role` (`name`,`created_by_id`,`description`)
VALUES("MANAGER",1,"The Manager Role"),("BOOK_MAN",1,"The Book man Role"),("DRIVER",1,"The Driver Role"),("ADMIN",1,"The System Administrative Role"),("CONDUCTOR",1,"The Conductor Role"),("PASSENGER",1,"The passenger Role");

INSERT INTO `online_ticketing`.`user_role` (`user_id`,`role_id`)
select distinct u.id as user_id, r.id as role_id
from online_ticketing.user u cross join online_ticketing.role r
where u.email='jacob.asiedu@gmail.com' and r.name='MANAGER';

INSERT INTO `online_ticketing`.`user_role` (`user_id`,`role_id`)
select distinct u.id as user_id, r.id as role_id
from online_ticketing.user u cross join online_ticketing.role r
where u.email='jacob.asiedu@gmail.com' and r.name='ADMIN';

INSERT INTO `online_ticketing`.`user_role` (`user_id`,`role_id`)
select distinct u.id as user_id, r.id as role_id
from online_ticketing.user u cross join online_ticketing.role r
where u.email='jacob.asiedu@gmail.com' and r.name='PASSENGER';

INSERT INTO `online_ticketing`.`user_role` (`user_id`,`role_id`)
select distinct u.id as user_id, r.id as role_id
from online_ticketing.user u cross join online_ticketing.role r
where u.email='boakyef213@gmail.com' and r.name='DRIVER';

INSERT INTO `online_ticketing`.`user_role` (`user_id`,`role_id`)
select distinct u.id as user_id, r.id as role_id
from online_ticketing.user u cross join online_ticketing.role r
where u.email='boakyef213@gmail.com' and r.name='PASSENGER';


INSERT INTO `online_ticketing`.`user_role` (`user_id`,`role_id`)
select distinct u.id as user_id, r.id as role_id
from online_ticketing.user u cross join online_ticketing.role r
where u.email='jacob.asiedu@gmail.com' and r.name='DRIVER';

CREATE OR REPLACE view online_ticketing.v_bus_route as
SELECT
        UUID() AS `id`,
        `r`.`id` AS `route_id`,
         `r`.`name` AS `route`,
        `bs`.`departure_time` AS `departure_time`,
        `bs`.`id` AS `bus_schedule_id`,
        `r`.`fare` AS `fare`,
        `bst`.`name` AS `bus_stop`,
        `bst`.`id` AS `bus_stop_id`,
        `rbs`.`seq_order` AS `bus_stop_order`
    FROM
        (((`online_ticketing`.`bus_schedule` `bs`
        LEFT JOIN `online_ticketing`.`route` `r` ON ((`r`.`id` = `bs`.`route_id`)))
        LEFT JOIN `online_ticketing`.`route_bus_stop` `rbs` ON ((`rbs`.`route_id` = `r`.`id`)))
        LEFT JOIN `online_ticketing`.`bus_stop` `bst` ON ((`rbs`.`bus_stop_id` = `bst`.`id`)))
    ORDER BY `bs`.`departure_time` , `rbs`.`seq_order`;

create or replace view online_ticketing.v_ticktes as
SELECT
 UUID() AS `id`,
t.id as ticket_id,
t.date_created as purchase_date,
t.serial_number,
b.status as status,
b.number_of_seats, bs.name as origin,
bsc.departure_time,
r.name as route,
u.contact_number as phone,
u.full_name,
u.id as user_id
FROM online_ticketing.ticket t
left join online_ticketing.booking b on t.booking_id=b.id
left join online_ticketing.bus_stop bs on bs.id=b.bus_stop_id
left join online_ticketing.bus_schedule bsc on bsc.id=b.bus_schedule_id
left join online_ticketing.route r on r.id=bsc.route_id
left join online_ticketing.user u on u.id=t.user_id;

create or replace view online_ticketing.v_tickets as
SELECT
 UUID() AS `id`,
 bs.name as bus_stop,
 bus.bus_number as bus_no,
 bsc.departure_time,
 r.fare as fare,
 t.serial_number as serial_no,
 r.name as route,
 r.id as route_id,
t.id as ticket_id,
t.date_created as purchase_date,
t.user_id as user_id,
b.id as booking_id,
b.status as status
FROM online_ticketing.ticket t
left join online_ticketing.booking b on t.booking_id=b.id
left join online_ticketing.bus_stop bs on bs.id=b.bus_stop_id
left join online_ticketing.bus_schedule bsc on bsc.id=b.bus_schedule_id
left join online_ticketing.route r on r.id=bsc.route_id
left join  online_ticketing.bus bus on bus.id=bsc.bus_id
left join online_ticketing.user u on u.id=t.user_id
where b.status=1;


create or replace view online_ticketing.v_recoveries as
select r.* from online_ticketing.recoveries r where expiry > date_sub(now(), interval 10 MINUTE);

