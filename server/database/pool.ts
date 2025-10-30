import { PoolOptions, Pool } from "mysql2/promise";
import mysql from "mysql2/promise"

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
        rejectUnauthorized: true,
    }

const poolConnection : Pool = mysql.createPool(config)

export function getDB() : Pool {
    return poolConnection;
}
