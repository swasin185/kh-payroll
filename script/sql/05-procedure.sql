DROP PROCEDURE IF EXISTS runTimeCard;
DELIMITER $$
$$
CREATE PROCEDURE runTimeCard(in pDateFrom varchar(10), in pDateTo varchar(10)) 
BEGIN
INSERT INTO attendance (
        comCode,
        empCode,
        dateTxt,
        morning,
        evening,
        night,
        early,
        lunch_out,
        lunch_in,
        scanCount,
        status
    )
SELECT e.comCode,
    e.empCode,
    t.dateAt,
    t.morning,
    t.evening,
    t.night,
    t.early,
    t.lunch_out,
    t.lunch_in,
    t.scanCount,
    t.status
FROM vAttendance t
    JOIN employee e ON t.scanCode = e.scanCode
WHERE t.dateAt BETWEEN pDateFrom AND pDateTo ON DUPLICATE KEY
UPDATE morning =
VALUES(morning),
    evening =
VALUES(evening),
    night =
VALUES(night),
    early =
VALUES(early),
    lunch_out =
VALUES(lunch_out),
    lunch_in =
VALUES(lunch_in),
    scanCount =
VALUES(scanCount),
    status =
VALUES(status);
END$$
DELIMITER ;
--
DROP PROCEDURE IF EXISTS payroll.runAttendance;
DELIMITER $$
$$
CREATE PROCEDURE payroll.runAttendance(in pDateFrom varchar(10), in pDateTo varchar(10))
BEGIN
	UPDATE attendance
    SET lateMin1 = IF(
        morning > '08:00',
        (TIME_TO_SEC(morning) - TIME_TO_SEC('08:00')) / 60,
        0
    ),
    lunchMin = @lunch := if(
        lunch_out is null
        or lunch_in is null,
        0,
        (TIME_TO_SEC(lunch_in) - TIME_TO_SEC(lunch_out)) / 60
    ),
    lateMin2 = if(
        lunch_out is null
        and lunch_in is null,
        240,
        if(
            lunch_out is null
            or lunch_in is null
            or lunch_out = lunch_in,
            120,
            if(@lunch > 60, @lunch - 60, 0)
        )
    ),
    workMin = GREATEST(
        0,
        (
            TIME_TO_SEC(COALESCE(early, night, evening)) - TIME_TO_SEC(morning)
        ) / 60 - GREATEST(@lunch, 60)
    ),
    otMin = CASE
        WHEN morning IS NOT NULL
        AND early IS NOT NULL THEN (
            TIME_TO_SEC(early) + 86400 - TIME_TO_SEC('18:00')
        ) / 60
        WHEN morning IS NOT NULL
        AND night IS NOT NULL THEN (TIME_TO_SEC(night) - TIME_TO_SEC('18:00')) / 60
        ELSE 0
    END
WHERE dateTxt BETWEEN pDateFrom AND pDateTo;
END$$
DELIMITER ;
