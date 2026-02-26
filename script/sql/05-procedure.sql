DROP PROCEDURE IF EXISTS payroll.runTimeCard;

DELIMITER $$
CREATE PROCEDURE payroll.runTimeCard (in pDateFrom varchar(10), in pDateTo varchar(10))
BEGIN
INSERT INTO
    attendance (
        comCode,
        empCode,
        dateAt,
        morning,
        evening,
        night,
        early,
        lunch_out,
        lunch_in,
        scanCount
    )
SELECT
    e.comCode,
    e.empCode,
    t.dateAt,
    t.morning,
    t.evening,
    t.night,
    t.early,
    t.lunch_out,
    t.lunch_in,
    t.count
FROM
    vDailyTime t
    JOIN employee e ON t.scanCode = e.scanCode
WHERE
    t.dateAt BETWEEN pDateFrom AND pDateTo;

END $$

DELIMITER ;


DROP PROCEDURE IF EXISTS payroll.runAttendance;

DELIMITER $$
CREATE PROCEDURE payroll.runAttendance (in pDateFrom varchar(10), in pDateTo varchar(10))
BEGIN
UPDATE attendance a
JOIN vAttendance v ON v.comCode = a.comCode
AND v.empCode = a.empCode
AND v.dateAt = a.dateAt
SET
    a.status = v.status,
    a.lateMin1 = v.lateMin1,
    a.lunchMin = v.lunchMin,
    a.lateMin2 = v.lateMin2,
    a.otMin = v.otMin,
    a.workMin = v.baseWorkMin - v.lateMin1 - v.lateMin2
WHERE
    a.dateAt BETWEEN pDateFrom AND pDateTo;

END $$

DELIMITER ;
