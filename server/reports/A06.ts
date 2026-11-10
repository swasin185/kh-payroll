import { formatMoney } from "../../shared/utils"
import { ServerReport } from "./ServerReport"

export default class A06 extends ServerReport {
    override name = "ใบรับรองภาษี"
    override description = "Yearly income and tax summary and social security contributions for tax declaration"
    override query = `
      SELECT 
        e.empCode,
        e.prefix,
        e.name,
        e.surName,
        e.taxid,
        e.address,
        SUM(if(p.inCode < 30, p.value, 0)) as totalIncome,
        SUM(if(p.inCode = 31 OR p.inCode = 51, p.value, 0)) as totalTax,
        SUM(if(p.inCode = 32, p.value, 0)) as totalSocial
      FROM employee e
      INNER JOIN payroll p ON e.comCode = p.comCode AND e.empCode = p.empCode
      WHERE e.comCode = ? AND p.yr = ?
      GROUP BY e.empCode
      ORDER BY e.empCode`

    public override getParams(): Record<string, string> {
        return { comCode: "", yr: "" }
    }

    private buildSummaryTable(records: any[]) {
        return {
            table: {
                headerRows: 1,
                widths: ["auto", "*", "auto", "auto", "auto", "auto"],
                body: [
                    [
                        { text: "#", style: "tableHeader", alignment: "right" },
                        { text: "ชื่อ-สกุล", style: "tableHeader" },
                        { text: "เลขประจำตัวผู้เสียภาษี", style: "tableHeader" },
                        { text: "รายได้รวม", style: "tableHeader", alignment: "right" },
                        { text: "ภาษีรวม", style: "tableHeader", alignment: "right" },
                        { text: "ประกันสังคม", style: "tableHeader", alignment: "right" },
                    ],
                    ...records.map((record: any, index: number) => [
                        index + 1,
                        `${record.prefix || ""} ${record.name} ${record.surName || ""}`.trim(),
                        record.taxid || "-",
                        { text: formatMoney(record.totalIncome), alignment: "right" },
                        { text: formatMoney(record.totalTax), alignment: "right" },
                        { text: formatMoney(record.totalSocial), alignment: "right" },
                    ]),
                ],
            },
        }
    }

    protected override define(): void {
        const content: any[] = []

        content.push({
            text: `รายงานรับรองภาษีประจำปี ${this.params.yr}`,
            style: "subheader",
            margin: [0, 0, 0, 10],
        })

        content.push(this.buildSummaryTable(this.data))

        content.push({
            text: `Total: ${this.data.length} employees`,
            bold: true,
            margin: [0, 10, 0, 0],
        })

        this.docDefinition = { content }
    }
}
