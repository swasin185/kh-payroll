import reportRegistry from "~~/server/reports/ReportRegistry"

export default authEventHandler(async (event): Promise<any> => {
    const params: Record<string, any> = await readBody(event)
    const session = await getUserSession(event)
    const user = session.user as any
    params.comCode = params.comCode || user?.comCode
    params.comName = params.comName || user?.comName
    params.yr = params.yr || String(user?.yrPayroll ?? "")
    params.mo = params.mo || String(user?.mnPayroll ?? "")
    const report = reportRegistry.get(params.report as string)
    if (!report) throw createError({ statusCode: 404, statusMessage: "Report not found" })
    const buffer = await report.generatePdf(params)
    setHeader(event, "Content-Type", "application/pdf")
    setHeader(event, "Content-Disposition", `attachment; filename="${params.saveFile}.pdf"`)
    setHeader(event, "Content-Length", Buffer.byteLength(buffer))
    return buffer
})
