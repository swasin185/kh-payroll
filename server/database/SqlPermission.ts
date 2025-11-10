import { getDB } from "./pool"
import { ResultSetHeader, RowDataPacket, escape } from "mysql2/promise"
import { type Permission } from "../../shared/schema"

const db = getDB()

export default {
    async select(company: string, userId: string): Promise<Permission[]> {
        const [rows] = await db.query<RowDataPacket[]>(
            `SELECT program, level, used 
             FROM permission 
             WHERE userId=? AND comCode=?
             ORDER BY program`,
            [userId, company],
        )
        return rows as Permission[]
    },

    async deleteAll(comCode: string, userId: string): Promise<boolean> {
        const [result] = await db.execute<ResultSetHeader>(
            `DELETE FROM permission 
             WHERE comCode=? AND userId=?`,
            [comCode, userId],
        )
        return result.affectedRows > 0
    },

    async copyPermission(company: string, fromUser: string, toUser: string): Promise<number> {
        if (fromUser === toUser) return 0
        await db.execute(`DELETE FROM permission WHERE userId=? AND comCode=?`, [toUser, company])
        const [result] = await db.execute<ResultSetHeader>(
            `INSERT INTO permission (comCode, userId, program, level, used)
             SELECT comCode, ?, program, level, used 
             FROM permission 
             WHERE comCode=? AND userId=?`,
            [toUser, company, fromUser],
        )
        return result.affectedRows ?? 0
    },

    async used(comCode: string, userId: string, program: string): Promise<boolean> {
        const [result] = await db.execute<ResultSetHeader>(
            `UPDATE permission 
             SET used=used+1
             WHERE comCode=? AND userId=? AND program=?`,
            [comCode, userId, program],
        )
        return result.affectedRows > 0
    },

    async updateAll(comCode: string, userId: string, permiss: Permission[]): Promise<boolean> {
        if (permiss.length === 0) return false
        const connect = await db.getConnection()
        let result = false
        try {
            await connect.beginTransaction()
            await connect.execute(
                `UPDATE permission SET level=-1 
                 WHERE comCode=? AND userId=?`,
                [comCode, userId],
            )
            const valuesList = permiss.map(
                (item) =>
                    `(${escape(comCode)}, 
                      ${escape(userId)}, 
                      ${escape(item.program)}, 
                      ${item.level}, 
                      ${item.used ?? 0})`,
            )
            await connect.execute(
                `INSERT INTO permission (comCode, userId, program, level, used)
                 VALUES ${valuesList.join(",")}
                 ON DUPLICATE KEY UPDATE level=VALUES(level), used=VALUES(used)`,
            )
            await connect.execute(
                `DELETE FROM permission WHERE comCode=? AND userId=? AND level=-1`,
                [comCode, userId],
            )
            await connect.commit()
            result = true
        } catch (error) {
            console.error("Permission update failed, rolling back:", error)
            await connect.rollback()
        } finally {
            connect.release()
        }
        return result
    },
}
