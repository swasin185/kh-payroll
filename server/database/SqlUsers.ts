import { getDB } from "./pool"
import { type LookupItem } from "~~/shared/types"
import { ResultSetHeader, RowDataPacket } from "mysql2/promise"
import { type Users, UsersSchema } from "../../shared/schema"

const db = getDB()

export default {
    async select(userId: string): Promise<Users | null> {
        const [result] = await db.query<RowDataPacket[]>(
            `SELECT id, name, descript, level, role, 
                 passwdTime, 
                 LEFT(created, 10) created, 
                 LEFT(stoped, 10) stoped, comCode
             FROM users WHERE id=?`,
            [userId],
        )
        if (result.length !== 1) return null
        return UsersSchema.parse(result[0])
    },

    async lookup(): Promise<LookupItem[]> {
        const [result] = await db.query(`
            SELECT id, concat(id, ' : ', name) AS label 
            FROM users 
            WHERE id!='admin' 
            ORDER BY id`)
        return result as LookupItem[]
    },

    async insert(user: Users): Promise<boolean> {
        user.id = user.id.toLowerCase().trim()
        const [result] = await db.execute(
            `INSERT INTO users (id, name, descript, level, role, comCode) 
             VALUES (?,?,?,?,?,?)`,
            [user.id, user.name, user.descript, user.level, user.role, user.comCode],
        )
        return (result as ResultSetHeader).affectedRows === 1
    },

    async delete(userId: string): Promise<boolean> {
        const [result] = await db.execute(`DELETE FROM users WHERE id=?`, [userId])
        return (result as ResultSetHeader).affectedRows === 1
    },

    async update(user: Users): Promise<boolean> {
        const [result] = await db.execute(
            `UPDATE users SET name=?, descript=?, level=?, role=?, comCode=? WHERE id=?`,
            [user.name, user.descript, user.level, user.role, user.comCode, user.id],
        )
        return (result as ResultSetHeader).affectedRows === 1
    },

    async changePasswd(userId: string, pwd: string, newPwd: string) {
        if (await this.authPasswd(userId, pwd)) {
            const [result] = await db.execute(
                `update users set passwd=?, passwdTime=now() where id=?`,
                [newPwd, userId],
            )
            return (result as ResultSetHeader).affectedRows === 1
        } else {
            return false
        }
    },

    async authPasswd(userId: string, pwd: string) {
        const [result] = await db.query<RowDataPacket[]>(
            `select id from users where id=? and (passwd is null or passwd=?)`,
            [userId, pwd],
        )
        return result.length === 1
    },
}
