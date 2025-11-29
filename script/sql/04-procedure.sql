DROP PROCEDURE IF EXISTS runTimeCard;
DELIMITER $$
$$
CREATE PROCEDURE runTimeCard(in pDateTxt varchar(10))
BEGIN
    declare vScanCode varchar(5);
    declare vInTime varchar(5);
    declare vOutTime varchar(5);
    declare done boolean default FALSE;
    declare cur1 cursor for 
        select dateTxt, scanCode, min(timeTxt) as inTime, max(timeTxt) as outTime
        from timecard
        where dateTxt = pDateTxt
        group by dateTxt, scanCode;

    declare continue handler for not found set done = TRUE;

    open cur1;
    read_loop: loop
        fetch cur1 into pDateTxt, vScanCode, vInTime, vOutTime;
        if done then
            close cur1;
            leave read_loop;
        end if;
        insert into attendance(comCode, empCode, dateTxt, inTime1, outTime1)
        select comCode, empCode, pDateTxt, vInTime, vOutTime
        from employee
        where scanCode = vScanCode
        on duplicate key update inTime1 = vInTime, outTime1 = vOutTime;
    end loop read_loop;
END;$$
DELIMITER ;
