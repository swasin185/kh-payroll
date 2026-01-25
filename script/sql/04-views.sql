
CREATE OR REPLACE VIEW `vTimeCard` AS
select
    `v`.`scanCode` AS `scanCode`,
    date_format(if(cast(`v`.`scanAt` as time) < '06:00', `v`.`scanAt` - interval 1 day, `v`.`scanAt`), '%Y-%m-%d') AS `dateAt`,
    date_format(`v`.`scanAt`, '%H:%i') AS `timeAt`
from
    `timecard` v;

CREATE OR REPLACE VIEW `vDailyTime` AS
select
    `v`.`dateAt` AS `dateAt`,
    `v`.`scanCode` AS `scanCode`,
    max(if(`v`.`timeAt` < '06:00', `v`.`timeAt`, NULL)) AS `early`,
    max(if(`v`.`timeAt` >= '06:00' and `v`.`timeAt` < '09:30', `v`.`timeAt`, NULL)) AS `morning`,
    min(if(`v`.`timeAt` >= '11:00' and `v`.`timeAt` < '13:30', `v`.`timeAt`, NULL)) AS `lunch_out`,
    max(if(`v`.`timeAt` >= '12:00' and `v`.`timeAt` < '15:00', `v`.`timeAt`, NULL)) AS `lunch_in`,
    max(if(`v`.`timeAt` >= '16:00' and `v`.`timeAt` < '19:00', `v`.`timeAt`, NULL)) AS `evening`,
    max(if(`v`.`timeAt` >= '19:00', `v`.`timeAt`, NULL)) AS `night`,
    count(0) AS `count`,
    group_concat(`v`.`timeAt` separator ',') AS `rawTime`
from
    `vTimeCard` v
group by
    `v`.`dateAt`,
    `v`.`scanCode`;


CREATE OR REPLACE VIEW `vAttendance` AS
select
	if(`v`.`morning` is not null and `v`.`evening` is not null, '1.morning-evening', if(v.morning is not null, '2.morning', if(v.evening is not null, '3.evening', '4.none'))) AS `day_case`,
	if(`v`.`lunch_out` is null and `v`.`lunch_in` is null, '1.none', if(`v`.`lunch_out` <> `v`.`lunch_in`, '2.lunch-ok', '3.lunch-error')) AS `lunch_case`,
	if(`v`.`night` is null and `v`.`early` is null, '1.none', if(v.early is not null, '3.next-day ', '2.night')) AS `night_case`,
	time_to_sec(timediff(`v`.`evening`, `v`.`morning`)) / 60 AS `work_min`,
	time_to_sec(timediff(`v`.`lunch_in`, `v`.`lunch_out`)) / 60 AS `lunch_min`,
	`v`.`dateAt` AS `dateAt`,
	`v`.`scanCode` AS `scanCode`,
	`v`.`early` AS `early`,
	`v`.`morning` AS `morning`,
	`v`.`lunch_out` AS `lunch_out`,
	`v`.`lunch_in` AS `lunch_in`,
	`v`.`evening` AS `evening`,
	`v`.`night` AS `night`,
	`v`.`count` AS `count`,
	`v`.`rawTime` AS `rawTime`
from
	`vDailyTime` `v`;