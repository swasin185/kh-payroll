import { useDrizzle } from "./drizzle"
import type { SchemaTypes } from "~~/shared/types"
import { company } from "./schema"
import { eq, sql } from "drizzle-orm"
import type { LookupItem } from "~~/shared/types"

export class Company {
    public static async select(comCode: string): Promise<SchemaTypes["company"] | null> {
        const db = useDrizzle()
        const com = await db.query.company.findFirst({
            where: (companyTable) => eq(companyTable.comCode, comCode),
        })
        return com || null
    }
    public static async selectAll(): Promise<SchemaTypes["company"][]> {
        const db = useDrizzle()
        const com = await db.query.company.findMany({
            orderBy: (companyTable) => companyTable.comCode,
        })
        return com
    }
    public static async update(com: SchemaTypes["company"]): Promise<boolean> {
        const db = useDrizzle()
        const result = await db.update(company).set(com).where(eq(company.comCode, com.comCode))
        return result[0].affectedRows == 1
    }
    
    public static async lookup(): Promise<LookupItem[]> {
        const db = useDrizzle()
        const result = await db
            .select({
                id: company.comCode,
                label: sql`concat(${company.comCode}, " : ", ${company.comName})`,
            })
            .from(company)
            .orderBy(company.comCode)
        return result
    }
}
