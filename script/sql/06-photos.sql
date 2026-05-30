use payroll;

DROP TABLE IF EXISTS employee_photo;
CREATE TABLE employee_photo (
    comCode       VARCHAR(2) NOT NULL COMMENT 'Company Code',
    empCode       SMALLINT UNSIGNED NOT NULL COMMENT 'Employee Code',
    photoData     MEDIUMBLOB NOT NULL COMMENT 'Binary image data (supports up to 16MB)',
    mimeType      VARCHAR(30) NOT NULL DEFAULT 'image/jpeg' COMMENT 'Content-Type of image (e.g. image/jpeg, image/png)',
    uploadedAt    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (comCode, empCode) REFERENCES employee(comCode, empCode) ON DELETE CASCADE,
    PRIMARY KEY (comCode, empCode)
) COMMENT = 'เก็บรูปภาพของพนักงาน 1 รูปต่อคน (1-1 Relationship)';
