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
        { date: "2020-01-01", name: "Normal 1", times: ["08:00", "12:00", "13:00", "17:00"], expected: { morning: "08:00", lunch_out: "12:00", lunch_in: "13:00", evening: "17:00", status: "Full Day", workMin: 480, lunchMin: 60, otMin: 0, lateMin1: 0, lateMin2: 0 } },
        { date: "2020-01-02", name: "Normal 2", times: ["07:50", "12:04", "12:45", "17:30"], expected: { morning: "07:50", lunch_out: "12:04", lunch_in: "12:45", evening: "17:30", status: "Full Day", workMin: 480, lunchMin: 41, otMin: 0, lateMin1: 0, lateMin2: 0 } },
        { date: "2020-01-03", name: "OT Night 1", times: ["08:00", "12:30", "12:50", "17:30", "21:00"], expected: { morning: "08:00", lunch_out: "12:30", lunch_in: "12:50", evening: "17:30", night: "21:00", status: "Full Day", workMin: 480, lunchMin: 20, otMin: 180, lateMin1: 0, lateMin2: 0 } },
        { date: "2020-01-04", name: "OT Night 2", times: ["08:00", "12:00", "12:55", "21:00"], expected: { morning: "08:00", lunch_out: "12:00", lunch_in: "12:55", evening: null, night: "21:00", status: "Full Day", workMin: 480, lunchMin: 55, otMin: 180, lateMin1: 0, lateMin2: 0 } },
        { date: "2020-01-05", name: "OT Night 3", times: ["12:00", "12:55", "21:00"], expected: { morning: null, lunch_out: "12:00", lunch_in: "12:55", evening: null, night: "21:00", status: "Half Day", workMin: 240, lunchMin: 55, otMin: 180, lateMin1: 0, lateMin2: 0 } },
        { date: "2020-01-06", name: "OT Early", times: ["08:00", "12:05", "12:57", "02:00"], expected: { morning: "08:00", lunch_out: "12:05", lunch_in: "12:57", evening: null, early: "02:00", status: "Full Day", workMin: 480, lunchMin: 52, otMin: 480, lateMin1: 0, lateMin2: 0 } },
        { date: "2020-01-07", name: "Missing Lunch 1", times: ["08:00", "17:00"], expected: { morning: "08:00", lunch_out: null, lunch_in: null, evening: "17:00", status: "Full Day", workMin: 240, lunchMin: 300, otMin: 0, lateMin1: 0, lateMin2: 240 } },
        { date: "2020-01-08", name: "Missing Lunch 2", times: ["08:00", "12:00", "17:00"], expected: { morning: "08:00", lunch_out: "12:00", lunch_in: null, evening: "17:00", status: "Full Day", workMin: 360, lunchMin: 180, otMin: 0, lateMin1: 0, lateMin2: 120 } },
        { date: "2020-01-09", name: "Missing Lunch 3", times: ["08:00", "15:00", "17:00"], expected: { morning: "08:00", lunch_out: null, lunch_in: "15:00", evening: "17:00", status: "Full Day", workMin: 360, lunchMin: 180, otMin: 0, lateMin1: 0, lateMin2: 120 } },
        { date: "2020-01-10", name: "morning+OT", times: ["08:00", "12:01", "12:50", "20:31"], expected: { morning: "08:00", lunch_out: "12:01", lunch_in: "12:50", evening: null, night: "20:31", status: "Full Day", workMin: 360, lunchMin: 49, otMin: 151, lateMin1: 0 } },
        { date: "2020-01-11", name: "morning+MLunch+OT 1", times: ["08:00", "20:01"], expected: { morning: "08:00", lunch_out: null, lunch_in: null, evening: null, night: "20:01", status: "Full Day", workMin: 240, lunchMin: 300, otMin: 121, lateMin1: 0, lateMin2: 240 } },
        { date: "2020-01-12", name: "morning+MLunch+OT 2", times: ["08:00", "12:00", "20:00"], expected: { morning: "08:00", lunch_out: "12:00", lunch_in: null, evening: null, night: "20:00", status: "Full Day", workMin: 360, lunchMin: 180, otMin: 0, lateMin1: 0, lateMin2: 120 } },
        { date: "2020-01-13", name: "morning+MLunch+OT 3", times: ["08:00", "14:00", "20:00"], expected: { morning: "08:00", lunch_out: null, lunch_in: "14:00", evening: null, night: "20:00", status: "Full Day", workMin: 360, lunchMin: 180, otMin: 0, lateMin1: 0, lateMin2: 120 } },
        { date: "2020-01-14", name: "morning+MLunch+early", times: ["08:00", "02:00"], expected: { morning: "08:00", early: "02:00", status: "Full Day", workMin: 240, lunchMin: 300, otMin: 480, lateMin1: 0, lateMin2: 240 } },
        { date: "2020-01-15", name: "Half Day Morning 1", times: ["08:00", "12:05"], expected: { morning: "08:00", lunch_out: "12:05", status: "Half Day", workMin: 240, lunchMin: 0, lateMin1: 0, lateMin2: 0 } },
        { date: "2020-01-16", name: "Half Day Morning 2", times: ["08:00", "12:00", "12:30"], expected: { morning: "08:00", lunch_out: "12:00", lunch_in: "12:30", status: "Half Day", workMin: 240, lateMin1: 0, lateMin2: 0 } },
        { date: "2020-01-17", name: "Half Day Afternoon 1", times: ["13:00", "17:00"], expected: { lunch_in: "13:00", evening: "17:00", status: "Half Day", workMin: 240, lateMin1: 0, lateMin2: 0 } },
        { date: "2020-01-18", name: "Half Day Afternoon 2", times: ["12:00", "13:00", "17:00"], expected: { lunch_out: "12:00", lunch_in: "13:00", evening: "17:00", status: "Half Day", workMin: 240, lateMin1: 0, lateMin2: 0 } },
        { date: "2020-01-19", name: "Late Morning", times: ["08:20", "12:00", "13:00", "17:00"], expected: { morning: "08:20", lunch_out: "12:00", lunch_in: "13:00", evening: "17:00", status: "Full Day", workMin: 460, lunchMin: 60, lateMin1: 20, lateMin2: 0 } },
        { date: "2020-01-20", name: "Late Lunch", times: ["08:00", "12:00", "13:15", "17:00"], expected: { morning: "08:00", lunch_out: "12:00", lunch_in: "13:15", evening: "17:00", status: "Full Day", workMin: 465, lunchMin: 75, lateMin1: 0, lateMin2: 15 } },
        { date: "2020-01-21", name: "Spam Morning", times: ["07:50", "08:00", "08:05", "17:05"], expected: { morning: "08:05", evening: "17:05", status: "Full Day", workMin: 475, lateMin1: 5 } },
        { date: "2020-01-22", name: "Spam Lunch Out", times: ["07:00", "11:55", "12:05", "12:10", "17:09"], expected: { morning: "07:00", lunch_out: "11:55", lunch_in: "12:10", evening: "17:09", status: "Full Day", workMin: 480, lunchMin: 60 } },
        { date: "2020-01-23", name: "Absent 1", times: ["08:00"], expected: { status: "Absent" } },
        { date: "2020-01-24", name: "Absent 2", times: ["17:30"], expected: { status: "Absent" } },
        { date: "2020-01-25", name: "Absent 3", times: ["17:30", "20:00"], expected: { status: "Absent" } },
        { date: "2020-01-26", name: "Absent 4", times: [], expected: { status: "Absent" } },
        { date: "2020-01-27", name: "Absent 5", times: ["20:00"], expected: { status: "Absent" } },
        { date: "2020-01-28", name: "Absent 6", times: ["12:00", "13:00"], expected: { status: "Absent" } },
        { date: "2020-01-29", name: "Absent 7", times: ["11:15"], expected: { status: "Absent" } },
    ]

    // Get min and max dates from scenarios
    const dates = scenarios.map(s => s.date)
    const minDate = dates.reduce((min, date) => date < min ? date : min)
    const maxDate = dates.reduce((max, date) => date > max ? date : max)

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
            "DELETE FROM attendance WHERE comCode=? AND empCode=? AND dateTxt BETWEEN ? AND ?",
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