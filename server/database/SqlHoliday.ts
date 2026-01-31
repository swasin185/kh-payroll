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
             WHERE comCode=? and day=?`,
            [comCode, dateValue],
        )
        if (result.length !== 1) return null
        return HolidaySchema.parse(result[0])
    },

    async lookup(comCode: string, year?: string): Promise<LookupItem[]> {
        const query = `SELECT day AS id, concat(day, " : ", name) AS label 
             FROM holiday
             WHERE comCode=? ${year ? "AND YEAR(day)=?" : ""}
             ORDER BY day`
        const params = year ? [comCode, year] : [comCode]
        const [result] = await db.query(query, params)
        return result as LookupItem[]
    },

    async list(comCode: string, startDate: Date, endDate: Date): Promise<Holiday[]> {
        const [result] = await db.query<RowDataPacket[]>(
            `SELECT *
             FROM holiday
             WHERE comCode=? AND day >= ? AND day <= ?
             ORDER BY day`,
            [comCode, startDate, endDate],
        )
        return result.map(row => HolidaySchema.parse(row))
    },

    async insert(day: Holiday): Promise<boolean> {
        const [result] = await db.execute(
            `INSERT IGNORE INTO holiday (comCode, day, name) 
             VALUES (?,?,?)`,
            Object.values(day),
        )
        return (result as ResultSetHeader).affectedRows === 1
    },

    async delete(comCode: string, day: string): Promise<boolean> {
        console.log(day)
        const [result] = await db.execute<ResultSetHeader>(
            `DELETE FROM holiday WHERE comCode=? and day=?`,
            [comCode, day],
        )
        return result.affectedRows === 1
    },

    async update(day: Holiday): Promise<boolean> {
        const values = Object.values(day)
        values.shift()
        values.shift()
        values.push(day.comCode, day.day)

        const [result] = await db.execute<ResultSetHeader>(
            `UPDATE holiday 
             SET name=?
             WHERE comCode=? and day=?`,
            values,
        )
        return result.affectedRows === 1
    },
}
