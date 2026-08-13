import reportRegistry from "~~/server/reports/ReportRegistry"
import { ServerReport } from "~~/server/reports/ServerReport"

export default defineEventHandler((event): any => {
    const params: Record<string, any> = getQuery(event)

    // Single report lookup: ?report=A01
    if (params.report && typeof params.report === "string" && !params.report.includes(",")) {
        const report = reportRegistry.get(params.report) as ServerReport
        if (report)
            return {
                id: params.report,
                name: report.getName(),
                description: report.getDescription(),
                params: report.getParams(),
            }
    }

    // Filter by list of report IDs: ?report=A01,A02  OR  ?report[]=A01&report[]=A02
    const ids: string[] = (() => {
        if (!params.report) return []
        if (Array.isArray(params.report)) return params.report as string[]
        if (typeof params.report === "string") return params.report.split(",").map((s) => s.trim())
        return []
    })()

    if (ids.length > 0) {
        return ids
            .filter((id) => reportRegistry.get(id))
            .map((id) => {
                const report = reportRegistry.get(id) as ServerReport
                return {
                    id,
                    name: report.getName(),
                    description: report.getDescription(),
                    params: report.getParams(),
                }
            })
    }

    // No filter — return all
    return reportRegistry.getAll()
})
