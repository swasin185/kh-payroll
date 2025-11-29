import { getDB } from "./pool"
import type { LookupItem } from "~~/shared/types"
import { RowDataPacket } from "mysql2/promise"
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
}
