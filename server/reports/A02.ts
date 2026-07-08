import { ServerReport } from "./ServerReport"
import DateStr from "~~/shared/DateStr"
import { calculateAge } from "~~/shared/utils"

export default class A02 extends ServerReport {
    override name = "Company Employee Report"
    override description = "Lists all employees grouped by department with details including code, name, type, time code, age, and employment range."
    override query = `
      SELECT *
      FROM employee
      WHERE comCode=?
      ORDER BY empType, department, empCode`

    public override getParams(): string[] {
        return ["comCode"]
    }

    private buildGroupTable(records: any[]) {
        return {
            table: {
                headerRows: 1,
                widths: ["auto", "*", "auto", "auto", "auto", "auto"],
                body: [
                    [
                        { text: "Code", style: "tableHeader", alignment: "right" },
                        { text: "Full Name", style: "tableHeader" },
                        { text: "Emp Type", style: "tableHeader" },
                        { text: "Time Code", style: "tableHeader", alignment: "right" },
                        { text: "Age", style: "tableHeader", alignment: "right" },
                        { text: "Employed Range", style: "tableHeader" },
                    ],
                    ...records.map((record: any) => [
                        { text: `${record.empCode}`, alignment: "right" },
                        `${record.prefix || ""} ${record.name} ${record.surName}`,
                        record.empType || "-",
                        {
                            text: record.timeCode !== null ? `${record.timeCode}` : "-",
                            alignment: "right",
                        },
                        {
                            text: record.birthDate ? `${calculateAge(record.birthDate)}` : "-",
                            alignment: "right",
                        },
                        {
                            text: record.beginDate
                                ? `${new DateStr(record.beginDate).localeDate} - ${record.endDate ? new DateStr(record.endDate).localeDate : "Present"}`
                                : "-",
                        },
                    ]),
                ],
            },
        }
    }

    protected override define(): void {
        const grouped = Object.groupBy(this.data, (r: any) => r.department || "N/A")
        const entries = Object.entries(grouped)

        const content: any[] = []

        entries.forEach(([department, records], index) => {
            if (index > 0) {
                content.push({ text: "", pageBreak: "before" })
            }
            content.push({
                text: `Department: ${department}  (${records!.length} employees)`,
                style: "subheader",
            })
            content.push(this.buildGroupTable(records!))
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
                margin: [0, 5, 0, 0],
            })
        })

        content.push({
            text: `Total: ${this.data.length} employees`,
            bold: true,
            margin: [0, 10, 0, 0],
        })

        this.docDefinition = { content }
    }
}
