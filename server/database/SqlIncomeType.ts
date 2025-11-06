import { getDB } from "./pool"
import type { LookupItem } from "~~/shared/types"
import { ResultSetHeader, RowDataPacket } from "mysql2/promise"
import { type IncomeType, IncomeTypeSchema } from "../../shared/schema"

const db = getDB()

export default {
    async select(inCode: string): Promise<IncomeType | null> {
        const [result] = await db.query<RowDataPacket[]>(
            `SELECT inCode, inName, inType, isTax, isReset, initLimit, initPercent
             FROM incometype WHERE inCode=?`,
            [inCode],
        )
        if (result.length != 1) return null
        return IncomeTypeSchema.parse(result[0])
    },

    async lookup(): Promise<LookupItem[]> {
        const [result] = await db.query(
            `SELECT inCode AS id, concat(inName) AS label 
             FROM incometype 
             ORDER BY inCode`)
        return result as LookupItem[]
    },

    async insert(inc: IncomeType): Promise<boolean> {
        const [result] = await db.execute(
            `INSERT INTO incometype (inCode, inName, inType, isTax, isReset, initLimit, initPercent) 
             VALUES (?,?,?,?,?,?,?)`,
            [
                inc.inCode,
                inc.inName,
                inc.inType,
                inc.isTax,
                inc.isReset,
                inc.initLimit,
                inc.initPercent,
            ],
        )
        return (result as ResultSetHeader).affectedRows === 1
    },

    async delete(inCode: string): Promise<boolean> {
        const [result] = await db.execute(`DELETE FROM incometype WHERE inCode=?`, [inCode])
        return (result as ResultSetHeader).affectedRows === 1
    },

    async update(inc: IncomeType): Promise<boolean> {
        const [result] = await db.execute(
            `UPDATE incometype SET inName=?, inType=?, isTax=?, isReset=?, initLimit=?, initPercent=? WHERE inCode=?`,
            [
                inc.inName,
                inc.inType,
                inc.isTax,
                inc.isReset,
                inc.initLimit,
                inc.initPercent,
                inc.inCode,
            ],
        )
        return (result as ResultSetHeader).affectedRows === 1
    },
}
