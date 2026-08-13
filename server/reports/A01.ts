import { ServerReport } from "./ServerReport"
import { formatMoney } from "~~/shared/utils"

export default class A01 extends ServerReport {
    override name = "Salary Bank Transfer"
    override description = "Monthly payroll summary for bank transfer — lists only employees with a bank account, showing each income line and total transfer amount."
    override query = `
      SELECT
        e.empCode,
        e.prefix,
        e.name,
        e.surName,
        e.department,
        e.empType,
        e.bankAccount,
        p.inCode,
        p.value AS salaryValue,
        i.inName AS incomeName,
        i.inType
      FROM employee e
      INNER JOIN payroll p ON e.comCode = p.comCode AND e.empCode = p.empCode
                           AND p.yr = ? AND p.mo = ?
      LEFT JOIN incometype i ON p.inCode = i.inCode
      WHERE e.comCode = ?
        AND LENGTH(e.bankAccount) = 13
      ORDER BY e.empCode, p.inCode`

    public override getParams(): Record<string, string> {
        return { yr: "", mo: "", comCode: "" }
    }

    private buildPayrollTable(records: any[]) {
        return {
            table: {
                headerRows: 1,
                widths: ["auto", "*", "auto"],
                body: [
                    [
                        { text: "#", style: "tableHeader", alignment: "right" },
                        { text: "รายการ", style: "tableHeader" },
                        { text: "จำนวนเงิน", style: "tableHeader", alignment: "right" },
                    ],
                    ...records.map((r: any, idx: number) => [
                        { text: idx + 1, alignment: "right" },
                        r.incomeName || r.inCode || "-",
                        { text: formatMoney(r.salaryValue), alignment: "right" },
                    ]),
                ],
            },
        }
    }

    protected override define(): void {
        const grouped = Object.groupBy(this.data, (r: any) => r.empCode)
        const entries = Object.entries(grouped)

        const content: any[] = []
        let grandTotal = 0

        // Summary table at top
        const summaryRows: any[] = entries.map(([empCode, records]) => {
            const emp = records![0]
            const total = records!.reduce((sum: number, r: any) => sum + (Number(r.salaryValue) || 0), 0)
            grandTotal += total
            return [
                { text: `${emp.empCode}`, alignment: "right" },
                `${emp.prefix || ""} ${emp.name} ${emp.surName || ""}`.trim(),
                emp.department || "-",
                emp.bankAccount || "-",
                { text: formatMoney(total), alignment: "right" },
            ]
        })

        content.push({
            text: "สรุปรายการโอนเงิน",
            style: "subheader",
            margin: [0, 0, 0, 4],
        })
        content.push({
            table: {
                headerRows: 1,
                widths: ["auto", "*", "auto", "auto", "auto"],
                body: [
                    [
                        { text: "รหัส", style: "tableHeader", alignment: "right" },
                        { text: "ชื่อ-สกุล", style: "tableHeader" },
                        { text: "แผนก", style: "tableHeader" },
                        { text: "เลขบัญชี", style: "tableHeader" },
                        { text: "ยอดโอน", style: "tableHeader", alignment: "right" },
                    ],
                    ...summaryRows,
                    [
                        { text: "", colSpan: 4 }, {}, {}, {},
                        { text: formatMoney(grandTotal), alignment: "right", bold: true },
                    ],
                ],
            },
            margin: [0, 0, 0, 15],
        })

        // Separator
        content.push({
            canvas: [{ type: "line", x1: 0, y1: 0, x2: 555, y2: 0, lineWidth: 1.5, lineColor: "#888888" }],
            margin: [0, 0, 0, 10],
        })

        // Per-employee detail
        content.push({ text: "รายละเอียดรายบุคคล", style: "subheader", margin: [0, 0, 0, 6] })

        entries.forEach(([empCode, records]) => {
            const emp = records![0]
            const total = records!.reduce((sum: number, r: any) => sum + (Number(r.salaryValue) || 0), 0)

            content.push({
                columns: [
                    {
                        text: `${emp.prefix || ""} ${emp.name} ${emp.surName || ""} (${empCode})`.trim(),
                        style: "subheader",
                    },
                    {
                        text: `รวม: ${formatMoney(total)}`,
                        style: "subheader",
                        alignment: "right",
                    },
                ],
                margin: [0, 4, 0, 2],
            })
            content.push({ text: `บัญชี: ${emp.bankAccount}`, fontSize: 9, margin: [0, 0, 0, 2] })
            content.push(this.buildPayrollTable(records!))
            content.push({
                canvas: [{ type: "line", x1: 0, y1: 5, x2: 555, y2: 5, lineWidth: 0.5, lineColor: "#c0c0c0" }],
                margin: [0, 4, 0, 8],
            })
        })

        content.push({
            columns: [
                { text: `รวม ${entries.length} ราย`, bold: true },
                { text: `ยอดรวมทั้งสิ้น: ${formatMoney(grandTotal)}`, bold: true, alignment: "right" },
            ],
            margin: [0, 6, 0, 0],
        })

        this.docDefinition = { content }
    }
}
