import { getDB } from "./pool"
import { ResultSetHeader, RowDataPacket } from "mysql2/promise"
import { type Attendance, AttendanceArraySchema } from "../../shared/schema"

const db = getDB()

export default {
    async select(
        comCode: string,
        empCode: string,
        fromDate: string,
        toDate: string,
    ): Promise<Attendance[] | null> {
        const [result] = await db.query<RowDataPacket[]>(
            `SELECT *
             FROM attendance 
             WHERE comCode=? and empCode=? and dateTxt between ? and ?`,
            [comCode, empCode, fromDate, toDate],
        )
        return AttendanceArraySchema.parse(result)
    },

    async insert(att: Attendance): Promise<boolean> {
        const [result] = await db.execute<ResultSetHeader>(
            `INSERT IGNORE INTO attendance
             VALUES (?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?)`,
            Object.values(att),
        )
        return result.affectedRows === 1
    },

    async delete(comCode: string, empCode: string, dateTxt: string): Promise<boolean> {
        const [result] = await db.execute<ResultSetHeader>(
            `DELETE FROM attendance WHERE comCode=? and empCode=? and dateTxt=?`,
            [comCode, empCode, dateTxt],
        )
        return result.affectedRows === 1
    },

    async update(att: Attendance): Promise<boolean> {
        const values = Object.values(att)
        values.shift() // remove comCode
        values.shift() // remove empCode
        values.shift() // remove comCode
        values.push(att.comCode, att.empCode, att.dateTxt)
        const [result] = await db.execute<ResultSetHeader>(
            `UPDATE attendance
             SET
                inTime1=?,
                outTime1=?,
                lateMin1=?,
                inTime2=?,
                outTime2=?,
                lateMin2=?,
                inTime3=?,
                outTime3=?,
                lateMin3=?,
                workMin=?,
                otMin=?,
                lunchMin=?
             WHERE
                comCode=? and empCode=? and dateTxt=?`,
            values,
        )
        return result.affectedRows === 1
    },
}
