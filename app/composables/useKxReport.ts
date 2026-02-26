import type { ReportParameter } from "~~/shared/types"

const kxreport = "/kxreport"
const apiBlob = `${kxreport}/openPDF`
const apiFile = `${kxreport}/filePDF`

async function preview(params: ReportParameter, saveFile: string = "") {
    const win = window.open("report.html", kxreport, "width=800,height=800,toolbar=no,menubar=no")

    params.app = "kh-payroll"
    params.db = "payroll"
    const { user } = useUserSession()
    params.comCode = user.value.comCode
    params.comName = user.value.comName
    params.saveFile = saveFile

    const { $waitFetch } = useNuxtApp()
    const pdfResponse = await $waitFetch(saveFile ? apiFile : apiBlob, {
        method: "POST",
        body: params,
    })

    if (pdfResponse && win)
        win.location.href = params.saveFile
            ? `${kxreport}${pdfResponse}`
            : URL.createObjectURL(pdfResponse)
    else
        useToast().add({
            title: "Report Status",
            description: "Local JasperReport Error!",
            color: "warning",
        })
}

export default function useKxReport() {
    return preview
}
