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
        console.log(result[0])
        if (result.length !== 1) return null
        return CompanySchema.parse(result[0])
    },

    async selectAll(): Promise<Company[]> {
        const [rows] = await db.query<RowDataPacket[]>(`SELECT * FROM company ORDER BY comCode`)
        return CompanyArraySchema.parse(rows)
    },

    async insert(com: Company): Promise<boolean> {
        const [result] = await db.execute(
            `INSERT INTO company (comCode, comName, taxId, address, phone, email1, email2, email3) 
             VALUES (?,?,?,?,?,?,?,?)`,
            [
                com.comCode,
                com.comName,
                com.taxId,
                com.address,
                com.phone,
                com.email1,
                com.email2,
                com.email3,
            ],
        )
        return (result as ResultSetHeader).affectedRows === 1
    },

    async update(com: Company): Promise<boolean> {
        const [result] = await db.execute(
            `UPDATE company 
             SET comName=?, taxId=?, address=?, phone=?, email1=?, email2=?, email3=?, 
                 yrPayroll=?, mnPayroll=?
             WHERE comCode=?`,
            [
                com.comName,
                com.taxId,
                com.address,
                com.phone,
                com.email1,
                com.email2,
                com.email3,
                com.yrPayroll,
                com.mnPayroll,
                com.comCode,
            ],
        )
        return (result as ResultSetHeader).affectedRows === 1
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
