-- Adminer 4.8.1 MySQL 10.11.5-MariaDB-log dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `dishes`;
CREATE TABLE `dishes` (
  `dish_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `preparation` varchar(1000) NOT NULL,
  `vm_score` int(11) NOT NULL,
  `meal_category` enum('breakfast','main','snack') NOT NULL,
  `preparation_time_in_min` int(3) NOT NULL,
  `total_calories` int(11) NOT NULL,
  `total_protein` float NOT NULL,
  `total_fat` float NOT NULL,
  `total_carbs` float NOT NULL,
  `tags` text NOT NULL,
  PRIMARY KEY (`dish_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

TRUNCATE `dishes`;
INSERT INTO `dishes` (`dish_id`, `name`, `preparation`, `vm_score`, `meal_category`, `preparation_time_in_min`, `total_calories`, `total_protein`, `total_fat`, `total_carbs`, `tags`) VALUES
(1,	'chili con carne',	'#Fry minced meatin a pan #Add tomato sauce, kidney beans, beef broth and corn #Season with paprika powder and chili #Simmer for  5-10 minutes',	1,	'main',	20,	820,	1,	1,	1,	'[\"cut\", \"bulk\"]'),
(186,	'CHENNG',	'Ebenfnfk',	2,	'breakfast',	2,	700,	45,	33,	89,	'[]'),
(187,	'Lasagne',	'test',	2,	'breakfast',	2,	735,	147,	14,	4,	'[\"2\"]'),
(197,	'777777',	'7',	7,	'main',	7,	864,	9,	84,	12,	'[\"7\"]'),
(198,	'99999',	'3',	3,	'main',	3,	864,	9,	84,	12,	'[\"3\"]'),
(199,	'nochmal eins',	'3',	3,	'main',	3,	864,	9,	84,	12,	'[\"3\"]');

DROP TABLE IF EXISTS `dish_ingredients`;
CREATE TABLE `dish_ingredients` (
  `dish_id` int(11) NOT NULL,
  `ingredient_id` int(11) NOT NULL,
  `unit_of_measurement` enum('ml','g','piece','slice') NOT NULL,
  `amount` float NOT NULL,
  PRIMARY KEY (`dish_id`,`ingredient_id`),
  KEY `ingredient_id` (`ingredient_id`),
  CONSTRAINT `dish_ingredients_ibfk_1` FOREIGN KEY (`dish_id`) REFERENCES `dishes` (`dish_id`) ON DELETE CASCADE,
  CONSTRAINT `dish_ingredients_ibfk_2` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`ingredient_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

TRUNCATE `dish_ingredients`;
INSERT INTO `dish_ingredients` (`dish_id`, `ingredient_id`, `unit_of_measurement`, `amount`) VALUES
(186,	2,	'ml',	1),
(187,	4,	'g',	700),
(197,	2,	'ml',	400),
(198,	2,	'ml',	400),
(199,	2,	'ml',	400);

DROP TABLE IF EXISTS `ingredients`;
CREATE TABLE `ingredients` (
  `ingredient_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `Unit_of_Measurement` varchar(100) NOT NULL COMMENT 'Nur in gramm bzw. ml??',
  `calories_per_UoM` float NOT NULL,
  `carbs_per_UoM` float NOT NULL,
  `fats_per_UoM` float NOT NULL,
  `protein_per_UoM` float NOT NULL,
  `category` varchar(100) NOT NULL,
  PRIMARY KEY (`ingredient_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

TRUNCATE `ingredients`;
INSERT INTO `ingredients` (`ingredient_id`, `name`, `Unit_of_Measurement`, `calories_per_UoM`, `carbs_per_UoM`, `fats_per_UoM`, `protein_per_UoM`, `category`) VALUES
(2,	'coconut milk',	'100ml',	216,	3,	21,	2.2,	''),
(3,	'curry powder',	'100g',	319,	49.1,	8.9,	9.9,	''),
(4,	'chicken breast filet',	'100g',	105,	0.6,	2,	21,	''),
(5,	'salt',	'100g',	0,	0,	0,	0,	''),
(6,	'pepper',	'100g',	251,	64,	3.3,	10.4,	''),
(7,	'champignons (brown)',	'100g',	20,	0.6,	0.3,	2.7,	''),
(8,	'onion (white)',	'piece',	19,	3.4,	0.2,	0.8,	''),
(9,	'spätzle',	'100g',	380,	68,	4.7,	15,	''),
(10,	'cream for cooking',	'100g',	163,	4,	15,	2.9,	''),
(11,	'beef broth (maggi)',	'100ml',	19,	0.3,	0.3,	0.1,	''),
(12,	'minced beef',	'100g',	238,	0,	15,	21,	''),
(13,	'corn',	'100g',	85,	15.4,	1.1,	2.5,	''),
(14,	'kidney beans',	'100g',	98,	12,	0.5,	5.6,	''),
(15,	'paprika powder',	'100g',	282,	54,	13,	14,	''),
(16,	'tomato puree',	'100ml',	37,	5.6,	0.5,	1.6,	'');

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('user','cook','admin') NOT NULL DEFAULT 'user',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

TRUNCATE `users`;
INSERT INTO `users` (`user_id`, `username`, `email`, `password_hash`, `role`) VALUES
(21,	'unituebingen',	'uni@tuebingen.de',	'$2b$10$hUOtqLheeHUsTu2OJ5BJC.CSfjZ12Cgmo.YTTXFUGkJk20aIt5fWC',	'user'),
(22,	'user',	'user@user.com',	'$2b$10$QeoePGtXhQNBc8xS9EMiAus5YE5y.VQn5JXA1znPQL12SU9JQpVb6',	'user'),
(23,	'cook',	'cook@cook.com',	'$2b$10$G.LzZlviA5xBMGybxIR4buZmeCCKJKcXGuMWvdMa5NJN8.0bQ.a.6',	'cook'),
(24,	'admin',	'admin@admin.com',	'$2b$10$5oAL3bh6A0W6jGA5GZTji.p8y.rINmMbd1nBexdBwPgK3Sf8KelBq',	'admin'),
(27,	'Matthias Vetter',	'matze2948@gmail.com',	'$2b$10$2cpJSvXoEuZ/9FIJqgLxJ.M6mqQJNPFAaZHd4Ux6jjV3vFUY4a0oC',	'admin'),
(45,	'Daniel Mehler',	'daniel.sebastian.mehler@gmail.com',	'$2b$10$2TKNHwZutU0nlVacU.YVqu4a1aMG9/kI5sQVXQeMKWdHohYQNRrnO',	'admin'),
(46,	'jojo',	'jojo@jojo.com',	'$2b$10$BA./T9ZNJrHQPYBUItZZmuL5H6LEozjIUnwSL16hBilocCwB47bQ6',	'user'),
(47,	'Robert',	'robert@gmail.com',	'$2b$10$WKMAwaGAdhNUkRP23a5XleQXzEF/XpQLDJL5FphqixdWJ4UaBt08i',	'user');

DROP TABLE IF EXISTS `user_dishes`;
CREATE TABLE `user_dishes` (
  `user_id` int(11) NOT NULL,
  `dish_id` int(11) NOT NULL,
  PRIMARY KEY (`user_id`,`dish_id`),
  KEY `dish_id` (`dish_id`),
  CONSTRAINT `user_dishes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `user_dishes_ibfk_2` FOREIGN KEY (`dish_id`) REFERENCES `dishes` (`dish_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

TRUNCATE `user_dishes`;

-- 2025-07-14 11:04:51