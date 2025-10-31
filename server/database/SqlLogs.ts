import { getDB } from "./pool"
import { ResultSetHeader, RowDataPacket } from "mysql2/promise"
import type { Logs } from "~~/shared/schema"

const db = getDB()

export default {
    async insert(logs: Logs): Promise<boolean> {
        const [result] = await db.execute(
            `INSERT INTO logs (logTime, logType, userId, program, tableName, changed, comCode) 
             VALUES (?,?,?,?,?,?,?)`,
            [
                logs.logTime,
                logs.logType,
                logs.userId,
                logs.program,
                logs.tableName,
                logs.changed,
                logs.comCode,
            ],
        )
        return (result as ResultSetHeader).affectedRows === 1
    },

    async selectLogsType(type: string): Promise<Logs[]> {
        const [rows] = await db.query<RowDataPacket[]>(
            `SELECT * FROM logs 
             WHERE logType = ?
             ORDER BY logTime
             LIMIT 100`,
            [type],
        )
        return rows as Logs[]
    },

    async selectLogsLogin(userId: string): Promise<Logs[]> {
        const [rows] = await db.query<RowDataPacket[]>(
            `SELECT * FROM logs 
             WHERE logType='login' and userId=?
             ORDER BY logTime
             LIMIT 20`,
            [userId],
        )
        return rows as Logs[]
    },
}
