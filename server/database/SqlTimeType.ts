import { getDB } from "./pool"
import type { LookupItem } from "~~/shared/types"
import { ResultSetHeader, RowDataPacket } from "mysql2/promise"
import { type TimeType, TimeTypeSchema } from "../../shared/schema"

const db = getDB()

export default {
    async select(inCode: string): Promise<TimeType | null> {
        const [result] = await db.query<RowDataPacket[]>(
            `SELECT *
             FROM timetype
             WHERE timeCode=?`,
            [inCode],
        )
        if (result.length !== 1) return null
        return TimeTypeSchema.parse(result[0])
    },

    async lookup(): Promise<LookupItem[]> {
        const [result] = await db.query(
            `SELECT CAST(timeCode AS CHAR) AS id, descript AS label 
             FROM timetype
             ORDER BY timeCode`,
        )
        return result as LookupItem[]
    },

    async insert(time: TimeType): Promise<boolean> {
        const [result] = await db.execute(
            `INSERT INTO timetype (
                timeCode, descript, s1Start, s1Finish, s2Start, s2Finish, s3Start, s3Finish, 
                otRate1, otRate2, otRate3, allowance1, allowance2, weekDay) 
             VALUES (?,?,?,?,?, ?,?,?,?,?, ?,?,?,?)`,
            Object.values(time),
        )
        return (result as ResultSetHeader).affectedRows === 1
    },

    async delete(inCode: string): Promise<boolean> {
        const [result] = await db.execute<ResultSetHeader>(`DELETE FROM incometype WHERE inCode=?`, [inCode])
        return result.affectedRows === 1
    },

    async update(time: TimeType): Promise<boolean> {
        const values = Object.values(time)
        values.shift()
        values.push(time.timeCode)

        const [result] = await db.execute<ResultSetHeader>(
            `UPDATE timetype 
             SET descript=?, s1Start=?, s1Finish=?, s2Start=?, s2Finish=?, s3Start=?, s3Finish=?, 
                 otRate1=?, otRate2=?, otRate3=?, allowance1=?, allowance2=?, weekDay=? WHERE timeCode=?`,
            values,
        )
        return result.affectedRows === 1
    },
}
