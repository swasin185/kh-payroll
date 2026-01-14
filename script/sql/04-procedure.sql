CREATE OR REPLACE
ALGORITHM = UNDEFINED VIEW vTimeCard AS
select
    scanCode,
    date_format(if(cast(scanAt as time) < '06:00', scanAt - interval 1 day, scanAt), '%Y-%m-%d') AS dateAt,
    date_format(scanAt, '%H:%i') AS timeAt
from
    timecard;

DROP PROCEDURE IF EXISTS runTimeCard;
DELIMITER $$
CREATE PROCEDURE runTimeCard(in pDateFrom varchar(10), in pDateTo varchar(10))
BEGIN
    INSERT IGNORE INTO attendance (
        comCode, 
        empCode, 
        dateTxt, 
        inTime1, outTime1, 
        inTime2, outTime2, 
        inTime3, outTime3,
        scanCount
    ) 
    SELECT 
        e.comCode, 
        e.empCode, 
        dateAt,
        MIN(IF(timeAt between '06:00' and '10:00', timeAt, NULL)) as inTime1,
        MIN(IF(timeAt > '11:00' AND timeAt <= '13:30', timeAt, NULL)) as outTime1,
        IF(COUNT(IF(timeAt > '11:00' AND timeAt <= '15:00', timeAt, NULL)) >= 2,
           MAX(IF(timeAt > '11:30' AND timeAt <= '15:00', timeAt, NULL)), NULL) as inTime2,
        MIN(IF(timeAt > '15:00', timeAt, NULL)) as outTime2,
        MAX(IF(timeAt > '18:00' AND timeAt <= '19:00', timeAt, NULL)) as inTime3,
        MAX(IF(timeAt < '06:00' OR timeAt > '19:00', timeAt, NULL)) as outTime3,
        COUNT(timeAt) as scanCount
    FROM vTimeCard t
    JOIN employee e ON t.scanCode = e.scanCode 
    WHERE dateAt BETWEEN pDateFrom AND pDateTo
    GROUP BY t.scanCode, dateAt;
END;$$ 
DELIMITER ;

DROP PROCEDURE IF EXISTS runAttendance;
DELIMITER $$
CREATE PROCEDURE runAttendance(in pDateFrom varchar(10), in pDateTo varchar(10))
BEGIN
    UPDATE attendance a
    JOIN (
        SELECT 
            comCode,
            empCode,
            dateTxt,
            -- Late 1: ถ้าเข้าสายเกิน 08:00
            IF(inTime1 > '08:00', TIME_TO_SEC(TIMEDIFF(inTime1, '08:00')) / 60, NULL) as calc_lateMin1,
            -- Late 2: พักเที่ยงเกิน 60 นาที (ถ้าผลลัพธ์ <= 0 ให้เป็น NULL)
            TIME_TO_SEC(TIMEDIFF(inTime2, outTime1)) / 60 - 60 as calc_lateMin2,
            -- Lunch Minute
            TIME_TO_SEC(TIMEDIFF(inTime2, outTime1)) / 60 as calc_lunchMin,
            -- Work Minute (รวมกะเช้าและกะบ่าย)
            (TIME_TO_SEC(TIMEDIFF(IFNULL(outTime1, '12:00'), IF(inTime1 > '08:00', inTime1, '08:00'))) +  
             TIME_TO_SEC(TIMEDIFF(IF(outTime2 < '17:00', outTime2, '17:00'), IFNULL(inTime2, '13:00')))) / 60 as calc_workMin,
            -- OT Minute (ถ้าติดลบให้เป็น NULL)
            IF(TIME_TO_SEC(TIMEDIFF(outTime3, inTime3)) > 0, 
               TIME_TO_SEC(TIMEDIFF(outTime3, inTime3)) / 60, NULL) as calc_otMin
        FROM attendance
        WHERE dateTxt BETWEEN pDateFrom AND pDateTo
    ) as result ON a.comCode=result.comCode AND a.empCode = result.empCode AND a.dateTxt = result.dateTxt
    SET 
        a.lateMin1 = result.calc_lateMin1,
        a.lateMin2 = result.calc_lateMin2,
        a.lunchMin = result.calc_lunchMin,
        a.workMin = result.calc_workMin,
        a.otMin = result.calc_otMin;
END;$$
DELIMITER ;
