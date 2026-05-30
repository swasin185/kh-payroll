drop database if exists payroll;
create database payroll
DEFAULT CHARACTER SET utf8mb4
DEFAULT COLLATE utf8mb4_unicode_ci;

drop user if exists 'pr-report'@'%';
create user 'pr-report'@'%' identified by 'A1b2C3d4#';
grant select, execute, create temporary tables on *.* to 'pr-report'@'%';

DROP USER IF EXISTS 'pr-user'@'%';

CREATE USER 'pr-user'@'%' IDENTIFIED BY 'A1b2C3d4#';

GRANT SELECT, EXECUTE, INSERT, DELETE, UPDATE, CREATE TEMPORARY TABLES
ON payroll.* TO 'pr-user'@'%';

FLUSH PRIVILEGES;
