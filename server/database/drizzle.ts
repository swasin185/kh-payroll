import { PoolOptions } from "mysql2"
import { drizzle } from "drizzle-orm/mysql2"
import mysql from "mysql2/promise"
import * as schema from "./schema"

const config: PoolOptions = {
    host: process.env.DB_HOST ?? "localhost",
    port: Number.parseInt(process.env.DB_PORT ?? "3306"),
    user: process.env.DB_USER ?? "pr-user",
    password: process.env.DB_PASSWORD ?? "pr-user",
    database: process.env.DB_NAME ?? "payroll",
    connectionLimit: Number.parseInt(process.env.DB_CONNECTION_LIMIT ?? "100"),
    waitForConnections: true,
    queueLimit: 0,
    timezone: "+07:00",
}

if (process.env.DB_HOST && process.env.DB_HOST != "localhost")
    config.ssl = {
        // ca: fs.readFileSync('/path/to/ca.pem'),
        // key: fs.readFileSync('/path/to/client-key.pem'),
        // cert: fs.readFileSync('/path/to/client-cert.pem'),
        rejectUnauthorized: true,
    }

const poolConnection = mysql.createPool(config)

export function useDrizzle() {
    return drizzle(poolConnection, { schema: schema, mode: "default" })
}

export function closeDrizzle() {
    poolConnection.end()
}

// Move to /shared/utils.ts
// export type SchemaTypes = {
//     [K in keyof typeof schema]: (typeof schema)[K] extends { $inferSelect: infer T } ? T : never
// }