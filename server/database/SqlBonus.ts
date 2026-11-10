import { getDB } from "./pool"
import { ResultSetHeader, RowDataPacket } from "mysql2/promise"
import { type Salary } from "~~/shared/schema"

const db = getDB()

export class SqlBonus {
    static async list(comCode: string, empCode: number): Promise<Salary[]> {
        const [result] = await db.query<RowDataPacket[]>(
            `SELECT salary.*, incometype.inName FROM salary
             JOIN incometype ON salary.inCode = incometype.inCode
             WHERE salary.comCode = ? AND salary.empCode = ?
               AND incometype.isBonus = 1`,
            [comCode, empCode],
        )
        return result as Salary[]
    }

    static async insert(record: Salary): Promise<string | null> {
        const [result] = await db.execute<ResultSetHeader>(
            `INSERT INTO salary (comCode, empCode, inCode, value, duration)
             SELECT ?, ?, ?, ?, ?
             FROM incometype
             WHERE inCode = ? AND isBonus = 1
             LIMIT 1`,
            [record.comCode, record.empCode, record.inCode, record.value, record.duration, record.inCode],
        )
        if (result.affectedRows === 1) return record.inCode!
        else return null
    }

    static async update(record: Salary): Promise<boolean> {
        const [result] = await db.execute<ResultSetHeader>(
            `UPDATE salary
             JOIN incometype ON salary.inCode = incometype.inCode
             SET salary.value = ?, salary.duration = ?
             WHERE salary.comCode = ? AND salary.empCode = ? AND salary.inCode = ?
               AND incometype.isBonus = 1`,
            [record.value, record.duration, record.comCode, record.empCode, record.inCode],
        )
        return result.affectedRows > 0
    }

    static async delete(comCode: string, empCode: number, inCode: string): Promise<boolean> {
        const [result] = await db.execute<ResultSetHeader>(
            `DELETE salary FROM salary
             JOIN incometype ON salary.inCode = incometype.inCode
             WHERE salary.comCode = ? AND salary.empCode = ? AND salary.inCode = ?
               AND incometype.isBonus = 1`,
            [comCode, empCode, inCode],
        )
        return result.affectedRows > 0
    }
}
