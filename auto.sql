CREATE DATABASE IF NOT EXISTS auto DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;

CREATE TABLE IF NOT EXISTS brand(
	id int NOT NULL AUTO_INCREMENT,
	name varchar(30) NOT NULL,
	pinyin varchar(30) NOT NULL,
	logo varchar(120),
	sohuId int NOT NULL,
	PRIMARY KEY(id)
)DEFAULT CHARSET=utf8;
CREATE TABLE IF NOT EXISTS models(
	id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
	name varchar(80) NOT NULL,
	pinyin varchar(100) NOT NULL,
	image varchar(120) ,
	bid int NOT NULL,
	maxprice char(10) NOT NULL,
	minprice char(10) NOT NULL,
	level varchar(30),
	oil char(12),
	biansuxiang varchar(60),
	struct varchar(70),
	baoxiu varchar(80),
	sohuId int NOT NULL
)DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS trim(
	id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
	name varchar(80) NOT NULL,
	mid int NOT NULL,
	price char(10),
	maxprice char(10),
	minprice char(10),
	level varchar(30),
	oil char(12),
	biansuxiang varchar(60),
	struct varchar(70),
	baoxiu varchar(80),
	sohuId int NOT NULL
)DEFAULT CHARSET=utf8;

