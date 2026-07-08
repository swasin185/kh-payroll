import reportRegistry from "~~/server/reports/ReportRegistry"
import { ServerReport } from "~~/server/reports/ServerReport"

export default defineEventHandler((event): any => {
    const params: Record<string, string> = getQuery(event)
    const report = reportRegistry.get(params.report as string) as ServerReport
    if (report)
        return {
            report : params.report,
            name : report.getName(),
            description : report.getDescription(),
            params : report.getParams()
        }
    else
        return reportRegistry.getAll()
})
