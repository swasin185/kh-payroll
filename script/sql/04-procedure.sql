DROP PROCEDURE IF EXISTS runTimeCard;
DELIMITER $$
CREATE PROCEDURE runTimeCard(in pDateTxt varchar(10))
BEGIN
    INSERT IGNORE INTO attendance (
        comCode, 
        empCode, 
        dateTxt, 
        inTime1, outTime1, 
        inTime2, outTime2, 
        inTime3, outTime3
    ) 
    SELECT 
        e.comCode, 
        e.empCode, 
        t.dateTxt,
        MIN(IF(t.timeTxt < '10:00', t.timeTxt, NULL)) as inTime1,
        MIN(IF(t.timeTxt > '11:00' AND t.timeTxt <= '13:30', t.timeTxt, NULL)) as outTime1,
        IF(COUNT(IF(t.timeTxt > '11:00' AND t.timeTxt <= '15:00', t.timeTxt, NULL)) >= 2,
           MAX(IF(t.timeTxt > '11:30' AND t.timeTxt <= '15:00', t.timeTxt, NULL)), NULL) as inTime2,
        MIN(IF(t.timeTxt > '15:00', t.timeTxt, NULL)) as outTime2,
        MAX(IF(t.timeTxt > '18:00' AND t.timeTxt <= '19:00', t.timeTxt, NULL)) as inTime3,
        MAX(IF(t.timeTxt > '19:00', t.timeTxt, NULL)) as outTime3
    FROM timecard t
    JOIN employee e ON t.scanCode = e.scanCode 
    WHERE t.dateTxt = pDateTxt
    GROUP BY t.scanCode;

    SELECT ROW_COUNT() AS records_imported;
END;$$ 
DELIMITER ;

DROP PROCEDURE IF EXISTS runAttendance;
DELIMITER $$
CREATE PROCEDURE runAttendance(in pDateTxt varchar(10))
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
        WHERE dateTxt = pDateTxt
    ) as result ON a.comCode=result.comCode AND a.empCode = result.empCode AND a.dateTxt = result.dateTxt
    SET 
        a.lateMin1 = result.calc_lateMin1,
        a.lateMin2 = result.calc_lateMin2,
        a.lunchMin = result.calc_lunchMin,
        a.workMin = result.calc_workMin,
        a.otMin = result.calc_otMin;
    SELECT ROW_COUNT() AS records_updated;
END;$$
DELIMITER ;
