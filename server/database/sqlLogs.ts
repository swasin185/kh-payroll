import { getDB } from "./db"
import { ResultSetHeader, RowDataPacket } from "mysql2/promise"
import type { Logs } from "./schema" // Assuming Logs type is defined here

const db = getDB()

export class sqlLogs {
    // 1. INSERT (Drizzle to mysql2/promise)
    public static async insert(logsRecord: Logs): Promise<boolean> {
        // You must manually list all columns and use placeholders for security.
        // Assuming Logs has: logTime, logType, logMessage, and perhaps userId, comCode.
        
        // This query assumes the structure of your Logs table.
        const [result] = await db.execute(
            `INSERT INTO logs (logTime, logType, logMessage, comCode, userId) 
             VALUES (?, ?, ?, ?, ?)`,
            [
                logsRecord.logTime, 
                logsRecord.logType, 
                logsRecord.logMessage, 
                logsRecord.comCode, 
                logsRecord.userId // Adjust fields as necessary for your Logs type
            ],
        )
        
        return (result as ResultSetHeader).affectedRows === 1
    }

    // 2. SELECT (Drizzle to mysql2/promise)
    public static async selectLogsType(type: string): Promise<Logs[]> {
        const [rows] = await db.query<RowDataPacket[]>(
            `SELECT * FROM logs 
             WHERE logType = ?
             ORDER BY logTime
             LIMIT 100`,
            [type], // Pass 'type' as a parameter array for the prepared statement
        )
        
        return rows as Logs[]
    }
}