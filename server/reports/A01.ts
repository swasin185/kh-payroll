import { ServerReport } from "./ServerReport"
import { formatMoney } from "~~/shared/utils"

export default class A01 extends ServerReport {
    override name = "Salary Bank Transfer"
    override description = "Monthly payroll summary for bank transfer — lists only employees with a bank account, showing each income line and total transfer amount."
    override query = `
      SELECT
        ROW_NUMBER() over (ORDER BY e.bankAccount) AS No,
        e.empCode,
        e.prefix,
        e.name,
        e.surName,
        e.bankAccount,
        SUM(p.value) AS totalValue,
        SUM(if(p.inCode='43', p.value, 0)) AS feeValue
      FROM employee e
      INNER JOIN payroll p ON e.comCode = p.comCode AND e.empCode = p.empCode
                           AND p.yr = ? AND p.mo = ?
      WHERE e.comCode = ?
        AND LENGTH(e.bankAccount) = 13
      GROUP BY e.empCode, e.bankAccount
      ORDER BY e.bankAccount`

    public override getParams(): Record<string, string> {
        return { yr: "", mo: "", comCode: "" }
    }

    protected override define(): void {
        const content: any[] = []
        let grandTotal = 0

        const summaryRows: any[] = this.data.map((row: any, index: number) => {
            grandTotal += Number(row.totalValue)
            return [
                { text: row.No, alignment: "right" },
                { text: row.empCode },
                `${row.prefix || ""} ${row.name} ${row.surName || ""}`.trim(),
                row.bankAccount || "-",
                { text: formatMoney(row.totalValue), alignment: "right" },
                { text: formatMoney(row.feeValue), alignment: "right" },
            ]
        })

        content.push({
            text: "รายการโอนเงิน ประจำงวด " + this.params.mo + "/" + this.params.yr,
            style: "subheader",
            margin: [0, 0, 0, 4],
        })
        content.push({
            table: {
                headerRows: 1,
                widths: ["auto", "auto", "*", "*", "auto", "auto"],
                body: [
                    [
                        { text: "ลำดับ", style: "tableHeader", alignment: "right" },
                        { text: "รหัส", style: "tableHeader" },
                        { text: "ชื่อ-สกุล", style: "tableHeader" },
                        { text: "เลขบัญชี", style: "tableHeader" },
                        { text: "ยอดโอน", style: "tableHeader", alignment: "right" },
                        { text: "ค่าธรรมเนียม", style: "tableHeader", alignment: "right" },
                    ],
                    ...summaryRows,
                ],
            },
            margin: [0, 0, 0, 15],
        })

        content.push({
            canvas: [{ type: "line", x1: 0, y1: 0, x2: 555, y2: 0, lineWidth: 1.5, lineColor: "#888888" }],
            margin: [0, 0, 0, 10],
        })

        content.push({
            columns: [
                { text: `ยอดรวม: ${formatMoney(grandTotal)}`, alignment: "right" },
            ],
            margin: [0, 6, 0, 0],
        })

        this.docDefinition = { content }
    }
}
