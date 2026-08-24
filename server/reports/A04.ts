import { ServerReport } from "./ServerReport"
import { formatMoney } from "~~/shared/utils"

export default class A04 extends ServerReport {
    override name = "Employee Salary Slip"
    override description = "Monthly payroll slip for employee salary. Cut off paper line for each employee"
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
        Object.entries(grouped).forEach(([empCode, records], idx) => {
            if (!records || records.length === 0) return
            const emp = records[0]
            const fullName = `${emp.prefix || ""} ${emp.name} ${emp.surName || ""}`.trim()

            const incomeItems = records.filter((r: any) => Number(r.inType) === 1)
            const deductItems = records.filter((r: any) => Number(r.inType) === -1)

            const totalIncome = incomeItems.reduce((sum: number, r: any) => sum + Number(r.value || 0), 0)
            const totalDeduct = deductItems.reduce((sum: number, r: any) => sum + Number(r.value || 0), 0)
            const netPay = totalIncome - totalDeduct

            const slip: any[] = []

            slip.push({
                columns: [
                    { text: `ลำดับ: ${idx + 1}  พิมพ์: ${this.printedAt}`, fontSize: 8, color: "#888888", width: "auto" },
                ],
                margin: [0, 0, 0, 4],
            })

            slip.push({
                columns: [
                    { text: this.params.comName, width: "*" },
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

        this.docDefinition = { content }
    }
}
