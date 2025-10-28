// This file is modified from ./migrations/schema.ts
// Generated from "npx drizzle-kit pull"
// After run "sudo mysql < ./sql/*.sql"

import {
    mysqlTable,
    foreignKey,
    boolean,
    varchar,
    tinyint,
    smallint,
    mediumint,
    decimal,
    index,
    unique,
    date,
    int,
    timestamp,
    year,
} from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const attendance = mysqlTable(
    "attendance",
    {
        comCode: varchar({ length: 2 }).notNull(),
        empCode: smallint().notNull(),
        dateTxt: varchar({ length: 10 }).notNull(),
        inTime1: varchar({ length: 8 }),
        outTime1: varchar({ length: 8 }),
        inTime2: varchar({ length: 8 }),
        outTime2: varchar({ length: 8 }),
        inTime3: varchar({ length: 8 }),
        outTime3: varchar({ length: 8 }),
        workMinute: smallint(),
        otMinute: smallint(),
    },
    (table) => [
        foreignKey({
            columns: [table.comCode, table.empCode],
            foreignColumns: [employee.comCode, employee.empCode],
            name: "attendance_ibfk_1",
        })
            .onUpdate("restrict")
            .onDelete("restrict"),
    ],
)

export const company = mysqlTable("company", {
    comCode: varchar({ length: 2 }).notNull(),
    comName: varchar({ length: 64 }).notNull(),
    taxid: varchar({ length: 13 }),
    address: varchar({ length: 200 }),
    phone: varchar({ length: 100 }),
    email1: varchar({ length: 30 }),
    email2: varchar({ length: 30 }),
    email3: varchar({ length: 30 }),
    yrPayroll: year().default(sql`year(curdate())`),
    mnPayroll: tinyint().default(sql`month(curdate())`),
})

export const deduction = mysqlTable("deduction", {
    costPercent: decimal({ precision: 4, scale: 2 }),
    costLimit: mediumint(),
    deductSelf: mediumint(),
    deductSpouse: mediumint(),
    deductChild: mediumint(),
    deductChildEdu: mediumint(),
})

export const employee = mysqlTable(
    "employee",
    {
        comCode: varchar({ length: 2 })
            .notNull()
            .references(() => company.comCode, { onDelete: "restrict", onUpdate: "restrict" }),
        empCode: smallint().notNull(),
        taxId: varchar({ length: 17 }),
        prefix: varchar({ length: 16 }),
        name: varchar({ length: 16 }),
        surName: varchar({ length: 20 }),
        nickName: varchar({ length: 20 }),
        // you can use { mode: 'date' }, if you want to have Date as type for this column
        birthDate: date({ mode: "string" }),
        department: varchar({ length: 20 }),
        timeCode: smallint().references(() => timetype.timeCode, {
            onDelete: "restrict",
            onUpdate: "restrict",
        }),
        // you can use { mode: 'date' }, if you want to have Date as type for this column
        beginDate: date({ mode: "string" }),
        // you can use { mode: 'date' }, if you want to have Date as type for this column
        endDate: date({ mode: "string" }),
        empType: varchar({ length: 10 }),
        bankAccount: varchar({ length: 20 }),
        address: varchar({ length: 100 }),
        phone: varchar({ length: 20 }),
        childAll: tinyint().default(0),
        childEdu: tinyint().default(0),
        isSpouse: boolean().default(false),
        isChildShare: boolean().default(false),
        isExcSocialIns: boolean().default(false),
        deductInsure: decimal({ precision: 9, scale: 2 }).default("0.00"),
        deductHome: decimal({ precision: 9, scale: 2 }).default("0.00"),
        deductElse: decimal({ precision: 9, scale: 2 }).default("0.00"),
        scanCode: varchar({ length: 5 }),
    },
    (table) => [
        index("timeCode").on(table.timeCode),
        unique("comCode").on(table.comCode, table.scanCode),
    ],
)

export const holiday = mysqlTable("holiday", {
    comCode: varchar({ length: 2 }).notNull(),
    // you can use { mode: 'date' }, if you want to have Date as type for this column
    dateValue: date({ mode: "string" }).notNull(),
    dateName: varchar({ length: 40 }),
})

export const incometype = mysqlTable("incometype", {
    inCode: varchar({ length: 2 }).notNull(),
    inName: varchar({ length: 30 }),
    inType: tinyint().default(1),
    isTax: boolean().default(true),
    isReset: boolean().default(true),
    initLimit: decimal({ precision: 9, scale: 2 }).default("0.00"),
    initPercent: decimal({ precision: 4, scale: 2 }).default("0.00"),
})

export const logs = mysqlTable("logs", {
    logNr: int().autoincrement().notNull(),
    logTime: timestamp({ mode: "string" }).default("current_timestamp()").notNull(),
    logType: varchar({ length: 8 }),
    userId: varchar({ length: 16 }),
    program: varchar({ length: 20 }),
    tableName: varchar({ length: 20 }),
    changed: varchar({ length: 256 }),
    comCode: varchar({ length: 2 }),
})

