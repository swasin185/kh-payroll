import { useDrizzle, SchemaTypes } from "./drizzle"
import { permission } from "./schema"
import { eq, and } from "drizzle-orm"

export class Permission {
    public static async select(company: string, userId: string): Promise<any[]> {
        const db = useDrizzle()
        const permission = await db.query.permission.findMany({
            columns: {
                program: true,
                level: true,
            },
            where: (permisTable) =>
                and(eq(permisTable.userid, userId), eq(permisTable.comCode, company)),
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
                    eq(permission.userid, userId),
                    eq(permission.program, program),
                ),
            )
        return result[0].affectedRows == 1
    }

    public static async deleteAll(company: string, userId: string): Promise<boolean> {
        const db = useDrizzle()
        const result = await db
            .delete(permission)
            .where(and(eq(permission.comCode, company), eq(permission.userid, userId)))
        return result[0].affectedRows > 0
    }

    public static async copyPermission(
        company: string,
        fromUser: string,
        toUser: string,
    ): Promise<number> {
        if (fromUser === toUser) return 0
        const db = useDrizzle()
        db.execute(`delete from permission where userid = ${toUser}`)
        const result = await db.execute(`
            INSERT INTO permission
            SELECT comCode, ${toUser}, program, level 
            FROM permission 
            WHERE comCode= ${company} and userid = ${fromUser}`)
        return result[0].affectedRows || 0
    }
}
