import { getDB } from "./pool"
import type { LookupItem } from "~~/shared/types"
import { ResultSetHeader, RowDataPacket } from "mysql2/promise"
import { type Employee, EmployeeSchema } from "../../shared/schema"

const db = getDB()

export default {
    async select(comCode: string, empCode: string): Promise<Employee | null> {
        const [result] = await db.query<RowDataPacket[]>(
            `SELECT * FROM employee WHERE comCode=? and empCode=? LIMIT 1`,
            [comCode, empCode],
        )
        if (result.length !== 1) return null
        const row = result[0]!
        const emp = EmployeeSchema.parse(row)
        // Provide URLs to image endpoints instead of embedding blobs
        const c = encodeURIComponent(row.comCode)
        const e = encodeURIComponent(String(row.empCode))
        ;(emp as any).photoUrl = `/api/employee/photo?comCode=${c}&empCode=${e}`
        ;(emp as any).photoThumbUrl = `/api/employee/photo?comCode=${c}&empCode=${e}&thumb=1`
        return emp
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

    async list(
        comCode: string,
        limit: number,
        offset: number,
        search?: string,
    ): Promise<{ rows: Employee[]; total: number }> {
        let whereClause = `WHERE comCode=?`
        const params: (string | number)[] = [comCode]

        if (search) {
            whereClause += ` AND (CAST(empCode AS CHAR) LIKE ? OR name LIKE ? OR surName LIKE ? OR nickName LIKE ? OR department LIKE ?)`
            const like = `%${search}%`
            params.push(like, like, like, like, like)
        }

        const [[countResult]] = await db.query<RowDataPacket[]>(
            `SELECT COUNT(*) AS total FROM employee ${whereClause}`,
            params,
        )
        const total = countResult!.total as number

        const [rows] = await db.query<RowDataPacket[]>(
            `SELECT * FROM employee ${whereClause} ORDER BY empCode LIMIT ? OFFSET ?`,
            [...params, limit, offset],
        )

        return {
            rows: rows.map((row) => {
                const emp = EmployeeSchema.parse(row)
                const c = encodeURIComponent(row.comCode)
                const e = encodeURIComponent(String(row.empCode))
                ;(emp as any).photoUrl = `/api/employee/photo?comCode=${c}&empCode=${e}`
                ;(emp as any).photoThumbUrl =
                    `/api/employee/photo?comCode=${c}&empCode=${e}&thumb=1`
                return emp
            }),
            total,
        }
    },

    async insert(emp: Employee): Promise<string | null> {
        if (!emp.empCode || emp.empCode === 0)
            emp.empCode = await db
                .query<RowDataPacket[]>(
                    `SELECT IFNULL(MAX(empCode), 0) + 1 AS nextCode
                     FROM employee
                     WHERE comCode=?`,
                    [emp.comCode],
                )
                .then(([rows]) => {
                    return rows[0]!.nextCode as number
                })

        // Explicit column list makes the insert resilient to additional columns (e.g. photoThumb)
        const [result] = await db.execute<ResultSetHeader>(
            `INSERT IGNORE INTO employee (
                comCode, empCode, taxId, prefix, name, surName, nickName,
                birthDate, department, timeCode, beginDate, endDate, empType,
                bankAccount, address, phone, childAll, childEdu, isSpouse,
                isChildShare, isExcSocialIns, deductInsure, deductHome, deductElse,
                scanCode
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            Object.values(emp),
        )
        if (result.affectedRows === 1) return emp.empCode.toString()
        else return null
    },

    async delete(comCode: string, empCode: string): Promise<boolean> {
        const [result] = await db.execute<ResultSetHeader>(
            `update employee set endDate=now(), empType=null WHERE comCode=? and empCode=?`,
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
