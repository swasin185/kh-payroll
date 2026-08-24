import { getDB } from "../database/pool"
import { RowDataPacket } from "mysql2/promise"
import { resolve } from "node:path"
import pdfmake from "pdfmake"
pdfmake.addFonts({
    Roboto: {
        normal: resolve(process.cwd(), "public/fonts/Sarabun-Thin.ttf"),
        bold: resolve(process.cwd(), "public/fonts/Sarabun-Regular.ttf"),
        italics: resolve(process.cwd(), "public/fonts/Sarabun-ThinItalic.ttf"),
        bolditalics: resolve(process.cwd(), "public/fonts/Sarabun-Italic.ttf"),
    },
})
const db = getDB()

export abstract class ServerReport {
    protected abstract name: string
    protected abstract query: string
    protected abstract description: string
    protected docDefinition: any
    protected params: Record<string, string> = {}
    protected data: any[] = []

    protected printedAt = new Date().toLocaleString("th-TH", {
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit",
    })

    public getName(): string {
        return this.name
    }

    public getDescription(): string {
        return this.description
    }

    public getParams(): Record<string, string> {
        return this.params
    }

    protected mapQueryParams(inputParams: Record<string, string>): Array<string | undefined> {
        this.params = inputParams
        const paramKeys = Object.keys(this.getParams())
        const queryParams = paramKeys.map((key) => this.params[key])
        return queryParams
    }

    protected BASE_PAGE_CONFIG = {
        pageSize: "A4",
        pageOrientation: "portrait",
        pageMargins: [30, 20, 30, 20], // [left, top, right, bottom]
        defaultStyle: { fontSize: 10 },
    }

    protected GLOBAL_STYLES = {
        header: { fontSize: 14, bold: false, margin: [0, 0, 0, 5] },
        subheader: { fontSize: 12, margin: [0, 0, 0, 5] },
        tableHeader: { bold: false, fontSize: 10, fillColor: "#ffffff" },
        footerText: { fontSize: 8, alignment: "center", color: "#888888", margin: [20, 5, 20, 5] },
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

    private async executeQuery(inputParams: Record<string, string>) {
        [this.data] = await db.query<RowDataPacket[]>(this.query, this.mapQueryParams(inputParams))
    }

    private applyDefaultTableLayout(nodes: any[]): void {
        for (const node of nodes) {
            if (node && typeof node === "object") {
                if (node.table && !node.layout)
                    node.layout = this.DEFAULT_TABLE_LAYOUT
                if (Array.isArray(node.content)) this.applyDefaultTableLayout(node.content)
                if (Array.isArray(node.stack)) this.applyDefaultTableLayout(node.stack)
                if (Array.isArray(node.columns)) this.applyDefaultTableLayout(node.columns)
            }
        }
    }

    public async generateTsv(params: Record<string, string>): Promise<string> {
        await this.executeQuery(params)
        if (!this.data || this.data.length === 0) return "No Data!"
        const keys = Object.keys(this.data[0]!)
        const dataRows = this.data.map((record) => {
            return keys.map((key) => {
                const rawValue = record[key]
                return rawValue === null || rawValue === undefined ? "" : rawValue
            })
        })
        const allRows = [keys, ...dataRows]
        return allRows.map((row) => row.map((val) => String(val)).join("\t")).join("\n")
    }

    public async generatePdf(params: Record<string, string>): Promise<any> {
        await this.executeQuery(params)
        this.define()
        this.applyDefaultTableLayout(this.docDefinition.content ?? [])
        const finalDocDefinition = {
            ...this.BASE_PAGE_CONFIG,
            ...this.docDefinition.options,

            content: [
                { text: this.constructor.name + " - " + this.printedAt, alignment: "left", fontSize: 8, color: "#888888", width: "*" },
                { text: this.name, style: "header", alignment: "center", width: "*" },
                {
                    text: this.params.comName,
                    style: "subheader",
                    alignment: "center",
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
        const pdf = pdfmake.createPdf(finalDocDefinition)
        const buffer = await pdf.getBuffer()
        return buffer
    }
}
