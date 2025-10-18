use payroll;

set foreign_key_checks = 0;

drop table if exists company;
create table company (
  comCode       varchar(2),
  comName       varchar(90) not null comment "บริษัท ชื่อ",
  taxid         varchar(13) comment "เลขประจำตัวผู้เสียภาษี",
  address       varchar(200) comment "ที่อยู่",
  phone         varchar(100) comment "เบอร์โทรศัพท์ FAX มือถือ",
  email1        varchar(30) comment "email 1",
  email2        varchar(30) comment "email 2",
  email3        varchar(30) comment "email 3",
  yrPayroll     year default year(curdate()) comment "ปีปัจจุบันที่กำลังทำงาน",
  mnPayroll     tinyint unsigned default month(curdate()) comment "เดือนปัจจุบันที่กำลังทำงาน",
  primary key (comCode)
) comment = "บริษัท-ข้อมูลของแต่ละบริษัท";
insert into 
  company(comCode, comName) 
values
  ("00", "บจ.ทดสอบ KEEHIN Software"),
  ("01", "บจ กี่หิ้นการไฟฟ้าภูเก็ต"),
  ("02", "บจ บ้านสุขภัณฑ์และวัสดุ");

drop table if exists users;
create table users (
  id            varchar(16),
  name          varchar(40) comment "ชื่อ นามสกุล",
  descript      varchar(60) comment "คำอธิบายหน้าที่",
  level         tinyint not null default 0 comment "ระดับการใช้งาน 0 - 9 LEVELS /shared/util.ts ",
  role          varchar(16) comment "หน้าที่",
  passwd        varchar(32) comment "รหัสผ่านเข้าใช้งาน",
  passwdTime    timestamp comment "วันที่ตั้งรหัสผ่าน",
  passwd2       varchar(32) comment "รหัสผ่านซุปเปอร์ไวเซอร์",
  passwd2Time   timestamp comment "วันที่ตั้งรหัสผ่าน 2",
  created       date default curdate() comment "วันที่สร้างผู้ใช้",
  stoped        date comment "วันที่สิ้นสุดการทำงาน",
  comCode       varchar(2) not null default "01" comment "บริษัทที่ใช้งาน",
  foreign key (comCode) references company(comCode),
  primary key (id)
) comment = "ผู้ใช้งานระบบ";
insert into users
  (id, name, descript, level)
values 
  ("admin", "แอดมินไงจะใครละ", "ผู้สร้างระบบ", 9),
  ("tom", "วศิน เสงี่ยมกุล", "ทดสอบผู้ใช้แอดมิน", 7),
  ("jerry", "จิรายุทธ ใจดี", "ทดสอบผู้ใช้พนักงาน", 3),
  ("guest", "แขกผู้แวะมาดู", "ทดสอบผู้ใช้ทั่วไป", 0);  

drop table if exists permission;
create table permission (
  comCode       varchar(2),
  userId        varchar(16),
  program       varchar(20),
  level         tinyint not null default 0 comment "ระดับการใช้งาน 0 - 9 ใช้ -1 ในการลบ",
  used          int unsigned not null default 0 comment "จำนวนครั้งที่ใช้",
  foreign key (comCode) references company(comCode),
  foreign key (userId) references users(id) on delete cascade,
  primary key (comCode, userId, program)
) comment = "สิทธิการใช้โปรแกรม";

drop table if exists logs;
create table logs (
  logNr         int unsigned auto_increment,
  logTime       timestamp not null default current_timestamp,
  logType       varchar(8) comment "insert delete update query rollback login logfail execute",   
  userId        varchar(16) comment "user ที่ส่งคำสั่งทำงาน",
  program       varchar(20) comment "ชื่อโปรแกรม URL.to",
  tableName     varchar(20) comment "ไฟล์ ที่มีผลกระทบ",
  changed       varchar(256) comment "ข้อมูลการเปลี่ยนแปลง",
  comCode       varchar(2) comment "บริษัท",
  primary key (logNr)
) comment = "บันทึกการทำงาน";

set
foreign_key_checks = 1;
