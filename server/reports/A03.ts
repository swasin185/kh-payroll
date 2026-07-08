import { ServerReport } from "./ServerReport"

export default class A03 extends ServerReport {
    override name = "Company Employee Summary"
    override description = "Summary report showing total employee count for the company."
    override query = `
      SELECT *
      FROM employee
      WHERE comCode=?
      ORDER BY empType, department, empCode`

    protected override define(): void {
        const content: any[] = []
        this.docDefinition = { content }
    }
}
