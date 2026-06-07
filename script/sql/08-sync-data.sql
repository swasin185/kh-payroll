UPDATE khemp
SET `ชื่อ` = TRIM(REGEXP_REPLACE(`ชื่อ`, '^(นาย|นางสาว|นาง|น.ส.)', ''))
WHERE `ชื่อ` REGEXP '^(นาย|นางสาว|นาง|น.ส.)';

update khemp k set k.`ชื่อ` = TRIM(k.`ชื่อ`), k.`นามสกุล` = trim(k.`นามสกุล` ) where k.`ชื่อ`  is not null;
update khemp k set k.`วันเกิด` = null where k.`วันเกิด` = '- ';

UPDATE employee AS e
JOIN khemp AS k ON concat(e.name, e.surName) = concat(k.`ชื่อ`,k.`นามสกุล` )
SET
    e.nickName = k.`ชื่อเล่น`,
    e.birthDate = STR_TO_DATE(k.`วันเกิด`, '%d/%m/%Y'),
    e.phone = k.เบอร์โทรศัพท์,
    e.extPhone = k.เบอร์หมายเลขภายใน,
    e.lineId = k.`Line ID`,
    e.department = k.`แผนก`,
    e.supplier =  k.`แผนก (กรณีเลือก "อื่นๆ")`;

select comCode, max(empCode) from payroll.employee group by comCode;

-- insert into payroll.employee
select k.`สถานะ`, k.`อายุ`, null, 'คุณ', k.`ชื่อ`, k.`นามสกุล`, k.`ชื่อเล่น`,  STR_TO_DATE(k.`วันเกิด`, '%d/%m/%Y') birth, k.`แผนก`,
  null, null, null, 'ชั่วคราว', null, null,
  k.`เบอร์โทรศัพท์`, k.`เบอร์หมายเลขภายใน`, k.`Line ID`,  k.`แผนก (กรณีเลือก "อื่นๆ")`,
  0,0,0,0,0,0,0,0,null
from khemp k
left join employee e on concat(e.name, e.surName) = concat(k.`ชื่อ`,k.`นามสกุล` )
where e.empCode is null
order by k.`สถานะ`, birth;
