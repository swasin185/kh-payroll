import reportRegistry from "~~/server/reports/ReportRegistry"

export default authEventHandler(async (event): Promise<any> => {
    const params: Record<string, string> = await readBody(event)
    const report = reportRegistry.get(params.report as string)
    if (!report) throw createError({ statusCode: 404, statusMessage: "Report not found" })
    const buffer = await report.generatePdf(params)
    setHeader(event, "Content-Type", "application/pdf")
    setHeader(event, "Content-Disposition", `attachment; filename="${params.saveFile}.pdf"`)
    setHeader(event, "Content-Length", buffer.length)
    return buffer
})
