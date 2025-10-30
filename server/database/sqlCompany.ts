import { getDB } from "./pool"
import { ResultSetHeader, RowDataPacket } from "mysql2/promise"
import type { LookupItem } from "~~/shared/types"
import type { Company } from "~~/shared/schema"

const db = getDB()

export class sqlCompany {

    public static async select(comCode: string): Promise<Company> {
        const [rows] = await db.query<RowDataPacket[]>(
            `SELECT * FROM company WHERE comCode=?`,
            [comCode], 
        )
        return rows[0] as Company
    }

    public static async selectAll(): Promise<Company[]> {
        const [rows] = await db.query<RowDataPacket[]>(`SELECT * FROM company order by comCode`)
        return rows as Company[]
    }

    public static async insert(com: Company): Promise<boolean> {
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
    }

    public static async update(com: Company): Promise<boolean> {
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
    }

    public static async lookup(): Promise<LookupItem[]> {
        const [rows] = await db.query<RowDataPacket[]>(`
            SELECT comCode, CONCAT(comCode, ' : ', comName) AS label 
            FROM company
            ORDER BY comCode`)
        return rows as LookupItem[]
    }
}
