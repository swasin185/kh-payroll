import { formatMoney } from "~~/shared/utils"
import { ServerReport } from "./ServerReport"

export default class A03 extends ServerReport {
    override name = "Current Salary Report"
    override description = "Shows current salary details for all employees in the company."
    override query = `
      SELECT e.*, s.inCode, s.value as salaryValue, s.duration, i.inName as incomeName
      FROM employee e
      LEFT JOIN salary s ON e.comCode = s.comCode AND e.empCode = s.empCode
      LEFT JOIN incometype i ON s.inCode = i.inCode
      WHERE e.comCode=?
      ORDER BY e.empType, e.department, e.empCode, s.inCode`

    public override getParams(): Record<string, string> {
        return { comCode: "" }
    }

    private buildSalaryTable(records: any[]) {
        return {
            table: {
                headerRows: 1,
                widths: ["auto", "*", "auto", "auto"],
                body: [
                    [
                        { text: "#", style: "tableHeader", alignment: "right" },
                        { text: "รายการ", style: "tableHeader" },
                        { text: "จำนวน", style: "tableHeader", alignment: "right" },
                        { text: "ระยะ", style: "tableHeader", alignment: "right" },
                    ],
                    ...records.map((record: any, index: number) => [
                        index + 1,
                        record.incomeName || "-",
                        {
                            text: record.salaryValue !== null ? formatMoney(record.salaryValue) : "-",
                            alignment: "right",
                        },
                        {
                            text: record.duration !== null && record.duration !== 0 ? `${record.duration}` : "-",
                            alignment: "right",
                        },
                    ]),
                ],
            },
        }
    }

    protected override define(): void {
        const grouped = Object.groupBy(this.data, (r: any) => r.empCode)
        const entries = Object.entries(grouped)

        const content: any[] = []

        entries.forEach(([empCode, records]) => {
            const emp = records![0]
            const totalSalary = records!.reduce((sum: number, r: any) => sum + (Number(r.salaryValue) || 0), 0)
            content.push({
                text: `พนักงาน: ${emp.prefix || ""} ${emp.name} ${emp.surName || ""} (${empCode}) - เงินเดือนรวม: ${totalSalary.toLocaleString()}`,
                style: "subheader",
            })
            content.push(this.buildSalaryTable(records!))
            content.push({
                canvas: [
                    {
                        type: "line",
                        x1: 0,
                        y1: 5,
                        x2: 555,
                        y2: 5,
                        lineWidth: 1,
                        lineColor: "#b0b0b0",
                    },
                ],
                margin: [0, 5, 0, 10],
            })
        })

        const uniqueEmployees = new Set(this.data.map((r: any) => r.empCode))
        content.push({
            text: `Total: ${uniqueEmployees.size} employees`,
            bold: true,
            margin: [0, 10, 0, 0],
        })

        this.docDefinition = { content }
    }
}
