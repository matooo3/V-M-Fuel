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
  `meal_category` varchar(100) NOT NULL,
  `preparation_time_in_min` int(3) NOT NULL,
  `total_calories` int(11) NOT NULL,
  `total_protein` float NOT NULL,
  `total_fat` float NOT NULL,
  `total_carbs` float NOT NULL,
  `tags` varchar(100) NOT NULL,
  PRIMARY KEY (`dish_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;


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


DROP TABLE IF EXISTS `ingredients`;
CREATE TABLE `ingredients` (
  `ingredient_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `Unit_of_Measurement` varchar(100) NOT NULL COMMENT 'Nur in gramm bzw. ml??',
  `calories_per_UoM` float NOT NULL,
  `carbs_per_UoM` float NOT NULL,
  `fats_per_UoM` float NOT NULL,
  `protein_per_UoM` float NOT NULL,
  PRIMARY KEY (`ingredient_id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;


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
(1,	'testUser1',	'testUser1@mail.mail',	'uuwhhdbb77228828dJDDBobos##++2883838',	'admin'),
(2,	'testuser',	'testuser@example.com',	'$2b$10$6s4kBW0sSVpRm0t53ykGN.v.FLR4zq3MI1t5kjYwj8AkkaiJ3Uhqq',	'admin'),
(4,	'rerere',	'lalal@lala.lala',	'$2b$10$q2iZCX76ywWpiYt3Z538vunN4SOY.rvfnprlbT97sb6GQGzSmMPFi',	'cook'),
(6,	'test',	'test@test.test',	'$2b$10$Sc.aOi606Xl9yg1posaJjeRsPGldZfrPwNDQbtNKhlwrxGbSLV7Lm',	'user'),
(8,	'tgewfgw',	'efwe@feni.com',	'$2b$10$QXeVhKwkVbafxBgZ.wWwBeS1RwxL.TFzlNIXORm3lphrLaAtFVSKy',	'user'),
(9,	'terstete',	't4ete@pppp.com',	'$2b$10$SfFDLRJ5jNXqa5SCzQHp/OhsWGMGvsP8lW2GSPsRiXBy9tRX0CMIK',	'user'),
(10,	'dwwdd',	'wdw@dwe.com',	'$2b$10$OhbBsemQgtM1mCFwyYDkLOmSh0nXZwUzpLpottPPt6MiVZA3s.zQW',	'user'),
(16,	'reredw',	'bradto@gmail.com',	'$2b$10$GenPQ1ll..zWhIX.RW9Ueeh7Md8bt0O3xHJUWxFv5pZQL4mZnCWnS',	'cook'),
(17,	'new',	'new@gmail.com',	'$2b$10$81iBuK2gNxH.WFjm9bHTR.lzbT8UcNksxWGz.b9if2PHVG7RJ/1GG',	'user'),
(20,	'Marcel1',	'marcel@davis.com',	'$2b$10$pH/0rFgMiOBGhrkXZC20T.GiUoauE4zRE0MEKGQR5v64L/n.jP7K.',	'user'),
(21,	'unituebingen',	'uni@tuebingen.de',	'$2b$10$hUOtqLheeHUsTu2OJ5BJC.CSfjZ12Cgmo.YTTXFUGkJk20aIt5fWC',	'user'),
(22,	'user',	'user@user.com',	'$2b$10$QeoePGtXhQNBc8xS9EMiAus5YE5y.VQn5JXA1znPQL12SU9JQpVb6',	'user'),
(23,	'cook',	'cook@cook.com',	'$2b$10$G.LzZlviA5xBMGybxIR4buZmeCCKJKcXGuMWvdMa5NJN8.0bQ.a.6',	'cook'),
(24,	'admin',	'admin@admin.com',	'$2b$10$5oAL3bh6A0W6jGA5GZTji.p8y.rINmMbd1nBexdBwPgK3Sf8KelBq',	'admin'),
(25,	'test123123',	'test123123@gmail.com',	'$2b$10$s3fvm//JpVdAOV.c18j7t.LJxvePGl/lw/CWesy6vVZeq1TjyWyw2',	'user'),
(26,	'teette',	'tte@tete.domdd',	'$2b$10$qcaEOeGzkLQn82l4iK5m6uLTr9aLN/8nQu0pub4cUtJRS9gUNoyqK',	'user'),
(27,	'Matthias Vetter',	'matze2948@gmail.com',	'$2b$10$2cpJSvXoEuZ/9FIJqgLxJ.M6mqQJNPFAaZHd4Ux6jjV3vFUY4a0oC',	'admin'),
(28,	'Dani Mani',	'danimani@mehl.com',	'$2b$10$l7aGJTk64LSbBFVW58DWEuvSjUm122fH8wG.7isJ4DZ5pIxXRyREO',	'user');

DROP TABLE IF EXISTS `user_dishes`;
CREATE TABLE `user_dishes` (
  `user_id` int(11) NOT NULL,
  `dish_id` int(11) NOT NULL,
  PRIMARY KEY (`user_id`,`dish_id`),
  KEY `dish_id` (`dish_id`),
  CONSTRAINT `user_dishes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `user_dishes_ibfk_2` FOREIGN KEY (`dish_id`) REFERENCES `dishes` (`dish_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;


-- 2025-07-06 10:55:49