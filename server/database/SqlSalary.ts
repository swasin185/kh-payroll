import { getDB } from "./pool"
import { ResultSetHeader, RowDataPacket } from "mysql2/promise"
import { type Salary } from "~~/shared/schema"

const db = getDB()

export class SqlSalary {
    static async list(comCode: string, empCode: number): Promise<Salary[]> {
        const [result] = await db.query<RowDataPacket[]>(
            `SELECT *, incometype.inName FROM salary
             JOIN incometype ON salary.inCode = incometype.inCode
             WHERE comCode = ? AND empCode = ?`,
            [comCode, empCode],
        )
        return result as Salary[]
    }

    static async insert(record: Salary): Promise<string | null> {
        const [result] = await db.execute<ResultSetHeader>(
            `INSERT INTO salary (comCode, empCode, inCode, value, duration)
             VALUES (?,?,?,?,?)`,
            Object.values(record),
        )
        if (result.affectedRows === 1) return record.inCode!
        else return null
    }
    static async update(record: Salary): Promise<boolean> {
        const values = Object.values(record)
        values.shift()
        values.shift()
        values.shift()
        values.push(record.comCode, record.empCode, record.inCode!)
        const [result] = await db.execute<ResultSetHeader>(
            `UPDATE salary SET value = ?, duration = ?
             WHERE comCode = ? AND empCode = ? AND inCode = ?`,
            values,
        )
        return result.affectedRows > 0
    }

    static async delete(comCode: string, empCode: number, inCode: string): Promise<boolean> {
        const [result] = await db.execute<ResultSetHeader>(
            `DELETE FROM payroll
             WHERE comCode = ? AND empCode = ? AND inCode = ?`,
            [comCode, empCode, inCode],
        )
        return result.affectedRows > 0
    }
}
