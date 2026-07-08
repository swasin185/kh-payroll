import type { ReportParameter } from "~~/shared/types"

const reportApi = "/api/report/pdf"

async function openPDF(params: ReportParameter) {
    const win = params.saveFile
        ? window
        : window.open("report.html", reportApi, "width=800,height=800,toolbar=no,menubar=no")
    params.app = "kh-payroll"
    params.db = "payroll"
    const { user } = useUserSession()
    params.comCode = user.value.comCode
    params.comName = user.value.comName
    const { $waitFetch } = useNuxtApp()
    const pdfResponse = await $waitFetch(reportApi, {
        method: "POST",
        body: params,
    })

    if (!pdfResponse) {
        useToast().add({
            title: "Report Status",
            description: "Local JasperReport Error!",
            color: "warning",
        })
    }

    if (params.saveFile) {
        const link = window.document.createElement("a")
        link.href = URL.createObjectURL(pdfResponse)
        link.download = `${params.saveFile}.pdf`
        window.document.body.appendChild(link)
        link.click()
        window.document.body.removeChild(link)
    }

    if (win) win.location.href = URL.createObjectURL(pdfResponse)
}

export default function useReport() {
    return openPDF
}
