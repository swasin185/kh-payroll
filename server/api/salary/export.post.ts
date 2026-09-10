import { getDB } from "~~/server/database/pool"
import { RowDataPacket } from "mysql2/promise"

const BANK_CODES: Record<string, string> = {
    kh: "1021352 1021044772 ",
    ktd: "1021344 1021057610 ",
    kct: "1021328 1021071915 ",
    kws: "1021336 1021071931 ",
}

export default authEventHandler(async (event): Promise<any> => {
    const session = await getUserSession(event)
    const user = session.user as any
    const body = await readBody(event)

    const comCode = body.comCode || user?.comCode
    const comName = body.comName || user?.comName || ""
    const yr = Number(body.yr || user?.yrPayroll)
    const mo = Number(body.mo || user?.mnPayroll)
    const dt = Number(body.dt || new Date().getDate())

    if (!comCode || !yr || !mo) {
        throw createError({ statusCode: 400, statusMessage: "Missing comCode, yr, or mo" })
    }

    // Query payroll data (same joins as A04: employee + payroll + incometype)
    const db = getDB()
    const [rows] = await db.query<RowDataPacket[]>(`
        SELECT
            e.empCode,
            e.name,
            e.surName,
            e.bankAccount,
            p.inCode,
            i.inName,
            i.inType,
            p.value
        FROM employee e
        INNER JOIN payroll p ON e.comCode = p.comCode AND e.empCode = p.empCode
                             AND p.yr = ? AND p.mo = ?
        INNER JOIN incometype i ON p.inCode = i.inCode
        WHERE e.comCode = ?
          AND LENGTH(e.bankAccount) = 13
        ORDER BY e.empCode, p.inCode`,
        [yr, mo, comCode],
    )

    // Aggregate per employee (sum all income/deduction lines)
    const empMap = new Map<string, { empName: string; bankAccount: string; salary: number }>()
    for (const row of rows) {
        const key = row.empCode as string
        if (!empMap.has(key)) {
            const name = `${row.name || ""} ${row.surName || ""}`.trim()
            empMap.set(key, { empName: name, bankAccount: row.bankAccount, salary: 0 })
        }
        empMap.get(key)!.salary += Number(row.value || 0)
    }
    const employees = [...empMap.values()]

    // Generate HPCT bank-transfer text
    const text = generateBankText(yr, mo, dt, comCode, comName, employees)
    const fileName = `${yr}-${String(mo).padStart(2, "0")}-${comCode}.txt`

    setHeader(event, "Content-Type", "text/plain; charset=utf-8")
    setHeader(event, "Content-Disposition", `attachment; filename="${fileName}"`)
    setHeader(event, "Content-Length", Buffer.byteLength(text, "utf-8"))
    return text
})

// --- HPCT fixed-width format generator ---

interface BankEmployee {
    empName: string
    bankAccount: string
    salary: number
}

function generateBankText(
    yr: number,
    mn: number,
    dt: number,
    comCode: string,
    companyName: string,
    employees: BankEmployee[],
): string {
    const now = new Date()
    const dd = now.getDate()
    const mm = now.getMonth() + 1
    const yr2 = yr - 2000

    const accounts: string[] = []
    const names: string[] = []
    const salaries: number[] = []
    let total = 0

    for (const emp of employees) {
        total += emp.salary
        names.push(emp.empName)
        salaries.push(emp.salary)
        accounts.push(emp.bankAccount.replace(/-/g, ""))
    }

    const lines: string[] = []

    // --- Header line ---
    let header = "HPCT"
    header += " ".repeat(16)
    header += "000000"
    header += " ".repeat(6)
    header += BANK_CODES[comCode] ?? " ".repeat(19)
    const totalCents = Math.round(total * 100)
    header += String(totalCents).padStart(15, "0")
    header += ` ${yr2}${String(mm).padStart(2, "0")}${String(dd).padStart(2, "0")}`
    header += " ".repeat(25)
    header += companyName.padEnd(50).slice(0, 50)
    header += `${yr2}${String(mm).padStart(2, "0")}${String(dt).padStart(2, "0")}`
    header += String(names.length).padStart(18, "0")
    header += "Y"
    header += " ".repeat(5)
    lines.push(header)

    // --- Detail lines ---
    for (let i = 0; i < names.length; i++) {
        let detail = `D${String(i + 1).padStart(6, "0")} `
        detail += " ".repeat(13)
        detail += accounts[i]!.padStart(10) + " "
        const salCents = Math.round(salaries[i]! * 100)
        detail += String(salCents).padStart(15, "0") + " "
        detail += `${yr2}${String(mm).padStart(2, "0")}${String(dd).padStart(2, "0")}`
        detail += " ".repeat(25)
        detail += names[i]!.padEnd(50).slice(0, 50)
        detail += `${yr2}${String(mm).padStart(2, "0")}${String(dt).padStart(2, "0")}`
        detail += " ".repeat(6)
        detail += " ".repeat(345)
        lines.push(detail)
    }

    return lines.join("\n") + "\n"
}
