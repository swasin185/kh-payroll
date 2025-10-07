drop database if exists payroll;
create database payroll;

-- drop user if exists 'pr-report'@'%';
-- create user 'pr-report'@'%' identified by 'A1b2C3d4#';
-- grant select, execute, create temporary tables on *.* to 'pr-report'@'%';

set @user = 'pr-user'@'%'
drop user if exists @user;
create user @user identified by 'A1b2C3d4#';
grant select, execute, insert, delete, update,
create temporary tables on payroll.* to @user;