import { getDB } from "./pool"
import type { LookupItem } from "~~/shared/types"
import { RowDataPacket, ResultSetHeader } from "mysql2/promise"
import { type TimeCard, TimeCardArraySchema } from "../../shared/schema"

const db = getDB()

export default {
    async select(dateTxt: string, scanCode: string): Promise<TimeCard[]> {
        const [result] = await db.query<RowDataPacket[]>(
            `SELECT *
             FROM timecard
             WHERE DATE(scanAt)=? and scanCode=?`,
            [dateTxt, scanCode],
        )
        return TimeCardArraySchema.parse(result)
    },

    async lookup(dateTxt: string, scanCode: string): Promise<LookupItem[]> {
        const [result] = await db.query(
            `SELECT DATE_FORMAT(scanAt, '%H:%i') AS id, DATE_FORMAT(scanAt, '%Y-%m-%d %H:%i') AS label 
             FROM timecard
             WHERE DATE(scanAt)=? and scanCode=?
             ORDER BY scanAt`,
            [dateTxt, scanCode],
        )
        return result as LookupItem[]
    },

    async insert(timeCard: TimeCard): Promise<boolean> {
        const [result] = await db.execute<ResultSetHeader>(
            `INSERT INTO timecard (scanCode, scanAt) VALUES (?, ?)`,
            [timeCard.scanCode, timeCard.scanAt],
        )
        return result.affectedRows === 1
    },

    async delete(dateTxt: string, scanCode: string): Promise<boolean> {
        const [result] = await db.execute<ResultSetHeader>(
            `DELETE FROM timecard WHERE DATE(scanAt)=? and scanCode=?`,
            [dateTxt, scanCode],
        )
        return result.affectedRows > 0
    },
}
