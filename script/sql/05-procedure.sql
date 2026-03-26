drop procedure if exists payroll.runTimeCard;

DELIMITER $$
$$
create procedure payroll.runTimeCard (in pDateFrom varchar(10), in pDateTo varchar(10))
begin
insert ignore into
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
select
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
from
    vDailyTime t
    join employee e on t.scanCode = e.scanCode
where
    t.dateAt between pDateFrom and pDateTo;

END$$
DELIMITER ;

drop procedure if exists payroll.runAttendance;

DELIMITER $$
$$
create procedure payroll.runAttendance (in pDateFrom varchar(10), in pDateTo varchar(10))
begin
insert into
    attendance (
        comCode,
        empCode,
        dateAt,
        status
    )
with recursive
    dates as (
        select
            pDateFrom as dateAt
        union all
        select
            dateAt + interval 1 DAY
        from
            dates
        where
            dateAt <= pDateTo
    )
select
    e.comCode,
    e.empCode,
    dateAt,
    if (h.day is null, "Absent", "HOLIDAY") status
from
    dates
    join employee e
    left join holiday h on e.comCode = h.comCode
    and dates.dateAt = h.day
where
    dayofweek(dateAt) <> 1
    and e.timeCode is not null
    and e.endDate is null
on duplicate key update
    status = value(status);

UPDATE attendance AS a
LEFT JOIN holiday AS h ON a.comCode = h.comCode AND a.dateAt = h.day
SET a.status = CASE
    -- 1. Check if it's a Holiday first (Highest Priority)
    WHEN h.day IS NOT NULL THEN 'Holiday'
    
    -- 2. Check for Sunday
    WHEN DAYOFWEEK(a.dateAt) = 1 THEN 'Sunday'
    
    -- 3. Full Day Logic (Morning + any late shift)
    WHEN a.morning IS NOT NULL AND (
         a.evening IS NOT NULL OR a.night IS NOT NULL OR a.early IS NOT NULL
    ) THEN 'FullDay'
    
    -- 4. Half Day Logic (XOR start/end + Lunch punch)
    WHEN (
         (a.morning IS NOT NULL) 
         XOR 
         (a.evening IS NOT NULL OR a.night IS NOT NULL OR a.early IS NOT NULL)
    ) 
    AND (a.lunch_out IS NOT NULL OR a.lunch_in IS NOT NULL) 
    THEN 'HalfDay'
    
    -- 5. Default
    ELSE 'Absent'
END
WHERE a.dateAt BETWEEN pDateFrom AND pDateTo;

update attendance a
join vAttendance v on v.comCode = a.comCode
and v.empCode = a.empCode
and v.dateAt = a.dateAt
set
    a.status = v.status,
    a.lateMin1 = v.lateMin1,
    a.lunchMin = v.lunchMin,
    a.lateMin2 = v.lateMin2,
    a.otMin = v.otMin,
    a.workMin = if (v.status = "FullDay" or v.status = "HalfDay", v.baseWorkMin - v.lateMin1 - v.lateMin2, 0)
where
    a.dateAt between pDateFrom and pDateTo;

END$$
DELIMITER ;
