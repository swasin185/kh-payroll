import { BaseReport } from "./BaseReport"

class A03 extends BaseReport {
    value = "A03"
    label = "รายชื่อพนักงาน"
    apiName = "/api/employee/active"
    override fileName = "employee"

    protected override define(): void {
        this.docDefinition = {
            content: [
                { text: `Total: ${this.data.length} employees`, style: "subheader" },
                {
                    table: {
                        headerRows: 1,
                        widths: ["auto", "*", "*", "*", "auto", "auto"],
                        body: [
                            [
                                { text: "Code", style: "tableHeader" },
                                { text: "Full Name", style: "tableHeader" },
                                { text: "Nickname", style: "tableHeader" },
                                { text: "Department", style: "tableHeader" },
                                { text: "Birth Date", style: "tableHeader" },
                                { text: "Status", style: "tableHeader" },
                            ],
                            ...this.data.map((record: any) => [
                                `${record.comCode || ""}${record.empCode}`,
                                `${record.prefix || ""} ${record.name} ${record.surName}`,
                                record.nickName || "-",
                                record.department || "-",
                                record.birthDate
                                    ? new Date(record.birthDate).toLocaleDateString()
                                    : "-",
                                record.endDate ? "Inactive" : "Active",
                            ]),
                        ],
                    },
                },
            ],
        }
    }
}

export default new A03()
