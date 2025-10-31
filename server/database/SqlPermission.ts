import type { Permission } from "~~/shared/schema"
import { getDB } from "./pool"
import { ResultSetHeader, RowDataPacket } from "mysql2/promise"

const db = getDB()

export class SqlPermission {
    public static async select(company: string, userId: string): Promise<Permission[]> {
        const [rows] = await db.query<RowDataPacket[]>(
            `SELECT program, level, used 
             FROM permission 
             WHERE userId=? AND comCode=?
             ORDER BY program`,
            [userId, company],
        )
        return rows as Permission[]
    }

    public static async deleteAll(comCode: string, userId: string): Promise<boolean> {
        const [result] = await db.execute(
            `DELETE FROM permission 
             WHERE comCode=? AND userId=?`,
            [comCode, userId],
        )
        return (result as ResultSetHeader).affectedRows > 0
    }

    public static async copyPermission(
        company: string,
        fromUser: string,
        toUser: string,
    ): Promise<number> {
        if (fromUser === toUser) return 0
        await db.execute(`DELETE FROM permission WHERE userId=? AND comCode=?`, [toUser, company])
        const [result] = await db.execute(
            `INSERT INTO permission (comCode, userId, program, level, used)
             SELECT comCode, ?, program, level, used 
             FROM permission 
             WHERE comCode=? AND userId=?`,
            [toUser, company, fromUser],
        )
        return (result as ResultSetHeader).affectedRows ?? 0
    }

    public static async used(comCode: string, userId: string, program: string): Promise<boolean> {
        const [result] = await db.execute(
            `UPDATE permission 
             SET used=used+1
             WHERE comCode=? AND userId=? AND program=?`,
            [comCode, userId, program],
        )
        return (result as ResultSetHeader).affectedRows > 0
    }

    public static async updateAll(
        comCode: string,
        userId: string,
        permiss: Permission[],
    ): Promise<boolean> {
        if (permiss.length === 0) return false
        const connect = await db.getConnection()
        try {
            await connect.beginTransaction()
            await connect.execute(
                `UPDATE permission SET level=-1 
                 WHERE comCode=? AND userId=?`,
                [comCode, userId],
            )
            const valuesPlaceholder = "(?, ?, ?, ?, ?)"
            const valuesToInsert: (string | number)[] = []
            for (let item of permiss)
                valuesToInsert.push(comCode, userId, item.program, item.level, item.used ?? 0)
            const placeholders = new Array(permiss.length).fill(valuesPlaceholder).join(",")
            const multiInsertQuery = `
                INSERT INTO permission (comCode, userId, program, level, used)
                VALUES ${placeholders}
                ON DUPLICATE KEY UPDATE level=VALUES(level), used=VALUES(used)`
            await connect.execute(multiInsertQuery, valuesToInsert)
            await connect.execute(
                `DELETE FROM permission WHERE comCode=? AND userId=? AND level=-1`,
                [comCode, userId],
            )
            await connect.commit()
            return true
        } catch (error) {
            console.error("Permission update failed, rolling back:", error)
            await connect.rollback()
            return false
        }
    }
}
