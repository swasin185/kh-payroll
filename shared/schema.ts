import { z } from "zod"

const ComCodeAttr = z.string().max(2).default("")
const UserIdAttr = z.string().max(16).default("")

export const CompanySchema = z.object({
    comCode: ComCodeAttr,
    comName: z.string().max(90).min(1, "Company name is required.").default("Company Name"),
    taxId: z.string().max(13).min(13).nullable().default(null),
    address: z.string().max(200).nullable().default(null),
    phone: z.string().max(100).nullable().default(null),
    email1: z.email().max(30).nullable().default(null),
    email2: z.email().max(30).nullable().default(null),
    email3: z.email().max(30).nullable().default(null),
    yrPayroll: z.number().int().min(1900).max(2500).default(new Date().getFullYear()).optional(),
    mnPayroll: z
        .number()
        .int()
        .min(0)
        .max(13)
        .default(new Date().getMonth() + 1)
        .optional(),
})
export type Company = z.infer<typeof CompanySchema>

export const UsersSchema = z.object({
    id: UserIdAttr,
    name: z.string().min(3).max(40).default("name"),
    descript: z.string().max(60).nullable().default(null),
    level: z.int().min(0).max(9).default(0),
    role: z.string().max(16).nullable().default(null),
    passwd: z.string().max(32).nullable().default(null).optional(),
    passwdTime: z.string().nullable().default(null).optional(),
    created: z.string().nullable().default(null).optional(),
    stoped: z.string().nullable().default(null).optional(),
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
    logTime: z.number().int().positive().optional(),
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
