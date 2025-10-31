import { describe, it, expect } from "vitest"

const kxhost = "http://localhost:8080/kxreport/"
console.info(kxhost)

async function fetchPdf(url: string, reportBody: any): Promise<Blob> {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(reportBody),
    })

    if (!response.ok)
        throw new Error("Failed to fetch PDF")

    return response.blob()
}

async function fetchJson(url: string): Promise<any> {
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error("Failed to fetch JSON")
    }
    return response.json()
}

describe("KxReport API openPDF", () => {
    it("should fetch PDF from openPDF endpoint and return a Blob", async () => {
        const reportUrl =  kxhost + "openPDF"
        const reportBody = { report: "A00", app: "kh-payroll", db: "payroll" }
        const result = await fetchPdf(reportUrl, reportBody)
        expect(result).toBeInstanceOf(Blob)
        expect(result.type).toBe("application/pdf")
    })
})

describe("KxReport API json", () => {
    it("should fetch json endpoint", async () => {
        const reportUrl =  kxhost + "json"
        const result = await fetchJson(reportUrl)
        expect(result).toBeInstanceOf(Array)
        expect(result.length).toBeGreaterThan(2)
    })
})