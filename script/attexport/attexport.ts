import MDBReader from "mdb-reader"
import * as mariadb from "mariadb"
import fs from "fs"

const MDB_FILE_PATH: string = process.argv[2] || "/home/tom/ATT2000.MDB"

const MARIADB_CONFIG: mariadb.PoolConfig = {
    host: "localhost",
    user: "pr-user",
    password: "pr-user",
    database: "payroll",
    port: 3306,
    connectionLimit: 5,
}

function formatDate(date: Date): string {
    return date.toISOString().substring(0, 10) // YYYY-MM-DD
}

function subtractMonths(date: Date, months: number): Date {
    const d = new Date(date)
    d.setMonth(d.getMonth() - months)
    return d
}

// Helper to check if a value is a valid Date object
function isValidDate(d: any): d is Date {
    return d instanceof Date && !isNaN(d.getTime());
}

async function main() {
    let mariadbPool: mariadb.Pool | null = null
    let mariadbConn: mariadb.PoolConnection | null = null

    console.log("Starting KEEHIN ATT2000 Data Transfer...")

    try {
        const buffer = fs.readFileSync(MDB_FILE_PATH)

        const reader = new MDBReader(buffer)
        console.log(`Connected to MS Access MDB: ${MDB_FILE_PATH}`)
        
        // --- 1. Determine Export Date from MariaDB ---
        mariadbPool = mariadb.createPool(MARIADB_CONFIG)
        mariadbConn = await mariadbPool.getConnection()
        console.log(`Connected to MariaDB: ${MARIADB_CONFIG.database}`)

        const dateQuery: string =
            "SELECT MAX(dateTxt) AS maxDate FROM timecard WHERE dateTxt <= CURDATE()"
        const result = await mariadbConn.query(dateQuery)

        let exportDate: Date
        const maxDateStr = result[0]?.maxDate

        if (maxDateStr) {
            // Start export from the day AFTER the max date found in the database
            exportDate = new Date(maxDateStr)
            exportDate.setDate(exportDate.getDate() + 1)
        } else {
            // Fallback: start export 12 months ago
            exportDate = subtractMonths(new Date(), 12)
        }

        const exportDateStr = formatDate(exportDate)
        console.log(`Exporting records with CHECKTIME >= ${exportDateStr}`)

        // --- 2. Extract and Filter MDB Data in-memory (The Fix) ---
        
        // Read the two required tables fully into memory
        const userinfoRecords = reader.getTable("userinfo").getData()
        const checkInOutRecords = reader.getTable("CHECKINOUT").getData()
        console.log(`MDB Data Loaded. userinfo: ${userinfoRecords.length}, CHECKINOUT: ${checkInOutRecords.length}`)

        // Create a map for quick lookup (JOIN equivalent for 'userinfo')
        // Key: UserID (from CHECKINOUT) -> Value: BadgeNumber
        const userMap = userinfoRecords
            .filter((user: any) => user.att === 1) // Apply: userinfo.att = 1
            .reduce((map: Map<number, string>, user: any) => {
                // Ensure the keys match the case used by the MDB file parser
                map.set(user.USERID, user.Badgenumber); 
                return map;
            }, new Map<number, string>());
            
        // Filter the CHECKINOUT records (WHERE CHECKINOUT.CHECKTIME >= #exportDateStr#)
        const filteredRecords = checkInOutRecords
            .filter((record: any) => {
                const checkTime: Date = record.CHECKTIME; // CHECKTIME should be a Date object from mdb-reader
                return isValidDate(checkTime) && checkTime >= exportDate;
            })
            // Merge/Join the badge number and format the output for MariaDB
            .map((record: any) => {
                const checkTime: Date = record.CHECKTIME;
                const userId: number = record.USERID;
                const badgeNumber: string | undefined = userMap.get(userId);

                if (badgeNumber && isValidDate(checkTime)) {
                    const checkTimeStr = checkTime.toISOString().substring(0, 19).replace('T', ' ');
                    const dateTxt = checkTimeStr.substring(0, 10);
                    const timeTxt = checkTimeStr.substring(11, 19);
                    
                    // Return the tuple ready for insertion
                    return [badgeNumber, dateTxt, timeTxt] as [string, string, string];
                }
                return null;
            })
            .filter((record): record is [string, string, string] => record !== null);

        // --- 3. MariaDB Batch Insertion ---
        console.log(`Found **${filteredRecords.length}** relevant records to transfer.`)

        await mariadbConn.beginTransaction()

        let insertCount = 0
        let batch: [string, string, string][] = []
        const BATCH_SIZE = 100

        for (const record of filteredRecords) {
            batch.push(record)

            if (batch.length >= BATCH_SIZE) {
                await insertBatch(mariadbConn, batch)
                insertCount += batch.length
                batch = []
            }
        }

        if (batch.length > 0) {
            await insertBatch(mariadbConn, batch)
            insertCount += batch.length
        }

        await mariadbConn.commit()
        console.log(`✅ Time Export **${insertCount}** records successfully.`)
    } catch (e) {
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
        if (mariadbConn) mariadbConn.release()
        if (mariadbPool) await mariadbPool.end()

        console.log("Database connections closed.")
    }
}

// insertBatch function remains the same as it was correct for MariaDB
async function insertBatch(conn: mariadb.PoolConnection, batch: [string, string, string][]) {
    try {
        const params = batch.flat()
        const placeholders = new Array(batch.length).fill("(?, ?, ?)").join(", ")
        const sql = `
      INSERT INTO timecard (BadgeNumber, dateTxt, TimeTxt)
      VALUES ${placeholders}
      ON DUPLICATE KEY UPDATE BadgeNumber = VALUES(BadgeNumber)
    `
        await conn.query(sql, params)
    } catch (e) {
        // Log the error but allow the transaction to proceed/rollback normally
        console.error("Batch insert failed (MariaDB error):", (e as Error).message)
        // Re-throw to trigger the main catch block and rollback
        throw e; 
    }
}

main()