export const payroll = mysqlTable(
    "payroll",
    {
        yr: year().notNull(),
        mo: tinyint().notNull(),
        comCode: varchar({ length: 2 }).notNull(),
        empCode: smallint().notNull(),
        inCode: varchar({ length: 2 })
            .notNull()
            .references(() => incometype.inCode, { onDelete: "restrict", onUpdate: "restrict" }),
        value: decimal({ precision: 9, scale: 2 }).default("0.00"),
    },
    (table) => [
        index("comCode").on(table.comCode, table.empCode),
        index("inCode").on(table.inCode),
        foreignKey({
            columns: [table.comCode, table.empCode],
            foreignColumns: [employee.comCode, employee.empCode],
            name: "payroll_ibfk_1",
        })
            .onUpdate("restrict")
            .onDelete("restrict"),
    ],
)

export const permission = mysqlTable("permission", {
    comCode: varchar({ length: 2 })
        .notNull()
        .references(() => company.comCode, { onDelete: "restrict", onUpdate: "restrict" }),
    userId: varchar({ length: 16 })
        .notNull()
        .references(() => users.id, { onDelete: "cascade", onUpdate: "restrict" }),
    program: varchar({ length: 20 }).notNull(),
    level: tinyint().default(0).notNull(),
    used: int().default(0).notNull(),
})

export const salary = mysqlTable(
    "salary",
    {
        comCode: varchar({ length: 2 }).notNull(),
        empCode: smallint().notNull(),
        inCode: varchar({ length: 2 })
            .notNull()
            .references(() => incometype.inCode, { onDelete: "restrict", onUpdate: "restrict" }),
        value: decimal({ precision: 9, scale: 2 }),
        duration: tinyint().default(1),
        yrBegin: year().default(0),
        moBegin: tinyint().default(0),
    },
    (table) => [
        index("inCode").on(table.inCode),
        foreignKey({
            columns: [table.comCode, table.empCode],
            foreignColumns: [employee.comCode, employee.empCode],
            name: "salary_ibfk_1",
        })
            .onUpdate("restrict")
            .onDelete("restrict"),
    ],
)

export const taxrate = mysqlTable("taxrate", {
    total: mediumint().notNull(),
    rate: decimal({ precision: 4, scale: 2 }).default("0.00"),
})

export const timecard = mysqlTable("timecard", {
    dateTxt: varchar({ length: 10 }).notNull(),
    scanCode: varchar({ length: 5 }).notNull(),
    timeTxt: varchar({ length: 8 }).notNull(),
})

export const timetype = mysqlTable("timetype", {
    timeCode: smallint().autoincrement().notNull(),
    descript: varchar({ length: 40 }),
    workStart: varchar({ length: 8 }).default("'08:00:00'"),
    lunchBreak: varchar({ length: 8 }).default("'12:00:00'"),
    workFinish: varchar({ length: 8 }).default("'17:00:00'"),
    shift1Start: varchar({ length: 8 }).default("'06:00:00'"),
    shift1Finish: varchar({ length: 8 }).default("'14:00:00'"),
    shift2Start: varchar({ length: 8 }).default("'14:00:00'"),
    shift2Finish: varchar({ length: 8 }).default("'22:00:00'"),
    shift3Start: varchar({ length: 8 }).default("'22:00:00'"),
    shift3Finish: varchar({ length: 8 }).default("'06:00:00'"),
    otRate1: decimal({ precision: 2, scale: 1 }).default("1.5"),
    otRate2: decimal({ precision: 2, scale: 1 }).default("2.0"),
    otRate3: decimal({ precision: 2, scale: 1 }).default("3.0"),
    allowance1: decimal({ precision: 9, scale: 2 }).default("0.00"),
    allowance2: decimal({ precision: 9, scale: 2 }).default("0.00"),
})

export const users = mysqlTable("users", {
    id: varchar({ length: 16 }).notNull(),
    name: varchar({ length: 40 }),
    descript: varchar({ length: 60 }),
    level: tinyint().default(0).notNull(),
    role: varchar({ length: 16 }),
    passwd: varchar({ length: 32 }),
    passwdTime: timestamp({ mode: "string" }),
    passwd2: varchar({ length: 32 }),
    passwd2Time: timestamp({ mode: "string" }),
    // you can use { mode: 'date' }, if you want to have Date as type for this column
    created: date({ mode: "string" }).default("curdate()"),
    // you can use { mode: 'date' }, if you want to have Date as type for this column
    stoped: date({ mode: "string" }),
    comCode: varchar({ length: 2 })
        .default("01")
        .notNull()
        .references(() => company.comCode, { onDelete: "restrict", onUpdate: "restrict" }),
})
