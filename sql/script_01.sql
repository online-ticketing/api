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
  `username` varchar(20) NOT NULL,
  `password` blob NOT NULL,
  `api_key` VARCHAR(45) NOT NULL,
  `account_status` int NOT NULL DEFAULT '0',
  `date_created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_modified` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `contact_number_UNIQUE` (`contact_number`),
  UNIQUE KEY `username_UNIQUE` (`username`),
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
  `serial_number` varchar(30) NOT NULL,
  `booking_id` int NOT NULL,
  `date_created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_modified` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `serial_number_UNIQUE` (`serial_number`),
  KEY `booking_id` (`booking_id`),
  CONSTRAINT `ticket_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`id`)
);


INSERT INTO `online_ticketing`.`user` (`full_name`,`contact_number`,`email`,`username`,`password`,`account_status`,`api_key`)
VALUES("Kwabena Asiedu","6174819043","jacob.asiedu@gmail.com","jasiedu",AES_ENCRYPT("123456","mabang-tepa"),1,'xxxxxxxxx1'),
("Frank Boakye","0245666208","boakyef213@gmail.com","boakyef",AES_ENCRYPT("654321","mabang-tepa"),1,'xxxxxxxxx2'),
("Adu Acheampong","0591984773","aacheampong@gmail.com","aacheampong",AES_ENCRYPT("1234654321","mabang-tepa"),1,'xxxxxxxxx3');

INSERT INTO `online_ticketing`.`role` (`name`,`created_by_id`,`description`)
VALUES("MANAGER",1,"The Manager Role"),("BOOK_MAN",1,"The Book man Role"),("DRIVER",1,"The Driver Role"),("ADMIN",1,"The System Administrative Role"),("CONDUCTOR",1,"The Conductor Role"),("PASSENGER",1,"The passenger Role");

INSERT INTO `online_ticketing`.`user_role` (`user_id`,`role_id`)
select distinct u.id as user_id, r.id as role_id
from online_ticketing.user u cross join online_ticketing.role r
where u.username='jasiedu' and r.name='MANAGER';

INSERT INTO `online_ticketing`.`user_role` (`user_id`,`role_id`)
select distinct u.id as user_id, r.id as role_id
from online_ticketing.user u cross join online_ticketing.role r
where u.username='jasiedu' and r.name='ADMIN';

INSERT INTO `online_ticketing`.`user_role` (`user_id`,`role_id`)
select distinct u.id as user_id, r.id as role_id
from online_ticketing.user u cross join online_ticketing.role r
where u.username='jasiedu' and r.name='PASSENGER';

INSERT INTO `online_ticketing`.`user_role` (`user_id`,`role_id`)
select distinct u.id as user_id, r.id as role_id
from online_ticketing.user u cross join online_ticketing.role r
where u.username='boakyef' and r.name='DRIVER';

INSERT INTO `online_ticketing`.`user_role` (`user_id`,`role_id`)
select distinct u.id as user_id, r.id as role_id
from online_ticketing.user u cross join online_ticketing.role r
where u.username='boakyef' and r.name='PASSENGER';


INSERT INTO `online_ticketing`.`user_role` (`user_id`,`role_id`)
select distinct u.id as user_id, r.id as role_id
from online_ticketing.user u cross join online_ticketing.role r
where u.username='aacheampong' and r.name='CONDUCTOR';

INSERT INTO `online_ticketing`.`user_role` (`user_id`,`role_id`)
select distinct u.id as user_id, r.id as role_id
from online_ticketing.user u cross join online_ticketing.role r
where u.username='aacheampong' and r.name='PASSENGER';

INSERT INTO `online_ticketing`.`bus`(`bus_number`,`plate_number`,`capacity`,`gps_location`,`created_by_id`,`status`)
VALUES(1,"GHA-A-23456",120,POINT(50.0755381, 14.4378005),1,1),
(12,"GHA-B-23456",80,POINT(50.0755381, 14.4378005),1,1);

INSERT INTO `online_ticketing`.`route`(`name`,`created_by_id`,`fare`)
VALUES("ACCRA-KUMASI",1,45.35),("KUMASI-ACCRA",1,45.35);


INSERT INTO online_ticketing.bus_stop(name,gps_location,ghana_post_address, created_by_id) VALUES('Kwame Nkrumah Circle, Dr. Busia Hwy, Accra, Ghana',POINT(-0.210089,5.545935),'GP1',1);
INSERT INTO online_ticketing.bus_stop(name,gps_location,ghana_post_address, created_by_id) VALUES('Achimota Old Station Bus Stop, Accra, Ghana',POINT(-0.229495,5.615458),'GP2',1);
INSERT INTO online_ticketing.bus_stop(name,gps_location,ghana_post_address, created_by_id) VALUES('China Mall Amasaman, PM8V+G82, Amasaman, Ghana',POINT(-0.124403,5.639194),'GP3',1);
INSERT INTO online_ticketing.bus_stop(name,gps_location,ghana_post_address, created_by_id) VALUES('MEDIE, QM6G+RJW, Medie, Ghana',POINT(-0.32598,5.761949),'GP4',1);
INSERT INTO online_ticketing.bus_stop(name,gps_location,ghana_post_address, created_by_id) VALUES('Teye Lawer Ent., RJ9W+MCR, Nsawam Road, Nsawam, Ghana',POINT(-0.35026,5.80893),'GP5',1);
INSERT INTO online_ticketing.bus_stop(name,gps_location,ghana_post_address, created_by_id) VALUES('MCANIM SERVICE STATION, Nsawam - Suhum Rd, Teacher Mante, Ghana',POINT(-0.982714,7.85125),'GP6',1);
INSERT INTO online_ticketing.bus_stop(name,gps_location,ghana_post_address, created_by_id) VALUES('Asuboi Health centre,Asuboe, Ghana',POINT(-76.746438,38.948739),'GP7',1);
INSERT INTO online_ticketing.bus_stop(name,gps_location,ghana_post_address, created_by_id) VALUES('Sankofa filling Station,Amanase, Ghana',POINT(0.002234,5.786453),'GP8',1);
INSERT INTO online_ticketing.bus_stop(name,gps_location,ghana_post_address, created_by_id) VALUES('Asafo Market, Nhyiaeso, Accra, Ghana',POINT(-1.615856,6.688726),'GP9',1);



INSERT INTO online_ticketing.bus_stop(name,gps_location,ghana_post_address, created_by_id) VALUES('Asafo Market, Nhyiaeso, Accra, Ghana',POINT(-1.615856,6.688726),'GP10',1);
INSERT INTO online_ticketing.bus_stop(name,gps_location,ghana_post_address, created_by_id) VALUES('Hotel Georgia, Ahodwo Round About, Southern By-Pass, Kumasi, Ghana',POINT(-1.62443,6.68848),'GP11',1);
INSERT INTO online_ticketing.bus_stop(name,gps_location,ghana_post_address, created_by_id) VALUES('Kumasi City Mall, Lake Rd, Kumasi, Ghana',POINT(-1.62443,6.68848),'GP12',1);
INSERT INTO online_ticketing.bus_stop(name,gps_location,ghana_post_address, created_by_id) VALUES('Tech Junction overpass bridge, MCPG+PFG, Ejisu Road, Kumasi, Ghana',POINT(-1.62443,6.68848),'GP13',1);
INSERT INTO online_ticketing.bus_stop(name,gps_location,ghana_post_address, created_by_id) VALUES("Kindle Organic, Ejisu Kwamu main road, beside Kwamu Chief's Palace Digital Address: AE-0197-3789, Kumasi, Ghana",POINT(-1.62443,6.68848),'GP14',1);
INSERT INTO online_ticketing.bus_stop(name,gps_location,ghana_post_address, created_by_id) VALUES('Anita Hotel, Kumasi, Konongo - Ejisu Rd, Ghana',POINT(-0.982714,7.85125),'GP15',1);
INSERT INTO online_ticketing.bus_stop(name,gps_location,ghana_post_address, created_by_id) VALUES('Pacific filling station, MJ7P+W9, Kubease, Ghana',POINT(0.002234,5.786453),'GP16',1);
INSERT INTO online_ticketing.bus_stop(name,gps_location,ghana_post_address, created_by_id) VALUES('Konongo Market, Konongo, Ghana',POINT(-1.211731,6.623536),'GP17',1);
INSERT INTO online_ticketing.bus_stop(name,gps_location,ghana_post_address, created_by_id) VALUES('JULAN HOTEL, HVRM+PCW, Atwedie Road, Juaso, Ghana',POINT(-1.13333,6.6),'GP18',1);
INSERT INTO online_ticketing.bus_stop(name,gps_location,ghana_post_address, created_by_id) VALUES('Kwame Nkrumah Circle, Dr. Busia Hwy, Accra, Ghana',POINT(-0.210089,5.545935),'GP19',1);




--
-- INSERT INTO online_ticketing.route_bus_stop
INSERT INTO `online_ticketing`.`route_bus_stop` (`route_id`,`bus_stop_id`,`seq_order`)
select distinct r.id as route_id, bs.id as bus_stop_id,bs.id
from online_ticketing.route r cross join online_ticketing.bus_stop bs
where r.name='ACCRA-KUMASI' and bs.ghana_post_address in ('GP1','GP2','GP3','GP4','GP5','GP6','GP7','GP8','GP9');



INSERT INTO `online_ticketing`.`route_bus_stop` (`route_id`,`bus_stop_id`,`seq_order`)
select distinct r.id as route_id, bs.id as bus_stop_id,bs.id
from online_ticketing.route r cross join online_ticketing.bus_stop bs
where r.name='KUMASI-ACCRA' and bs.ghana_post_address in ('GP10','GP11','GP12','GP13','GP14','GP15','GP16','GP17','GP18','GP19');

