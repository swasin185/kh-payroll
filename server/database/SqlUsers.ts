import { getDB } from "./pool"
import type { LookupItem } from "~~/shared/types"
import { ResultSetHeader, RowDataPacket } from "mysql2/promise"
import { Users } from "~~/shared/schema"

const db = getDB()

export default {
    async select(userId: string): Promise<Users> {
        const [result] = await db.query<RowDataPacket[]>(`SELECT * FROM users WHERE id=?`, [userId])
        return result[0] as Users
    },

    async lookup(): Promise<LookupItem[]> {
        const [result] = await db.query(`
            SELECT id, concat(id, ' : ', name) as label 
            FROM users 
            WHERE id!='admin' 
            ORDER BY id`)
        return result as LookupItem[]
    },

    async insert(user: Users): Promise<boolean> {
        user.id = user.id.toLowerCase().trim()
        const [result] = await db.execute(
            `insert into users (id, name, descript, level, role, comCode) 
             values (?,?,?,?,?,?)`,
            [user.id, user.name, user.descript, user.level, user.role, user.comCode],
        )
        return (result as ResultSetHeader).affectedRows === 1
    },

    async delete(userId: string): Promise<boolean> {
        const [result] = await db.execute(`delete from users where id=?`, [userId])
        return (result as ResultSetHeader).affectedRows === 1
    },

    async update(user: Users): Promise<boolean> {
        const [result] = await db.execute(`update users set name=? where id=?`, [
            user.name,
            user.id,
        ])
        return (result as ResultSetHeader).affectedRows === 1
    },

    async changePasswd(userId: string, pwd: string, newPwd: string) {
        console.log(userId, pwd, newPwd)
        if (await this.authPasswd(userId, pwd)) {
            const [result] = await db.execute(`update users set passwd=? where id=?`, [
                newPwd,
                userId,
            ])
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
