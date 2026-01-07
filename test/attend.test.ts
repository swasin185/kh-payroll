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
        { date: "2020-01-01", name: "Normal", times: ["08:00", "12:00", "13:00", "17:00"], expected: { inTime1: "08:00", outTime2: "17:00" } },
        { date: "2020-01-02", name: "Late1", times: ["08:10", "12:03", "13:05", "17:02"], expected: { inTime1: "08:10", outTime2: "17:02" } },
        { date: "2020-01-03", name: "Late2", times: ["07:59", "12:02", "13:15", "17:05"], expected: { inTime1: "07:59", outTime2: "17:05" } },
        { date: "2020-01-04", name: "Early", times: ["08:00", "11:55", "12:50", "16:55"], expected: { inTime1: "08:00", outTime2: "16:55" } },
        { date: "2020-01-05", name: "OT", times: ["08:00", "17:00", "18:00", "20:30"], expected: { outTime2: "17:00", outTime3: "20:30" } },
        { date: "2020-01-10", name: "Missing Lunch", times: ["07:50", "17:01"], expected: { inTime1: "07:50", outTime2: "17:01" } },
        { date: "2020-01-11", name: "Spam Times 1", times: ["07:59", "08:05", "08:08", "17:00"], expected: { inTime1: "07:59", outTime2: "17:00" } },
        { date: "2020-01-12", name: "Spam Times 2", times: ["07:55", "07:59", "16:58", "17:00"], expected: { inTime1: "07:55", outTime2: "16:58" } },
        { date: "2020-01-13", name: "Incomplete", times: ["07:59", "08:00", "12:08", "13:01"], expected: { inTime1: "07:59", outTime1: "12:08", inTime2: "13:01", outTime2: null } },
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

            // Insert Timecards
            for (const t of s.times) {
                await SqlTimeCard.insert({ dateTxt: s.date, scanCode: scanCode, timeTxt: t })
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
        // if (scanCode) await tearDownData(scanCode)
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