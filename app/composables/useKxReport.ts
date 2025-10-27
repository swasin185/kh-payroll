import type { ReportParameter } from "~~/shared/types"

const kxreport = "/kxreport"

async function preview(api: "openPDF" | "filePDF", params: ReportParameter) {
    const win = window.open("report.html", kxreport, "width=800,height=800,toolbar=no,menubar=no")

    params.app = "kh-payroll"
    params.db = "payroll"
    const { user } = useUserSession()
    params.comCode = user.value.comCode
    params.comName = user.value.comName

    const { $waitFetch } = useNuxtApp()
    const pdfResponse = await $waitFetch(`${kxreport}/${api}`, {
        method: "POST",
        body: params,
    })

    if (pdfResponse)
        win!.location.href =
            api === "filePDF" ? `${kxreport}${pdfResponse}` : URL.createObjectURL(pdfResponse)
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
