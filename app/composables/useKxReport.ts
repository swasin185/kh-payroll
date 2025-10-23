import type { ReportParameter } from "~~/shared/types"

const WIN_OPT = "width=800,height=800,toolbar=no,menubar=no,location=no"

function viewReport(url: string = "report.html") {
    window.open(url, "kxreport", WIN_OPT)
}

async function openReport(params: ReportParameter) {
    const { $waitFetch } = useNuxtApp()
    const x = viewReport()
    const pdfResponse = await $waitFetch("/kxreport/openPDF", {
        method: "POST",
        body: params,
    })
    if (pdfResponse) viewReport(URL.createObjectURL(pdfResponse))
    else reportNotAvailble()
}

async function saveReport(params: ReportParameter) {
    const { $waitFetch } = useNuxtApp()
    viewReport()
    const pdfResponse = await $waitFetch("/kxreport/filePDF", {
        method: "POST",
        body: params,
    })
    if (pdfResponse) viewReport("." + pdfResponse)
    else reportNotAvailble()
}

function reportNotAvailble() {
    useToast().add({
        title: `[${new Date()}] Report Status`,
        description: "JasperReport Server's availble for local usage",
        color: "warning",
    })
}

export default function useKxReport() {
    return {
        openReport,
        saveReport,
    }
}
