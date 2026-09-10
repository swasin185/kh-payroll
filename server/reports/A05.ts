import { formatMoney, formatMoney0 } from "../../shared/utils"
import { ServerReport } from "./ServerReport"

export default class A05 extends ServerReport {
    override name = "รายการเงินได้/เงินหัก ประจำปี"
    override description = "Yearly summary matrix: Vertical represents income type (inCode), and horizontal represents each month's total."

    override query = `
      SELECT
        p.inCode,
        i.inName,
        i.inType,
        p.mo,
        SUM(p.value) AS totalValue
      FROM payroll p
      INNER JOIN incometype i ON p.inCode = i.inCode
      WHERE p.comCode = ? AND p.yr = ?
      GROUP BY p.inCode, p.mo
      ORDER BY p.inCode, p.mo`

    public override getParams(): Record<string, string> {
        return { comCode: "", yr: "" }
    }

    protected override define(): void {
        this.BASE_PAGE_CONFIG.pageOrientation = "landscape"

        const inCodeGroups: Record<string, any[]> = {}
        for (const row of this.data) {
            if (!inCodeGroups[row.inCode!]) {
                inCodeGroups[row.inCode!] = []
            }
            inCodeGroups[row.inCode]!.push(row)
        }

        // Initialize monthly summary structures (months 1-12)
        const months = Array.from({ length: 12 }, (_, i) => i + 1)
        const monthTotals = Array(12).fill(0)
        let grandTotal = 0

        const tableBody: any[][] = []

        // Header Row
        tableBody.push([
            { text: "รายการเงินได้/หัก", style: "tableHeader" },
            ...months.map((m) => ({ text: `${m}`, style: "tableHeader", alignment: "right" as const })),
            { text: "รวม", style: "tableHeader", alignment: "right" as const },
        ])

        // Get sorted unique inCodes
        const inCodes = Object.keys(inCodeGroups).sort((a, b) => a.localeCompare(b))

        // Populate table body
        for (let i = 0; i < inCodes.length; i++) {
            const inCode = inCodes[i]!
            const records = inCodeGroups[inCode]!
            const first = records[0]
            const name = first.inName || ""

            // Build month map
            const monthMap: Record<number, number> = {}
            for (let j = 0; j < records.length; j++) {
                const rec = records[j]!
                monthMap[Number(rec.mo)] = Number(rec.totalValue || 0)
            }

            let rowSum = 0
            const rowCells: any[] = [
                { text: name }
            ]

            for (let j = 0; j < months.length; j++) {
                const m = months[j]!
                const val = monthMap[m] || 0
                rowSum += val
                monthTotals[j] += val

                rowCells.push({ text: val !== 0 ? formatMoney0(val) : "", alignment: "right" })
            }

            grandTotal += rowSum
            rowCells.push({ text: formatMoney(rowSum), alignment: "right", bold: true })
            tableBody.push(rowCells)
        }

        // Grand Total Row
        tableBody.push([
            { text: "รวมทั้งหมด (Grand Total)", bold: true },
            ...monthTotals.map((mVal) => ({
                text: mVal !== 0 ? formatMoney0(mVal) : "",
                alignment: "right" as const,
                bold: true,
            })),
            { text: formatMoney(grandTotal), alignment: "right" as const, bold: true },
        ])

        const content: any[] = [
            {
                text: `ปีการเงิน (Year): ${this.params.yr}`,
                style: "subheader",
                margin: [0, 0, 0, 10],
            },
            {
                table: {
                    headerRows: 1,
                    widths: ["*", ...Array(12).fill("auto"), "auto"],
                    body: tableBody,
                },
            },
        ]

        this.docDefinition = { content }
    }
}
