import { ServerReport } from "./ServerReport"
import A01 from "./A01"
import A02 from "./A02"
import A03 from "./A03"
import A04 from "./A04"
import A05 from "./A05"

class ReportRegistry extends Map {
    constructor() {
        super()
        super.set("A01", new A01())
        super.set("A02", new A02())
        super.set("A03", new A03())
        super.set("A04", new A04())
        super.set("A05", new A05())
        console.log("ReportRegistry initialized")
    }

    get(key: string): ServerReport {
        return super.get(key) as ServerReport
    }

    getAll(): { id: string; name: string; description: string }[] {
        const reports: { id: string; name: string; description: string }[] = []
        for (const [id, report] of this.entries()) {
            reports.push({
                id,
                name: (report as ServerReport).getName(),
                description: (report as ServerReport).getDescription(),
            })
        }
        return reports
    }
}

export default new ReportRegistry()
