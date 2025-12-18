import { getDB } from "./pool"
import { ResultSetHeader, RowDataPacket } from "mysql2/promise"
import { type LookupItem } from "~~/shared/types"
import { type Company, CompanySchema, CompanyArraySchema } from "../../shared/schema"

const db = getDB()

export default {
    async select(comCode: string): Promise<Company | null> {
        const [result] = await db.query<RowDataPacket[]>(`SELECT * FROM company WHERE comCode=?`, [
            comCode,
        ])
        if (result.length !== 1) return null
        return CompanySchema.parse(result[0])
    },

    async selectAll(): Promise<Company[]> {
        const [rows] = await db.query<RowDataPacket[]>(`SELECT * FROM company ORDER BY comCode`)
        return CompanyArraySchema.parse(rows)
    },

    async insert(com: Company): Promise<boolean> {
        const [result] = await db.execute<ResultSetHeader>(
            `INSERT INTO company (comCode, comName, taxId, address, phone, email1, email2, email3) 
             VALUES (?,?,?,?,?,?,?,?)`,
            Object.values(com),
        )
        return result.affectedRows === 1
    },

    async update(com: Company): Promise<boolean> {
        const values = Object.values(com)
        values.shift()
        values.push(com.comCode)

        const [result] = await db.execute<ResultSetHeader>(
            `UPDATE company 
             SET comName=?, taxId=?, address=?, phone=?, email1=?, email2=?, email3=?, 
                 yrPayroll=?, mnPayroll=?
             WHERE comCode=?`,
            values,
        )
        return result.affectedRows === 1
    },

    async lookup(): Promise<LookupItem[]> {
        const [rows] = await db.query<RowDataPacket[]>(
            `SELECT comCode AS id, CONCAT(comCode, ' : ', comName) AS label 
             FROM company
             ORDER BY comCode`,
        )
        return rows as LookupItem[]
    },
}
