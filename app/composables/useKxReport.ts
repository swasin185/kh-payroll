import type { ReportParameter } from "~~/shared/types"

const kxreport = "/kxreport"

async function preview(params: ReportParameter, saveFile: string = "") {
    const win = window.open("report.html", kxreport, "width=800,height=800,toolbar=no,menubar=no")

    params.app = "kh-payroll"
    params.db = "payroll"
    const { user } = useUserSession()
    params.comCode = user.value.comCode
    params.comName = user.value.comName
    if (saveFile) params.saveFile = saveFile

    const { $waitFetch } = useNuxtApp()
    const api = params.saveFile ? "filePDF" : "openPDF"
    const pdfResponse = await $waitFetch(`${kxreport}/${api}`, {
        method: "POST",
        body: params,
    })

    if (pdfResponse)
        win!.location.href = params.saveFile
            ? `${kxreport}${pdfResponse}`
            : URL.createObjectURL(pdfResponse)
    else
        useToast().add({
            title: "Report Status",
            description: "Local JasperReport Server Error!",
            color: "warning",
        })
}

export default function useKxReport() {
    return preview
}
