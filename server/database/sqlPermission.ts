import type { Permission } from "~~/shared/schema"
import { getDB } from "./db"
import { ResultSetHeader, RowDataPacket } from "mysql2/promise"

const db = getDB()

export class sqlPermission {
    public static async select(company: string, userId: string): Promise<Permission[]> {
        const [rows] = await db.query<RowDataPacket[]>(
            `SELECT program, level, used 
             FROM permission 
             WHERE userId = ? AND comCode = ?
             ORDER BY program`,
            [userId, company],
        )
        return rows as Permission[]
    }

    public static async deleteAll(comCode: string, userId: string): Promise<boolean> {
        const [result] = await db.execute(
            `DELETE FROM permission 
             WHERE comCode = ? AND userId = ?`,
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

        await db.execute(`DELETE FROM permission WHERE userId = ? AND comCode = ?`, [
            toUser,
            company,
        ])

        const [result] = await db.execute(
            `INSERT INTO permission (comCode, userId, program, level, used)
             SELECT comCode, ?, program, level, used 
             FROM permission 
             WHERE comCode = ? AND userId = ?`,
            [toUser, company, fromUser],
        )

        return (result as ResultSetHeader).affectedRows ?? 0
    }

    public static async used(comCode: string, userId: string, program: string): Promise<boolean> {
        const [result] = await db.execute(
            `UPDATE permission 
             SET used = used + 1
             WHERE comCode = ? AND userId = ? AND program = ?`,
            [comCode, userId, program],
        )
        return (result as ResultSetHeader).affectedRows > 0
    }

    public static async updateAll(
        comCode: string,
        userId: string,
        permiss: Permission[],
    ): Promise<boolean> {
        let rowEffected = 0

        const [updateResult] = await db.execute(
            `UPDATE permission SET level = -1 
             WHERE comCode = ? AND userId = ?`,
            [comCode, userId],
        )
        rowEffected += (updateResult as ResultSetHeader).affectedRows

        if (permiss.length > 0) {
            const valuesPlaceholder = "(?, ?, ?, ?, ?)"
            const valuesToInsert: (string | number)[] = []

            permiss.forEach((item) => {
                valuesToInsert.push(comCode, userId, item.program, item.level, item.used ?? 0)
            })

            const placeholders = Array(permiss.length).fill(valuesPlaceholder).join(", ")

            if (permiss.length > 0) {
                const multiInsertQuery = `
                    INSERT INTO permission (comCode, userId, program, level, used)
                    VALUES ${placeholders}
                    ON DUPLICATE KEY UPDATE level = VALUES(level), used = VALUES(used)
                `
                const [insertResult] = await db.execute(multiInsertQuery, valuesToInsert)
                rowEffected += (insertResult as ResultSetHeader).affectedRows / 2
            }
        }

        const [deleteResult] = await db.execute(
            `DELETE FROM permission 
             WHERE comCode = ? AND userId = ? AND level = -1`,
            [comCode, userId],
        )
        rowEffected += (deleteResult as ResultSetHeader).affectedRows

        return rowEffected > 0
    }
}
