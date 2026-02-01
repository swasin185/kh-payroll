import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { getDB } from "../server/database/pool"
import SqlAttendance from "../server/database/SqlAttendance"
import SqlTimeCard from "../server/database/SqlTimeCard"

describe("Payroll MariaDB", () => {
    const db = getDB()
    console.log("Database connected")

    const testComCode = "01"
    const testEmpCode = 2
    const scenarios = [
        { date: "2020-01-01", name: "Normal", times: ["08:00", "12:00", "13:00", "17:00"], expected: { morning: "08:00", lunch_out: "12:00", lunch_in: "13:00", evening: "17:00", status: "Full Day", lunchMin: 60, workMin: 480 } },
        { date: "2020-01-02", name: "Normal B", times: ["07:50", "12:04", "12:45", "17:30"], expected: { morning: "07:50", lunch_out: "12:04", lunch_in: "12:45", evening: "17:30", status: "Full Day", lunchMin: 60, workMin: 480 } },
        { date: "2020-01-03", name: "OT Night", times: ["08:00", "12:00", "13:00", "21:00"], expected: { morning: "08:00", night: "21:00", status: "Full Day", lunchMin: 60, otMin: 180 } },
        { date: "2020-01-05", name: "OT Early", times: ["08:00", "12:00", "13:00", "02:00"], expected: { morning: "08:00", early: "02:00", status: "Full Day", lunchMin: 60, otMin: 480 } },
        { date: "2020-01-08", name: "Half Day Morning", times: ["08:00", "12:00"], expected: { morning: "08:00", lunch_out: "12:00", status: "Half Day" } },
        { date: "2020-01-10", name: "Half Day Afternoon", times: ["13:00", "17:00"], expected: { lunch_in: "13:00", evening: "17:00", status: "Half Day" } },
        { date: "2020-01-12", name: "Missing Lunch 1", times: ["08:00", "17:00"], expected: { morning: "08:00", lunch_out: null, lunch_in: null, evening: "17:00", status: "Full Day", lunchMin: 300, workMin: 240 } },
        { date: "2020-01-13", name: "Missing Lunch 2", times: ["08:00", "12:00", "17:00"], expected: { morning: "08:00", lunch_out : "12:00", lunch_in : "12:00", evening: "17:00", status: "Full Day", lunchMin: 180, workMin: 360 } },
        { date: "2020-01-14", name: "Late Morning", times: ["08:20", "12:00", "13:00", "17:00"], expected: { lateMin1: 20 } },
        { date: "2020-01-16", name: "Late Lunch", times: ["08:00", "12:00", "13:15", "17:00"], expected: { lateMin2: 15 } },
        { date: "2020-01-18", name: "Spam Morning", times: ["07:50", "08:00", "08:05"], expected: { morning: "08:05" } },
        { date: "2020-01-20", name: "Spam Lunch Out", times: ["11:55", "12:05", "12:10"], expected: { lunch_out: "11:55" } },
        { date: "2020-01-22", name: "Absent", times: ["11:15"], expected: { status: "Absent" } },
    ]

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
            await SqlAttendance.delete(testComCode, String(testEmpCode), s.date)
            await SqlTimeCard.delete(s.date, scanCode)
            // Also cleanup the next day for potential cross-day scans
            const d = new Date(s.date)
            d.setDate(d.getDate() + 1)
            const nextDay = d.toISOString().split("T")[0]
            await SqlTimeCard.delete(nextDay, scanCode)

            // Insert Timecards
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
        for (const s of scenarios) {
            // Optional: Keep the data for debugging or clean it up? 
            // Usually good practice to clean up unless requested otherwise.
            // I'll leave cleanup enabled.
            await SqlAttendance.delete(testComCode, String(testEmpCode), s.date)
            await SqlTimeCard.delete(s.date, scanCode)
        }
    }

    let scanCode: string

    beforeAll(async () => {
        scanCode = await getScanCode()
        await tearDownData(scanCode) // Ensure clean slate
        await setupData(scanCode)

        // Get min and max dates from scenarios
        const dates = scenarios.map(s => s.date)
        const minDate = dates.reduce((min, date) => date < min ? date : min)
        const maxDate = dates.reduce((max, date) => date > max ? date : max)

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
            const rows = await SqlAttendance.select(testComCode, String(testEmpCode), s.date, s.date)
            expect(rows).not.toBeNull()
            expect(rows!.length).toBeGreaterThan(0)
            const row = rows![0]
            for (const [key, val] of Object.entries(s.expected)) {
                expect(row[key as keyof typeof row]).toBe(val)
            }
        })
    }
})