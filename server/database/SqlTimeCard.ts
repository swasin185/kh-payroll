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
             WHERE dateTxt=? and scanCode=?`,
            [dateTxt, scanCode],
        )
        return TimeCardArraySchema.parse(result)
    },

    async lookup(dateTxt: string, scanCode: string): Promise<LookupItem[]> {
        const [result] = await db.query(
            `SELECT timeTxt AS id, concat(dateTxt, ' ', timeTxt) AS label 
             FROM timecard
             WHERE dateTxt=? and scanCode=?
             ORDER BY timeTxt`,
            [dateTxt, scanCode],
        )
        return result as LookupItem[]
    },

    async insert(timeCard: TimeCard): Promise<boolean> {
        const [result] = await db.execute<ResultSetHeader>(
            `INSERT INTO timecard (dateTxt, scanCode, timeTxt) VALUES (?, ?, ?)`,
            [timeCard.dateTxt, timeCard.scanCode, timeCard.timeTxt],
        )
        return result.affectedRows === 1
    },

    async delete(dateTxt: string, scanCode: string): Promise<boolean> {
        const [result] = await db.execute<ResultSetHeader>(
            `DELETE FROM timecard WHERE dateTxt=? and scanCode=?`,
            [dateTxt, scanCode],
        )
        return result.affectedRows > 0
    },
}
