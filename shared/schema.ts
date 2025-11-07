import { z } from "zod"
import { formatDate, formatDateTime } from "./utils"

function toLocaleDateTime(time: Date | null | undefined) {
    return time ? formatDateTime(time) : null
}

function toLocaleDate(date: Date | null | undefined) {
    return date ? formatDate(date) : null
}

const ComCodeAttr = z.string().max(2).default("")

const UserIdAttr = z.string().min(3).max(16)

const DateAttr = z.coerce.date().nullable().default(null).transform(toLocaleDate)

const TimeAttr = z.coerce.date().nullable().default(null).optional().transform(toLocaleDateTime)

const MoneyAttr = z.coerce.number().min(-999_999_999).max(999_999_999).nullable().optional().default(null)

const PercentAttr = z.coerce.number().min(0).max(100).nullable().optional().default(null)

const BooleanAttr = z.coerce.boolean().optional().default(true)

export const CompanySchema = z.object({
    comCode: ComCodeAttr,
    comName: z.string().max(90).min(5, "Company name is required.").default(""),
    taxId: z.string().max(13).min(13).nullable().default(null),
    address: z.string().max(200).nullable().default(null),
    phone: z.string().max(100).nullable().default(null),
    email1: z.email().max(30).nullable().default(null),
    email2: z.email().max(30).nullable().default(null),
    email3: z.email().max(30).nullable().default(null),
    yrPayroll: z.number().int().min(1900).max(2200).default(new Date().getFullYear()).optional(),
    mnPayroll: z
        .number()
        .int()
        .min(0)
        .max(13)
        .default(new Date().getMonth() + 1)
        .optional(),
})
export type Company = z.infer<typeof CompanySchema>

export const CompanyArraySchema = z.array(CompanySchema)

export const UsersSchema = z.object({
    id: UserIdAttr.default("xxx"),
    name: z.string().min(3).max(40).default(""),
    descript: z.string().max(60).nullable().default(null),
    level: z.int().min(0).max(9).default(0),
    role: UserIdAttr.nullable().default(null),
    passwd: z.string().max(32).nullable().default(null).optional(),
    passwdTime: TimeAttr,
    created: DateAttr,
    stoped: DateAttr,
    comCode: ComCodeAttr.nullable().default("01"),
})
export type Users = z.infer<typeof UsersSchema>

export const PermissionSchema = z
    .object({
        comCode: ComCodeAttr,
        userId: UserIdAttr,
        program: z.string().max(20),
        level: z.number().int().min(-1).max(9).default(0),
        used: z.number().int().min(0).default(0),
    })
    .strict()
export type Permission = z.infer<typeof PermissionSchema>

export const LogsSchema = z.object({
    logNr: z.number().int().positive().optional(),
    logTime: TimeAttr,
    logType: z
        .enum(["insert", "delete", "update", "query", "rollback", "login", "logfail", "execute"])
        .nullable()
        .optional(),
    userId: UserIdAttr.nullable().optional(),
    program: z.string().max(20).nullable().optional(),
    tableName: z.string().max(20).nullable().optional(),
    changed: z.string().max(256).nullable().optional(),
    comCode: ComCodeAttr.nullable().optional(),
})
export type Logs = z.infer<typeof LogsSchema>

export const IncomeTypeSchema = z.object({
    inCode: z.string().min(2).max(2).optional(),
    inName: z.string().max(30).optional(),
    inType: z.number().int().min(-1).max(1).optional().default(1),
    isTax: BooleanAttr,
    isReset: BooleanAttr,
    initLimit: MoneyAttr,
    initPercent: PercentAttr,
})
export type IncomeType = z.infer<typeof IncomeTypeSchema>
