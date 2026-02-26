import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { getDB } from "../server/database/pool"
import SqlTimeCard from "../server/database/SqlTimeCard"

describe("Payroll MariaDB", () => {
    const db = getDB()
    console.log("Database connected")

    const testComCode = "01"
    const testEmpCode = 2
    const scenarios = [
        {
            date: "2020-01-01", name: "Normal 1", times: ["07:52", "12:12", "13:12", "17:05"],
            expected: { morning: "07:52", lunch_out: "12:12", lunch_in: "13:12", evening: "17:05", status: "FullDay", workMin: 480, lunchMin: 60, otMin: 0, lateMin1: 0, lateMin2: 0 }
        },
        {
            date: "2020-01-02", name: "Normal 2", times: ["07:50", "12:14", "12:45", "17:30"],
            expected: { morning: "07:50", lunch_out: "12:14", lunch_in: "12:45", evening: "17:30", status: "FullDay", workMin: 480, lunchMin: 31, otMin: 0, lateMin1: 0, lateMin2: 0 }
        },
        {
            date: "2020-01-03", name: "Normal 3", times: ["07:50", "12:11", "12:51", "16:30"],
            expected: { morning: "07:50", lunch_out: "12:11", lunch_in: "12:51", evening: "16:30", status: "FullDay", workMin: 450, lunchMin: 40, otMin: 0, lateMin1: 0, lateMin2: 30 }
        },
        {
            date: "2020-01-04", name: "OT Night 1", times: ["06:54", "12:32", "12:54", "17:31", "21:12"],
            expected: { morning: "06:54", lunch_out: "12:32", lunch_in: "12:54", evening: "17:31", night: "21:12", status: "FullDay", workMin: 480, lunchMin: 22, otMin: 192, lateMin1: 0, lateMin2: 0 }
        },
        {
            date: "2020-01-05", name: "OT Night 2", times: ["07:32", "12:10", "12:55", "21:10"],
            expected: { morning: "07:32", lunch_out: "12:10", lunch_in: "12:55", evening: null, night: "21:10", status: "FullDay", workMin: 480, lunchMin: 45, otMin: 190, lateMin1: 0, lateMin2: 0 }
        },
        {
            date: "2020-01-06", name: "OT Night 3", times: ["12:12", "12:55", "21:30"],
            expected: { morning: null, lunch_out: "12:12", lunch_in: "12:55", evening: null, night: "21:30", status: "HalfDay", workMin: 240, lunchMin: 43, otMin: 0, lateMin1: 0, lateMin2: 0 }
        },
        {
            date: "2020-01-07", name: "OT Early", times: ["07:35", "12:05", "12:57", "02:02"],
            expected: { morning: "07:35", lunch_out: "12:05", lunch_in: "12:57", evening: null, early: "02:02", status: "FullDay", workMin: 480, lunchMin: 52, otMin: 482, lateMin1: 0, lateMin2: 0 }
        },
        {
            date: "2020-01-08", name: "Missing Lunch 1", times: ["07:38", "17:03"],
            expected: { morning: "07:38", lunch_out: null, lunch_in: null, evening: "17:03", status: "FullDay", workMin: 240, lunchMin: 0, otMin: 0, lateMin1: 0, lateMin2: 240 }
        },
        {
            date: "2020-01-09", name: "Missing Lunch 2", times: ["07:50", "12:34", "17:05"],
            expected: { morning: "07:50", lunch_out: "12:34", lunch_in: "12:34", evening: "17:05", status: "FullDay", workMin: 360, lunchMin: 0, otMin: 0, lateMin1: 0, lateMin2: 120 }
        },
        {
            date: "2020-01-10", name: "Missing Lunch 3", times: ["07:12", "14:39", "17:32"],
            expected: { morning: "07:12", lunch_out: null, lunch_in: "14:39", evening: "17:32", status: "FullDay", workMin: 360, lunchMin: 0, otMin: 0, lateMin1: 0, lateMin2: 120 }
        },
        {
            date: "2020-01-11", name: "morning+OT", times: ["07:44", "12:01", "12:49", "20:31"],
            expected: { morning: "07:44", lunch_out: "12:01", lunch_in: "12:49", evening: null, night: "20:31", status: "FullDay", workMin: 480, lunchMin: 48, otMin: 151, lateMin1: 0, lateMin2: 0 }
        },
        {
            date: "2020-01-12", name: "morning+MLunch+OT 1", times: ["07:39", "20:11"],
            expected: { morning: "07:39", lunch_out: null, lunch_in: null, evening: null, night: "20:11", status: "FullDay", workMin: 240, lunchMin: 0, otMin: 131, lateMin1: 0, lateMin2: 240 }
        },
        {
            date: "2020-01-13", name: "morning+MLunch+OT 2", times: ["07:23", "12:22", "20:58"],
            expected: { morning: "07:23", lunch_out: "12:22", lunch_in: "12:22", evening: null, night: "20:58", status: "FullDay", workMin: 360, lunchMin: 0, otMin: 178, lateMin1: 0, lateMin2: 120 }
        },
        {
            date: "2020-01-14", name: "morning+MLunch+OT 3", times: ["07:23", "14:02", "20:05"],
            expected: { morning: "07:23", lunch_out: null, lunch_in: "14:02", evening: null, night: "20:05", status: "FullDay", workMin: 360, lunchMin: 0, otMin: 125, lateMin1: 0, lateMin2: 120 }
        },
        {
            date: "2020-01-15", name: "morning+MLunch+early", times: ["07:21", "02:08"],
            expected: { morning: "07:21", lunch_out: null, lunch_in: null, evening: null, early: "02:08", status: "FullDay", workMin: 240, lunchMin: 0, otMin: 488, lateMin1: 0, lateMin2: 240 }
        },
        {
            date: "2020-01-16", name: "HalfDay Morning 1", times: ["07:41", "11:45"],
            expected: { morning: "07:41", lunch_out: "11:45", status: "HalfDay", workMin: 225, lateMin1: 0, lateMin2: 15 }
        },
        {
            date: "2020-01-17", name: "HalfDay Morning 2", times: ["07:41", "12:23", "12:51"],
            expected: { morning: "07:41", lunch_out: "12:23", lunch_in: "12:51", status: "HalfDay", workMin: 240, lateMin1: 0, lateMin2: 0, lunchMin: 28 }
        },
        {
            date: "2020-01-18", name: "HalfDay Afternoon 1", times: ["13:10", "17:05"],
            expected: { morning: null, lunch_out: "13:10", lunch_in: "13:10", evening: "17:05", status: "HalfDay", workMin: 230, lateMin1: 0, lateMin2: 10, lunchMin: 0 }
        },
        {
            date: "2020-01-19", name: "HalfDay Afternoon 2", times: ["12:20", "12:50", "16:50"],
            expected: { morning: null, lunch_out: "12:20", lunch_in: "12:50", evening: "16:50", status: "HalfDay", workMin: 230, lateMin1: 0, lateMin2: 10, lunchMin: 30 }
        },
        {
            date: "2020-01-20", name: "Late Morning", times: ["08:20", "12:10", "13:01", "16:55"],
            expected: { morning: "08:20", lunch_out: "12:10", lunch_in: "13:01", evening: "16:55", status: "FullDay", workMin: 455, lunchMin: 51, lateMin1: 20, lateMin2: 5 }
        },
        {
            date: "2020-01-21", name: "Late Morning Half", times: ["08:30", "11:50"],
            expected: { morning: "08:30", lunch_out: "11:50", status: "HalfDay", workMin: 200, lateMin1: 30, lateMin2: 10 }
        },
        {
            date: "2020-01-22", name: "Late Lunch", times: ["07:30", "12:01", "13:23", "17:03"],
            expected: { morning: "07:30", lunch_out: "12:01", lunch_in: "13:23", evening: "17:03", status: "FullDay", workMin: 458, lunchMin: 82, lateMin1: 0, lateMin2: 22 }
        },
        {
            date: "2020-01-23", name: "Spam Morning", times: ["07:50", "08:02", "08:05", "16:55"],
            expected: { morning: "08:05", evening: "16:55", status: "FullDay", workMin: 230, lunchMin: 0, lateMin1: 5, lateMin2: 245 }
        },
        {
            date: "2020-01-24", name: "Spam Lunch Out", times: ["07:30", "11:54", "12:05", "12:10", "17:09"],
            expected: { morning: "07:30", lunch_out: "11:54", lunch_in: "12:10", evening: "17:09", status: "FullDay", workMin: 480, lunchMin: 16, otMin: 0, lateMin1: 0, lateMin2: 0 }
        },
        {
            date: "2020-01-25", name: "Absent 1", times: ["07:31"],
            expected: { morning: "07:31", status: "Absent" }
        },
        {
            date: "2020-01-26", name: "Absent 2", times: ["17:30"],
            expected: { evening: "17:30", status: "Absent" }
        },
        {
            date: "2020-01-27", name: "Absent 3", times: ["17:30", "20:02"],
            expected: { evening: "17:30", night: "20:02", status: "Absent" }
        },
        {
            date: "2020-01-28", name: "Absent 4", times: ["20:02"],
            expected: { night: "20:02", status: "Absent" }
        },
        {
            date: "2020-01-29", name: "Absent 5", times: ["12:01", "13:01"],
            expected: { lunch_out: "12:01", lunch_in: "13:01", status: "Absent" }
        },
        {
            date: "2020-01-30", name: "Absent 6", times: ["11:15"],
            expected: { lunch_out: "11:15", status: "Absent" }
        }
    ]

    // Get min and max dates from scenarios
    let minDate = scenarios[0].date
    let maxDate = scenarios[0].date
    for (const s of scenarios) {
        if (s.date < minDate) minDate = s.date
        if (s.date > maxDate) maxDate = s.date
    }

    async function getScanCode(): Promise<string> {
        const [rows] = await db.query<any[]>("SELECT scanCode FROM employee WHERE comCode=? AND empCode=?", [testComCode, testEmpCode])
        if (rows.length === 0) throw new Error(`Employee ${testComCode}-${testEmpCode} not found`)
        let code = rows[0].scanCode
        if (!code) {
            // If null, update it to a temp code for testing
            code = "9999"
            await db.query("UPDATE employee SET scanCode=? WHERE comCode=? AND empCode=?", [code, testComCode, testEmpCode])
        }
        return code
    }

    async function setupData(scanCode: string) {
        // Cleanup specific dates only
        for (const s of scenarios) {
            const d = new Date(s.date)
            d.setDate(d.getDate() + 1)
            const nextDay = d.toISOString().split("T")[0]
            await SqlTimeCard.delete(nextDay, scanCode)
            for (const t of s.times) {
                let scanAt = `${s.date} ${t}`
                if (t < "06:00") {
                    scanAt = `${nextDay} ${t}`
                }
                await SqlTimeCard.insert({ scanCode: scanCode, scanAt: scanAt })
            }
        }
    }

    async function tearDownData(scanCode: string) {
        await db.execute(
            "DELETE FROM attendance WHERE comCode=? AND empCode=? AND dateAt BETWEEN ? AND ?",
            [testComCode, testEmpCode, minDate, maxDate]
        )
        await db.execute(
            "DELETE FROM timecard WHERE scanCode=? AND scanAt >= ? AND scanAt < DATE_ADD(?, INTERVAL 2 DAY)",
            [scanCode, minDate, maxDate]
        )
    }

    let scanCode: string

    beforeAll(async () => {
        scanCode = await getScanCode()
        await tearDownData(scanCode) // Ensure clean slate
        await setupData(scanCode)

        // Run processes for entire date range
        console.log(`Running processes for date range: ${minDate} to ${maxDate}`)
        await db.execute("call payroll.runTimeCard(?, ?)", [minDate, maxDate])
        await db.execute("call payroll.runAttendance(?, ?)", [minDate, maxDate])
    })

    afterAll(async () => {
        if (scanCode) await tearDownData(scanCode)
    })

    for (const s of scenarios) {
        it(`${s.date} ${s.name}`, async () => {
            const [rows] = await db.query<any[]>(`
                SELECT 
                    dateAt, morning, evening, night, early, lunch_out, lunch_in, scanCount, status,
                    lateMin1, lunchMin, lateMin2, workMin, otMin
                FROM attendance
                WHERE comCode = ? AND empCode = ? AND dateAt = ?
            `, [testComCode, testEmpCode, s.date])
            expect(rows).not.toBeNull()
            expect(rows!.length).toBeGreaterThan(0)
            const row = rows![0]
            for (let [key, val] of Object.entries(s.expected)) {
                let actual = row[key as keyof typeof row]
                if (typeof val === 'number') {
                    actual = actual === null ? 0 : Number(actual)
                }
                expect(actual).toBe(val)
            }
        })
    }
})