import { useDrizzle, SchemaTypes } from "./drizzle"
import { company } from "./schema"
import { eq } from "drizzle-orm"
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
        try {
            const result = await db.update(company).set(com).where(eq(company.comCode, com.comCode))
            return result[0].affectedRows == 1
        } catch (error) {
            throw new Error(`Failed to update company: ${(error as Error).message}`)
        }
    }
}
