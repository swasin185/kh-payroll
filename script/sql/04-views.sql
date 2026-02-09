CREATE OR REPLACE VIEW `vTimeCard` AS
select `v`.`scanCode` AS `scanCode`,
	date_format(
		if(
			cast(`v`.`scanAt` as time) < '06:00',
			`v`.`scanAt` - interval 1 day,
			`v`.`scanAt`
		),
		'%Y-%m-%d'
	) AS `dateAt`,
	date_format(`v`.`scanAt`, '%H:%i') AS `timeAt`
from `timecard` v;
--
CREATE OR REPLACE VIEW `vDailyTime` AS
select `v`.`dateAt` AS `dateAt`,
	`v`.`scanCode` AS `scanCode`,
	max(if(`v`.`timeAt` < '06:00', `v`.`timeAt`, NULL)) AS `early`,
	max(
		if(
			`v`.`timeAt` >= '06:00'
			and `v`.`timeAt` <= '10:00',
			`v`.`timeAt`,
			NULL
		)
	) AS `morning`,
	min(
		if(
			`v`.`timeAt` >= '11:00'
			and `v`.`timeAt` <= '13:30',
			`v`.`timeAt`,
			NULL
		)
	) AS `lunch_out`,
	max(
		if(
			`v`.`timeAt` >= '11:30'
			and `v`.`timeAt` <= '15:30',
			`v`.`timeAt`,
			NULL
		)
	) AS `lunch_in`,
	max(
		if(
			`v`.`timeAt` >= '15:31'
			and `v`.`timeAt` <= '18:00',
			`v`.`timeAt`,
			NULL
		)
	) AS `evening`,
	max(if(`v`.`timeAt` >= '18:01', `v`.`timeAt`, NULL)) AS `night`,
	count(0) AS `count`,
	group_concat(`v`.`timeAt` separator ',') AS `rawTime`
from `vTimeCard` v
group by `v`.`dateAt`,
	`v`.`scanCode`;
--
CREATE OR REPLACE VIEW `vAttendance` AS
select 
    `v`.`dateAt` AS `dateAt`,
	`v`.`scanCode` AS `scanCode`,
	`v`.`morning` AS `morning`,
	`v`.`lunch_out` AS `lunch_out`,
	`v`.`lunch_in` AS `lunch_in`,
	`v`.`evening` AS `evening`,
	`v`.`night` AS `night`,
	`v`.`early` AS `early`,
	`v`.`count` AS `scanCount`,
	`v`.`rawTime` AS `rawTime`,
	case
		when (
			`v`.`morning` is not null
			and (
				`v`.`evening` is not null
				or `v`.`night` is not null
				or `v`.`early` is not null
			)
		) then 'Full Day'
		when (
			(`v`.`morning` is not null)
			xor (
				`v`.`evening` is not null
				or `v`.`night` is not null
				or `v`.`early` is not null
			)
		)
		and (
			`v`.`lunch_out` is not null
			or `v`.`lunch_in` is not null
		) then 'Half Day'
		else 'Absent'
	end AS `status`
from `vDailyTime` `v`;