import mysql from "mysql2/promise"

const config: mysql.PoolOptions = {
    host: process.env.DB_HOST ?? "localhost",
    port: Number.parseInt(process.env.DB_PORT ?? "3306"),
    user: process.env.DB_USER ?? "pr-user",
    password: process.env.DB_PASSWORD ?? "A1b2C3d4#",
    database: process.env.DB_NAME ?? "payroll",
    connectionLimit: Number.parseInt(process.env.DB_CONNECTION_LIMIT ?? "100"),
    waitForConnections: true,
    enableKeepAlive: true,
    idleTimeout: 60000,
    queueLimit: 0,
    timezone: "+07:00",
}

if (config.host !== "localhost" && config.host !== "127.0.0.1")
    config.ssl = {
        rejectUnauthorized:
            process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" &&
            process.env.NODE_TLS_REJECT_UNAUTHORIZED !== "0",
    }

const poolConnection: mysql.Pool = mysql.createPool(config)

export function getDB(): mysql.Pool {
    return poolConnection
}
