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
  `email` varchar(30) NOT NULL,
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

CREATE OR REPLACE view online_ticketing.v_bus_route as SELECT
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
        WHERE `bs`.`departure_time` >= now()
    ORDER BY `bs`.`departure_time` , `rbs`.`seq_order`;


CREATE OR REPLACE VIEW online_ticketing.v_tickets AS SELECT
        UUID() AS `id`,
        `bs`.`name` AS `bus_stop`,
        `bus`.`bus_number` AS `bus_no`,
        `bsc`.`departure_time` AS `departure_time`,
        `r`.`fare` AS `fare`,
        `t`.`serial_number` AS `serial_no`,
        `r`.`name` AS `route`,
        `r`.`id` AS `route_id`,
        `t`.`id` AS `ticket_id`,
        `t`.`seat_number` as `seat_no`,
        `t`.`date_created` AS `purchase_date`,
        `t`.`user_id` AS `user_id`,
        `b`.`id` AS `booking_id`,
        `b`.`status` AS `status`
    FROM
        ((((((`online_ticketing`.`ticket` `t`
        LEFT JOIN `online_ticketing`.`booking` `b` ON ((`t`.`booking_id` = `b`.`id`)))
        LEFT JOIN `online_ticketing`.`bus_stop` `bs` ON ((`bs`.`id` = `b`.`bus_stop_id`)))
        LEFT JOIN `online_ticketing`.`bus_schedule` `bsc` ON ((`bsc`.`id` = `b`.`bus_schedule_id`)))
        LEFT JOIN `online_ticketing`.`route` `r` ON ((`r`.`id` = `bsc`.`route_id`)))
        LEFT JOIN `online_ticketing`.`bus` ON ((`bus`.`id` = `bsc`.`bus_id`)))
        LEFT JOIN `online_ticketing`.`user` `u` ON ((`u`.`id` = `t`.`user_id`)))
    WHERE
        (`b`.`status` = 1);



CREATE OR REPLACE VIEW online_ticketing.v_recoveries AS SELECT
        `r`.`id` AS `id`,
        `r`.`email` AS `email`,
        `r`.`expiry` AS `expiry`,
        `r`.`otp` AS `otp`
    FROM
        `online_ticketing`.`recoveries` `r`
    WHERE
        (`r`.`expiry` > (NOW() - INTERVAL 10 MINUTE));

create or replace view online_ticketing.v_available_seats as SELECT
        UUID() AS `id`,
       `bus`.`plate_number` AS `plate_no`,
         `r`.`fare` AS `fare`,
        `r`.`name` AS `route`,
        `bk`.`bus_schedule_id` AS `bsc_id`,
        `bs`.`departure_time` AS `departure`,
        CAST(`bs`.`departure_time` AS TIME) AS `short_depart`,
       (`bus`.`capacity`- SUM(IF(`bk`.`number_of_seats` IS NULL,0,`bk`.`number_of_seats`))) as `available_seats`
    FROM
        `online_ticketing`.`bus_schedule` `bs`
        LEFT JOIN  `online_ticketing`.`booking` `bk` ON `bs`.`id` = `bk`.`bus_schedule_id`
       LEFT JOIN `online_ticketing`.`route` `r` ON `r`.`id` = `bs`.`route_id`
        LEFT JOIN `online_ticketing`.`bus` ON `bus`.`id` = `bs`.`bus_id`
       where
        `bs`.`departure_time` >= NOW()
    GROUP BY `bsc_id`,plate_no,fare,route,departure
    order by departure;

CREATE OR REPLACE VIEW online_ticketing.v_bus_stop_2_route as SELECT
    UUID() AS `id`,
    r.id as route_id,
    r.name as route_name,
    bs.gps_location as gps_location,
    bs.name as bus_stop,
    rbs.seq_order
  FROM online_ticketing.route r left join online_ticketing.route_bus_stop rbs
    on r.id=rbs.route_id left join online_ticketing.bus_stop bs on bs.id=rbs.bus_stop_id
  order by rbs.seq_order asc;
