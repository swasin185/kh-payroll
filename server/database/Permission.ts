import type { SchemaTypes } from "~~/shared/types"
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

    public static async delete(comCode: string, userId: string, program: string): Promise<boolean> {
        const db = useDrizzle()
        const result = await db
            .delete(permission)
            .where(
                and(
                    eq(permission.comCode, comCode),
                    eq(permission.userId, userId),
                    eq(permission.program, program),
                ),
            )
        return result[0].affectedRows == 1
    }

    public static async deleteAll(comCode: string, userId: string): Promise<boolean> {
        const db = useDrizzle()
        const result = await db
            .delete(permission)
            .where(and(eq(permission.comCode, comCode), eq(permission.userId, userId)))
        return result[0].affectedRows > 0
    }

    public static async copyPermission(
        company: string,
        fromUser: string,
        toUser: string,
    ): Promise<number> {
        if (fromUser === toUser) return 0
        const db = useDrizzle()
        await db.execute(`delete from permission where userId = ${toUser}`)
        const result = await db.execute(`
            INSERT INTO permission
            SELECT comCode, ${toUser}, program, level 
            FROM permission 
            WHERE comCode= ${company} and userId = ${fromUser}`)
        return result[0].affectedRows || 0
    }

    public static async used(comCode: string, userId: string, program: string): Promise<number> {
        const db = useDrizzle()
        const result = await db
            .update(permission)
            .set({
                used: sql`${permission.used} + 1`,
            })
            .where(
                and(
                    eq(permission.comCode, comCode),
                    eq(permission.userId, userId),
                    eq(permission.program, program),
                ),
            )
        return result[0].affectedRows
    }

    public static async updateAll(
        comCode: string,
        userId: string,
        permiss: SchemaTypes["permission"][],
    ): Promise<boolean> {
        permiss.forEach((item) => {
            item.userId = userId
            item.comCode = comCode
        })
        const db = useDrizzle()
        let result = null
        let rowEffected = 0
        result = await db
            .update(permission)
            .set({ level: -1 })
            .where(and(eq(permission.comCode, comCode), eq(permission.userId, userId)))
        rowEffected = result[0].affectedRows
        if (permiss.length > 0) {
            result = await db
                .insert(permission)
                .values(permiss)
                .onDuplicateKeyUpdate({ set: { level: sql`VALUES(level)` } })
            rowEffected += result[0].affectedRows
        }
        result = await db
            .delete(permission)
            .where(
                and(
                    eq(permission.comCode, comCode),
                    eq(permission.userId, userId),
                    eq(permission.level, -1),
                ),
            )
        rowEffected += result[0].affectedRows
        return rowEffected > 0
    }
}
