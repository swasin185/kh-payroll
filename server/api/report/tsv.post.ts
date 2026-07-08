import reportRegistry from "~~/server/reports/ReportRegistry"

export default authEventHandler(async (event): Promise<any> => {
    const params: Record<string, string> = await readBody(event)
    const report = reportRegistry.get(params.report as string)
    if (!report) throw createError({ statusCode: 404, statusMessage: "Report not found" })
    const buffer = await report.generateTsv(params)
    setHeader(event, "Content-Type", "text/tab-separated-values;charset=utf-8")
    setHeader(event, "Content-Disposition", `attachment; filename="${params.saveFile}.tsv"`)
    setHeader(event, "Content-Length", buffer.length)
    return buffer
})
