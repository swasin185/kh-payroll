import { BaseReport } from "./BaseReport"
import DateStr from "~~/shared/DateStr"

class A02 extends BaseReport {
    value = "A02"
    label = "Active Employee"
    apiName = "/api/employee/active"
    override fileName = "employee"

    private buildGroupTable(records: any[]) {
        return {
            table: {
                headerRows: 1,
                widths: ["auto", "*", "auto", "*", "auto", "auto"],
                body: [
                    [
                        { text: "Code", style: "tableHeader", alignment: "right" },
                        { text: "Full Name", style: "tableHeader" },
                        { text: "Nickname", style: "tableHeader" },
                        { text: "Department", style: "tableHeader" },
                        { text: "Birth Date", style: "tableHeader", alignment: "right" },
                        { text: "Status", style: "tableHeader" },
                    ],
                    ...records.map((record: any) => [
                        { text: `${record.empCode}`, alignment: "right" },
                        `${record.prefix || ""} ${record.name} ${record.surName}`,
                        record.nickName || "-",
                        record.department || "-",
                        {
                            text: record.birthDate ? new DateStr(record.birthDate).localeDate : "-",
                            alignment: "right",
                        },
                        record.endDate ? "Inactive" : "Active",
                    ]),
                ],
            },
        }
    }

    protected override define(): void {
        const grouped = Object.groupBy(this.data, (r: any) => r.comCode || "N/A")
        const entries = Object.entries(grouped)

        const content: any[] = []

        entries.forEach(([comCode, records], index) => {
            if (index > 0) {
                content.push({ text: "", pageBreak: "before" })
            }
            content.push({
                text: `Company: ${comCode}  (${records!.length} employees)`,
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

        this.docDefinition = { content }
    }
}

export default new A02()
