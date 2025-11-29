import { getDB } from "./pool"
import type { LookupItem } from "~~/shared/types"
import { ResultSetHeader, RowDataPacket } from "mysql2/promise"
import { type Employee, EmployeeSchema } from "../../shared/schema"

const db = getDB()

export default {
    async select(comCode: string, empCode: string): Promise<Employee | null> {
        const [result] = await db.query<RowDataPacket[]>(
            `SELECT *
             FROM employee 
             WHERE comCode=? and empCode=?`,
            [comCode, empCode],
        )
        if (result.length !== 1) return null
        return EmployeeSchema.parse(result[0])
    },

    async lookup(comCode: string): Promise<LookupItem[]> {
        const [result] = await db.query(
            `SELECT CAST(empCode AS CHAR) AS id, concat(empCode, " : ", name, " ", ifnull(surname,'')) AS label 
             FROM employee 
             WHERE comCode=?
             ORDER BY empCode`,
            [comCode],
        )
        return result as LookupItem[]
    },

    async insert(emp: Employee): Promise<boolean> {
        if (!emp.empCode || emp.empCode === 0)
            emp.empCode = await db
                .query<RowDataPacket[]>(
                    `SELECT IFNULL(MAX(empCode), 0) + 1 AS nextCode 
                     FROM employee 
                     WHERE comCode=?`,
                    [emp.comCode],
                )
                .then(([rows]) => {
                    return rows[0].nextCode as number
                })

        const [result] = await db.execute<ResultSetHeader>(
            `INSERT INTO employee  
             VALUES (?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?)`,
            Object.values(emp),
        )
        return result.affectedRows === 1
    },

    async delete(comCode: string, empCode: string): Promise<boolean> {
        const [result] = await db.execute<ResultSetHeader>(
            `DELETE FROM employee WHERE comCode=? and empCode=?`,
            [comCode, empCode],
        )
        return result.affectedRows === 1
    },

    async update(emp: Employee): Promise<boolean> {
        const values = Object.values(emp)
        values.shift() // remove comCode
        values.shift() // remove empCode
        values.push(emp.comCode, emp.empCode)
        const [result] = await db.execute<ResultSetHeader>(
            `UPDATE employee
             SET
                 taxId=?,
                 prefix=?,
                 name=?,
                 surName=?,
                 nickName=?,
                 birthDate=?,
                 department=?,
                 timeCode=?,
                 beginDate=?,
                 endDate=?,
                 empType=?,
                 bankAccount=?,
                 address=?,
                 phone=?,
                 childAll=?,
                 childEdu=?,
                 isSpouse=?,
                 isChildShare=?,
                 isExcSocialIns=?,
                 deductInsure=?,
                 deductHome=?,
                 deductElse=?,
                 scanCode=?
             WHERE
                 comCode=? and empCode=?`,
            values,
        )
        return result.affectedRows === 1
    },
}
