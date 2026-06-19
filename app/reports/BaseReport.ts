import pdfMake from "pdfmake/build/pdfmake"
import pdfFonts from "pdfmake/build/vfs_fonts"

const location = window.location.origin
pdfMake.vfs = pdfFonts.vfs
pdfMake.fonts = {
    Roboto: {
        normal: `${location}/fonts/Sarabun-Thin.ttf`,
        bold: `${location}/fonts/Sarabun-Regular.ttf`,
        italics: `${location}/fonts/Sarabun-ThinItalic.ttf`,
        bolditalics: `${location}/fonts/Sarabun-Italic.ttf`,
    },
}

export abstract class BaseReport {
    protected abstract value: string
    protected abstract label: string
    protected abstract apiName: string
    protected docDefinition: any
    protected fileName: string = "Report"
    protected params: Record<string, string> = {}
    protected data: any[] = []

    protected BASE_PAGE_CONFIG = {
        pageSize: "A4",
        pageOrientation: "portrait",
        pageMargins: [20, 30, 20, 30], // [left, top, right, bottom]
        defaultStyle: { fontSize: 10 },
    }

    protected GLOBAL_STYLES = {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
        subheader: { fontSize: 12, margin: [0, 0, 0, 10] },
        tableHeader: { bold: false, fontSize: 12, fillColor: "#ffffff" },
        footerText: { fontSize: 8, alignment: "center", color: "#888888" },
    }

    protected DEFAULT_TABLE_LAYOUT = {
        hLineWidth: (i: number) => (i === 1 ? 1 : 0),
        vLineWidth: () => 0,
        hLineColor: () => "#c0c0c0",
        vLineColor: () => "#c0c0c0",
        // fillColor: (i: number, _node: any) => (i % 2 === 0 ? "#f8f8f8" : "#ffffff"),
        fillColor: (i: number, _node: any) => "#ffffff",
    }

    protected EMPTY_TABLE_LAYOUT = {
        hLineWidth: () => 1,
        vLineWidth: () => 1,
        hLineColor: () => "#c0c0c0",
        vLineColor: () => "#b0b0b0",
        fillColor: (i: number, _node: any) => "#ffffff",
    }

    protected abstract define(): void

    public async refresh() {
        const { $waitFetch } = useNuxtApp()
        this.data = await $waitFetch(this.apiName, {
            method: "GET",
            query: this.params,
        })
    }

    public async downloadTsv() {
        await this.refresh()
        if (typeof window === "undefined" || !this.data || this.data.length === 0) return
        const keys = Object.keys(this.data[0]!)
        const dataRows = this.data.map((record) => {
            return keys.map((key) => {
                const rawValue = record[key]
                return rawValue === null || rawValue === undefined ? "" : rawValue
            })
        })
        const tsvContent = dataRows.map((row) => {
            return row
                .map((val) => {
                    return String(val)
                })
                .join("\t")
        })
        const blob = new Blob(["\ufeff" + tsvContent + "\n"], {
            type: "text/tab-separated-values;charset=utf-8;",
        })
        const url = URL.createObjectURL(blob)

        const link = document.createElement("a")
        link.href = url
        link.download = `${this.fileName}.tsv`
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    /**
     * Recursively walks content nodes and applies DEFAULT_TABLE_LAYOUT
     * to any table that doesn't already have a custom `layout`.
     */
    private applyDefaultTableLayout(nodes: any[]): void {
        for (const node of nodes) {
            if (node && typeof node === "object") {
                if (node.table && !node.layout) {
                    node.layout = this.DEFAULT_TABLE_LAYOUT
                }
                // recurse into nested content arrays (e.g. columns, stack)
                if (Array.isArray(node.content)) this.applyDefaultTableLayout(node.content)
                if (Array.isArray(node.stack)) this.applyDefaultTableLayout(node.stack)
                if (Array.isArray(node.columns)) this.applyDefaultTableLayout(node.columns)
            }
        }
    }

    private async generatePdf(): Promise<string> {
        await this.refresh()
        this.define()
        this.applyDefaultTableLayout(this.docDefinition.content ?? [])
        const finalDocDefinition = {
            ...this.BASE_PAGE_CONFIG,
            ...this.docDefinition.options,

            header: (currentPage: any, pageCount: any) => {},

            content: [
                {
                    text: this.label,
                    style: "header",
                },
                ...this.docDefinition.content,
            ],

            footer: (currentPage: any, pageCount: any) => {
                return { text: `หน้า ${currentPage} / ${pageCount}`, style: "footerText" }
            },

            styles: {
                ...this.GLOBAL_STYLES,
                ...this.docDefinition.styles,
            },
        }

        const pdfDocGenerator = pdfMake.createPdf(finalDocDefinition)
        const blob = await pdfDocGenerator.getBlob()
        return URL.createObjectURL(blob)
    }

    public async downloadPdf() {
        const link = document.createElement("a")
        link.href = await this.generatePdf()
        link.download = `${this.fileName}.pdf`
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    public async previewPdf() {
        const winReport = window.open(
            "report.html",
            "Report",
            "width=800,height=800,toolbar=no,menubar=no",
        )
        winReport!.location.href = await this.generatePdf()
    }
}
