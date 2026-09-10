import { ServerReport } from "./ServerReport"
import { formatMoney } from "../../shared/utils"

export default class A04 extends ServerReport {
    override name = "สลิปจ่ายเงินเดือน"
    override description = "สลิปจ่ายเงินเดือน ประจำงวด สำหรับตัด แจกจ่ายพนักงาน"
    override query = `
      SELECT
        e.empCode,
        e.prefix,
        e.name,
        e.surName,
        e.department,
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
      ORDER BY e.department, e.empCode, p.inCode`

    public override getParams(): Record<string, string> {
        return { yr: "", mo: "", comCode: "" }
    }

    protected override define(): void {
        // Group by employee to print slips
        const grouped = Object.groupBy(this.data, (r: any) => r.empCode)
        const content: any[] = []

        content.push(
            {
                canvas: [{
                    type: "line",
                    x1: 0, y1: 0, x2: 535, y2: 0,
                    lineWidth: 0.5,
                    dash: { length: 4, space: 3 },
                    lineColor: "#888888",
                }],
                margin: [0, 0, 4, 8],
            }
        )

        // Maps to accumulate department summary totals
        const deptSummary = new Map<string, { totalIncome: number; totalDeduct: number; netPay: number; empCount: number }>()
        let grandTotalIncome = 0
        let grandTotalDeduct = 0
        let grandNetPay = 0
        let grandEmpCount = 0

        // Object.entries(grouped) order preserves the sorted order from the query because modern JS preserves string keys insertion/iteration order (especially when sorted by department and empCode first in query)
        // However, to ensure correct department grouping and sorting of the slips, let's process the groups in order of appearance in this.data:
        const processedEmps = new Set<string>()
        const orderedEmpCodes: string[] = []
        for (const row of this.data) {
            if (!processedEmps.has(row.empCode)) {
                processedEmps.add(row.empCode)
                orderedEmpCodes.push(row.empCode)
            }
        }

        orderedEmpCodes.forEach((empCode, idx) => {
            const records = grouped[empCode]
            if (!records || records.length === 0) return
            const emp = records[0]
            const fullName = `${emp.prefix || ""} ${emp.name} ${emp.surName || ""}`.trim()
            const department = emp.department || "No Department"

            const incomeItems = records.filter((r: any) => Number(r.inType) === 1)
            const deductItems = records.filter((r: any) => Number(r.inType) === -1)

            const totalIncome = incomeItems.reduce((sum: number, r: any) => sum + Number(r.value || 0), 0)
            const totalDeduct = deductItems.reduce((sum: number, r: any) => sum + Number(r.value || 0), 0)
            const netPay = totalIncome - totalDeduct

            // Accumulate department-level totals
            if (!deptSummary.has(department)) {
                deptSummary.set(department, { totalIncome: 0, totalDeduct: 0, netPay: 0, empCount: 0 })
            }
            const deptAccum = deptSummary.get(department)!
            deptAccum.totalIncome += totalIncome
            deptAccum.totalDeduct += totalDeduct
            deptAccum.netPay += netPay
            deptAccum.empCount += 1

            // Accumulate grand totals
            grandTotalIncome += totalIncome
            grandTotalDeduct += totalDeduct
            grandNetPay += netPay
            grandEmpCount += 1

            const slip: any[] = []

            slip.push({
                columns: [
                    { text: `ลำดับ: ${idx + 1}  พิมพ์: ${this.printedAt}`, fontSize: 8, color: "#888888", width: "auto" },
                ],
                margin: [0, 0, 0, 4],
            })

            slip.push({
                columns: [
                    { text: `${this.params.comName} แผนก: ${department}`, width: "*" },
                    { text: `ใบจ่ายเงินเดือน ${this.params.yr}/${this.params.mo}`, width: "*" },
                    { text: `รหัส: ${empCode}  ${fullName}`, width: "*" },
                    {
                        text: `เงินได้สุทธิ:  ${formatMoney(netPay)}`,
                        alignment: "right",
                        width: "auto",
                    },
                ],
                margin: [0, 0, 0, 4],
            })

            const incomeRows: any[][] = incomeItems.map((r: any) => [
                { text: `${r.inName || ""}` },
                { text: formatMoney(r.value), alignment: "right" },
            ])
            incomeRows.push([
                { text: "รวมรายได้", alignment: "right" },
                { text: formatMoney(totalIncome) },
            ])

            // --- Build deduction rows (right) ---
            const deductRows: any[][] = deductItems.map((r: any) => [
                { text: `${r.inName || ""}` },
                { text: formatMoney(r.value), alignment: "right" },
            ])
            deductRows.push([
                { text: "รวมรายหัก", alignment: "right" },
                { text: formatMoney(totalDeduct) },
            ])

            // --- Pad shorter column so both tables have equal rows ---
            const maxRows = Math.max(incomeRows.length, deductRows.length)
            while (incomeRows.length < maxRows) {
                incomeRows.splice(incomeRows.length - 1, 0, [{ text: "" }, { text: "" }])
            }
            while (deductRows.length < maxRows) {
                deductRows.splice(deductRows.length - 1, 0, [{ text: "" }, { text: "" }])
            }

            // --- Two-column layout: income left, deductions right ---
            slip.push({
                columns: [
                    {
                        width: "*",
                        table: {
                            headerRows: 1,
                            widths: ["*", "auto"],
                            body: [
                                [
                                    { text: "รายการเงินได้", style: "tableHeader" },
                                    { text: "จำนวน", style: "tableHeader", alignment: "right" },
                                ],
                                ...incomeRows,
                            ],
                        },
                    },
                    { width: 10, text: "" },
                    {
                        width: "*",
                        table: {
                            headerRows: 1,
                            widths: ["*", "auto"],
                            body: [
                                [
                                    { text: "รายการเงินหัก", style: "tableHeader" },
                                    { text: "จำนวน", style: "tableHeader", alignment: "right" },
                                ],
                                ...deductRows,
                            ],
                        },
                    },
                ],
                margin: [0, 0, 0, 4],
            })

            // --- Dashed cut-line separator ---
            slip.push({
                canvas: [{
                    type: "line",
                    x1: 0, y1: 0, x2: 535, y2: 0,
                    lineWidth: 0.5,
                    dash: { length: 4, space: 3 },
                    lineColor: "#888888",
                }],
                margin: [0, 10, 4, 8],
            })

            content.push({
                stack: slip,
                unbreakable: true,
            })
        })

        // --- Final Summary Page ---
        const summaryRows: any[][] = []
        deptSummary.forEach((accum, dept) => {
            summaryRows.push([
                { text: dept },
                { text: accum.empCount, alignment: "right" },
                { text: formatMoney(accum.totalIncome), alignment: "right" },
                { text: formatMoney(accum.totalDeduct), alignment: "right" },
                { text: formatMoney(accum.netPay), alignment: "right" },
            ])
        })

        // Add Grand Total row
        summaryRows.push([
            { text: "รวมทั้งหมด", bold: true },
            { text: grandEmpCount, alignment: "right", bold: true },
            { text: formatMoney(grandTotalIncome), alignment: "right", bold: true },
            { text: formatMoney(grandTotalDeduct), alignment: "right", bold: true },
            { text: formatMoney(grandNetPay), alignment: "right", bold: true },
        ])

        content.push({
            pageBreak: "before",
            stack: [
                { text: "สรุปยอดจ่ายเงินเดือนจำแนกตามแผนก (Payroll Summary by Department)", style: "header", margin: [0, 0, 0, 10] },
                { text: `${this.params.comName} ประจำงวด: ${this.params.yr}/${this.params.mo}   พิมพ์: ${this.printedAt}`, fontSize: 10, margin: [0, 0, 0, 15] },
                {
                    table: {
                        headerRows: 1,
                        widths: ["*", "auto", "auto", "auto", "auto"],
                        body: [
                            [
                                { text: "แผนก\n(Department)", style: "tableHeader" },
                                { text: "จำนวนพนักงาน\n(Employees)", style: "tableHeader", alignment: "right" },
                                { text: "รวมรายได้\n(Total Income)", style: "tableHeader", alignment: "right" },
                                { text: "รวมรายหัก\n(Total Deductions)", style: "tableHeader", alignment: "right" },
                                { text: "เงินได้สุทธิ\n(Net Pay)", style: "tableHeader", alignment: "right" },
                            ],
                            ...summaryRows,
                        ],
                    },
                },
            ],
            unbreakable: true,
        })

        this.docDefinition = { content }
    }
}
