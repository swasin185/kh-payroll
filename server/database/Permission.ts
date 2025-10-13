import type { SchemaTypes } from "~~/shared/utils"
import { useDrizzle } from "./drizzle"
import { permission } from "./schema"
import { eq, and, sql } from "drizzle-orm"

export class Permission {
    public static async select(company: string, userId: string): Promise<any[]> {
        const db = useDrizzle()
        const permission = await db.query.permission.findMany({
            columns: {
                program: true,
                level: true,
                used: true,
            },
            where: (permisTable) =>
                and(eq(permisTable.userId, userId), eq(permisTable.comCode, company)),
            orderBy: (permisTable) => permisTable.program,
        }) 
        return permission
    }

    public static async insert(perm: SchemaTypes["permission"]): Promise<boolean> {
        const db = useDrizzle()
        const result = await db.insert(permission).values(perm)
        return result[0].affectedRows == 1
    }

    public static async delete(company: string, userId: string, program: string): Promise<boolean> {
        const db = useDrizzle()
        const result = await db
            .delete(permission)
            .where(
                and(
                    eq(permission.comCode, company),
                    eq(permission.userId, userId),
                    eq(permission.program, program),
                ),
            )
        return result[0].affectedRows == 1
    }

    public static async deleteAll(company: string, userId: string): Promise<boolean> {
        const db = useDrizzle()
        const result = await db
            .delete(permission)
            .where(and(eq(permission.comCode, company), eq(permission.userId, userId)))
        return result[0].affectedRows > 0
    }

    public static async copyPermission(
        company: string,
        fromUser: string,
        toUser: string,
    ): Promise<number> {
        if (fromUser === toUser) return 0
        const db = useDrizzle()
        db.execute(`delete from permission where userId = ${toUser}`)
        const result = await db.execute(`
            INSERT INTO permission
            SELECT comCode, ${toUser}, program, level 
            FROM permission 
            WHERE comCode= ${company} and userId = ${fromUser}`)
        return result[0].affectedRows || 0
    }

    public static async used(company: string, userId: string, program: string): Promise<number> {
        const db = useDrizzle()
        const result = await db
            .update(permission)
            .set({
                used: sql`${permission.used} + 1`,
            })
            .where(
                and(
                    eq(permission.comCode, company),
                    eq(permission.userId, userId),
                    eq(permission.program, program),
                ),
            )
        return result[0].affectedRows
    }
}
