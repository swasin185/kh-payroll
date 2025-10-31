import * as ADODB from "node-adodb"
import * as mariadb from "mariadb"
import dayjs from "dayjs"

// --- Configuration ---
// Adjust these connection strings and file path as needed for your environment.
const MDB_FILE_PATH: string = process.argv[2] || "/home/tom/ATT2000.MDB"

// The ADODB connection string for MS Access. This assumes you have the appropriate
// ODBC driver installed (e.g., Microsoft Access Driver (*.mdb, *.accdb)).
// You might need to adjust the Provider based on your OS and driver version.
// On Linux (using MDBTools or similar), this connection string will be different.
const ADODB_CONNECTION_STRING: string = `Provider=Microsoft.Jet.OLEDB.4.0;Data Source=${MDB_FILE_PATH};`

const MARIADB_CONFIG: mariadb.PoolConfig = {
    host: "localhost",
    user: "pr-user",
    password: "pr-user",
    database: "payroll",
    port: 3306,
    connectionLimit: 5,
}

/**
 * Main function to execute the data transfer logic.
 */
async function main() {
    let adodbConnection: ADODB.Connection | null = null
    let mariadbPool: mariadb.Pool | null = null
    let mariadbConn: mariadb.PoolConnection | null = null

    console.log("Starting KEEHIN ATT2000 Data Transfer...")

    try {
        // 1. Establish Database Connections
        // The Java program had a file copy function, but Node.js usually handles this
        // outside the core application logic (e.g., using a shell script or a separate fs operation).
        // I will focus on the data transfer.

        // Initialize ADODB connection (for MS Access)
        adodbConnection = ADODB.open(ADODB_CONNECTION_STRING)
        console.log(`Connected to MS Access MDB: ${MDB_FILE_PATH}`)

        // Initialize MariaDB Pool and get a connection
        mariadbPool = mariadb.createPool(MARIADB_CONFIG)
        mariadbConn = await mariadbPool.getConnection()
        console.log(`Connected to MariaDB: ${MARIADB_CONFIG.database}`)

        // 2. Determine the starting date for export
        const dateQuery: string =
            "select max(dateTxt) as maxDate from timecard where dateTxt <= curdate()"
        const result = await mariadbConn.query(dateQuery)

        let exportDate: dayjs.Dayjs
        const maxDateStr = result[0]?.maxDate

        if (maxDateStr) {
            // Use the max date from the timecard table
            exportDate = dayjs(maxDateStr)
        } else {
            // Fallback: one year ago, similar to the Java logic
            exportDate = dayjs().subtract(12, "month")
        }

        const exportDateStr = exportDate.format("YYYY-MM-DD")
        console.log(`Exporting records with CHECKTIME >= ${exportDateStr}`)

        // 3. Query data from MS Access
        // The Java query: select userinfo.BadgeNumber, CHECKINOUT.CHECKTIME from userinfo, checkinout where checktime>=? and userinfo.att=1 and userinfo.userid=checkinout.userid
        // ADODB uses a slightly different parameter syntax (positional '?' or named '@p1', '@p2').
        // We'll use the date string directly in the query for simplicity with ADODB.
        const accessQuery: string = `
            SELECT
                userinfo.BadgeNumber,
                CHECKINOUT.CHECKTIME
            FROM
                userinfo, CHECKINOUT
            WHERE
                CHECKINOUT.CHECKTIME >= #${exportDateStr}# AND
                userinfo.att = 1 AND
                userinfo.userid = CHECKINOUT.userid
        `
        // Note: MS Access date literal syntax uses '#'

        const checkInOutRecords = await adodbConnection.query(accessQuery)
        console.log(`Fetched ${checkInOutRecords.length} records from MS Access.`)

        // 4. Begin Transaction and Insert into MariaDB
        await mariadbConn.beginTransaction()

        let insertCount: number = 0
        let batch: [string, string, string][] = []
        const BATCH_SIZE = 1000 // Efficient batch insertion

        for (const record of checkInOutRecords) {
            const badgeNumber: string = record.BadgeNumber
            const checkTime: string = record.CHECKTIME.toString() // Format: YYYY-MM-DD HH:mm:ss

            // Parsing and formatting as per Java logic:
            // dateTxt = x.substring(0, 10) -> YYYY-MM-DD
            // TimeTxt = x.substring(11, 19) -> HH:mm:ss
            const dateTxt: string = checkTime.substring(0, 10)
            const timeTxt: string = checkTime.substring(11, 19)

            batch.push([badgeNumber, dateTxt, timeTxt])

            if (batch.length >= BATCH_SIZE) {
                try {
                    const params = batch.flat((item) => item) // Flatten the array for batch insertion
                    const placeholders = batch.map(() => "(?, ?, ?)").join(", ")
                    const batchInsertSQL = `
                        INSERT INTO timecard (BadgeNumber, dateTxt, TimeTxt)
                        VALUES ${placeholders} 
                        ON DUPLICATE KEY UPDATE BadgeNumber = VALUES(BadgeNumber)`

                    await mariadbConn.query(batchInsertSQL, params)
                    insertCount += batch.length
                } catch (e) {
                    console.error("Batch insert failed (some records might be duplicates):", e)
                    // Continue, similar to the Java try-catch around executeUpdate
                }
                batch = [] // Clear batch
            }
        }

        // Insert remaining batch
        if (batch.length > 0) {
            try {
                const params = batch.flat((item) => item)
                const placeholders = batch.map(() => "(?, ?, ?)").join(", ")
                const batchInsertSQL = `
                    INSERT INTO timecard (BadgeNumber, dateTxt, TimeTxt)
                    VALUES ${placeholders}
                    ON DUPLICATE KEY UPDATE BadgeNumber = VALUES(BadgeNumber)`
                await mariadbConn.query(batchInsertSQL, params)
                insertCount += batch.length
            } catch (e) {
                console.error("Final batch insert failed (some records might be duplicates):", e)
            }
        }

        // 5. Commit Transaction
        await mariadbConn.commit()
        console.log()
        console.log(`✅ Time Export **${insertCount}** records successfully.`)
    } catch (e) {
        // Rollback on error
        if (mariadbConn) {
            try {
                await mariadbConn.rollback()
                console.log("Transaction rolled back due to error.")
            } catch (rbError) {
                console.error("Rollback failed:", rbError)
            }
        }
        console.error("An error occurred during data transfer:", (e as Error).message)
    } finally {
        // 6. Close Connections
        if (mariadbConn) mariadbConn.release()
        if (mariadbPool) await mariadbPool.end()

        // ADODB doesn't usually require explicit close like JDBC but is managed by the OS connection pool.
        console.log("Database connections closed.")
    }
}

await main()
