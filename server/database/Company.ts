import { useDrizzle } from "./drizzle"
import type { SchemaTypes } from "~~/shared/types"
import { company } from "./schema"
import { eq, sql } from "drizzle-orm"
import type { LookupItem } from "~~/shared/types"
type TypeCompany = SchemaTypes["company"]
export class Company {
    public static async select(comCode: string) {
        const db = useDrizzle()
        const com = await db.query.company.findFirst({
            where: (companyTable) => eq(companyTable.comCode, comCode),
        })
        return com 
    }
    public static async selectAll(): Promise<TypeCompany[]> {
        const db = useDrizzle()
        const com = await db.query.company.findMany({
            orderBy: (companyTable) => companyTable.comCode,
        })
        return com
    }

    public static async insert(com: TypeCompany): Promise<boolean> {
        const db = useDrizzle()
        const result = await db.insert(company).values(com)
        return result[0].affectedRows == 1
    }

    public static async update(com: TypeCompany): Promise<boolean> {
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
