CREATE OR REPLACE VIEW `vTimeCard` AS
select `v`.`scanCode` AS `scanCode`,
	date_format(
		if(
			cast(`v`.`scanAt` as time) < '06:00',
			`v`.`scanAt` - interval 1 day,
			`v`.`scanAt`
		),
		'%Y-%m-%d'
	) COLLATE utf8mb4_general_ci AS `dateAt`,
	date_format(`v`.`scanAt`, '%H:%i') COLLATE utf8mb4_general_ci AS `timeAt`
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
select `v2`.*,
	CASE
		WHEN v2.status = 'FullDay' THEN v2.fullWorkMin - v2.lateMin1 - v2.lateMin2
		WHEN v2.status = 'HalfDay' THEN v2.halfWorkMin - v2.lateMin1 - v2.lateMin2
		ELSE 0
	END AS workMin
from (
		select 
		    `v`.*,
			GREATEST(
				0,
				COALESCE(v.morning_m, v.fullWorkMin) - v.fullWorkMin
			) AS lateMin1,
			IF(
				v.lunch_out_m IS NULL
				OR v.lunch_in_m IS NULL
				OR v.lunch_out_m = v.lunch_in_m,
				0,
				v.lunch_in_m - v.lunch_out_m
			) AS lunchMin,
			CASE
				WHEN v.status = 'FullDay' THEN IF(
					v.lunch_out_m IS NULL
					OR v.lunch_in_m IS NULL
					OR v.lunch_out_m = v.lunch_in_m,
					IF(
						v.lunch_out_m IS NULL
						AND v.lunch_in_m IS NULL,
						v.halfWorkMin,
						v.halfWorkMin / 2
					),
					GREATEST(0, v.lunch_in_m - v.lunch_out_m - 60)
				) + IF(
					v.night_m IS NULL
					AND v.early_m IS NULL
					AND v.evening_m IS NOT NULL,
					GREATEST(0, 1020 - v.evening_m),
					0
				)
				WHEN v.status = 'HalfDay' THEN GREATEST(
					0,
					v.halfWorkMin - GREATEST(
						0,
						COALESCE(v.morning_m, v.fullWorkMin) - v.fullWorkMin
					) - CASE
						WHEN v.morning_m IS NOT NULL
						AND v.lunch_out_m IS NOT NULL THEN LEAST(
							v.halfWorkMin,
							v.lunch_out_m - GREATEST(v.morning_m, v.fullWorkMin)
						)
						WHEN v.lunch_in_m IS NOT NULL
						AND COALESCE(v.early_m, v.night_m, v.evening_m) IS NOT NULL THEN LEAST(
							v.halfWorkMin,
							COALESCE(v.early_m, v.night_m, v.evening_m) - GREATEST(v.lunch_in_m, 780)
						)
						ELSE 0
					END
				)
				ELSE 0
			END AS lateMin2,
			IF(
				v.morning_m IS NULL
				OR (
					v.status = 'FullDay'
					AND v.night_m IS NULL
					AND v.early_m IS NULL
				),
				0,
				CASE
					WHEN v.early_m IS NOT NULL THEN v.early_m - 1080
					WHEN v.night_m IS NOT NULL THEN v.night_m - 1080
					ELSE 0
				END
			) AS otMin
		from (
				select 
				    240 AS halfWorkMin,
					480 AS fullWorkMin,
					FLOOR(TIME_TO_SEC(morning) / 60) AS morning_m,
					FLOOR(TIME_TO_SEC(lunch_out) / 60) AS lunch_out_m,
					FLOOR(TIME_TO_SEC(lunch_in) / 60) AS lunch_in_m,
					FLOOR(TIME_TO_SEC(evening) / 60) AS evening_m,
					FLOOR(TIME_TO_SEC(night) / 60) AS night_m,
					FLOOR(TIME_TO_SEC(early) / 60) + 1440 AS early_m,
					comCode,
					empCode,
					dateAt,
					morning,
					lunch_out,
					lunch_in,
					evening,
					night,
					early,
					case
						when (
							`a`.`morning` is not null
							and (
								`a`.`evening` is not null
								or `a`.`night` is not null
								or `a`.`early` is not null
							)
						) then 'FullDay'
						when (
							(`a`.`morning` is not null)
							xor (
								`a`.`evening` is not null
								or `a`.`night` is not null
								or `a`.`early` is not null
							)
						)
						and (
							`a`.`lunch_out` is not null
							or `a`.`lunch_in` is not null
						) then 'HalfDay'
						else 'Absent'
					end AS `status`
				from `attendance` `a`
			) v
	) v2;