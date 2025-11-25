import { getDB } from "./pool"
import type { LookupItem } from "~~/shared/types"
import { ResultSetHeader, RowDataPacket } from "mysql2/promise"
import { type Holiday, HolidaySchema } from "../../shared/schema"

const db = getDB()

export default {
    async select(comCode: string, dateValue: Date): Promise<Holiday | null> {
        const [result] = await db.query<RowDataPacket[]>(
            `SELECT *
             FROM holiday
             WHERE comCode=? and dateValue=?`,
            [comCode, dateValue],
        )
        if (result.length !== 1) return null
        return HolidaySchema.parse(result[0])
    },

    async lookup(comCode: string): Promise<LookupItem[]> {
        const [result] = await db.query(
            `SELECT dateValue AS id, dateName AS label 
             FROM holiday
             WHERE comCode=?
             ORDER BY dateValue`,
            [comCode],
        )
        return result as LookupItem[]
    },

    async insert(day: Holiday): Promise<boolean> {
        const [result] = await db.execute(
            `INSERT INTO holiday (comCode, dateValue, dateName) 
             VALUES (?,?,?)`,
            Object.values(day),
        )
        return (result as ResultSetHeader).affectedRows === 1
    },

    async delete(comCode: string, dateValue: Date): Promise<boolean> {
        const [result] = await db.execute<ResultSetHeader>(
            `DELETE FROM holiday WHERE comCode=? and dateValue=?`,
            [comCode, dateValue],
        )
        return result.affectedRows === 1
    },

    async update(day: Holiday): Promise<boolean> {
        const values = Object.values(day)
        values.shift()
        values.shift()
        values.push(day.comCode, day.dateValue)

        const [result] = await db.execute<ResultSetHeader>(
            `UPDATE timetype 
             SET dateName=?, 
             WHERE comCode=? and dateValue=?`,
            values,
        )
        return result.affectedRows === 1
    },
}
