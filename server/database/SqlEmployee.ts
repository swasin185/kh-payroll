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
            `SELECT CAST(empCode AS CHAR) AS id, concat(empCode, " : ", name, " ", surName) AS label 
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

        const valueArray = Object.entries(emp).map(([key, value]) => {
            return value
        })
        const [result] = await db.execute(
            `INSERT INTO employee  
             VALUES (?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?)`,
            valueArray,
        )
        return (result as ResultSetHeader).affectedRows === 1
    },

    async delete(comCode: string, empCode: string): Promise<boolean> {
        const [result] = await db.execute(`DELETE FROM employee WHERE comCode=? and empCode=?`, [
            comCode,
            empCode,
        ])
        return (result as ResultSetHeader).affectedRows === 1
    },

    async update(emp: Employee): Promise<boolean> {
        const valueArray = Object.entries(emp).map(([key, value]) => {
            return value
        })
        const comCode = valueArray[0]
        const empCode = valueArray[1]
        for (let i = 2; i < valueArray.length; i++) valueArray[i - 2] = valueArray[i]
        valueArray[valueArray.length - 2] = comCode
        valueArray[valueArray.length - 1] = empCode
        const [result] = await db.execute(
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
            valueArray,
        )
        return (result as ResultSetHeader).affectedRows === 1
    },
}
