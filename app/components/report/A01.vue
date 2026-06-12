<!-- components/EmployeeReport.vue -->
<template>
    <div>
        <UButton @click="generateReport" :disabled="loading"> Download Employee Report </UButton>
    </div>
</template>

<script setup>
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

const generateReport = async () => {
    loading.value = true

    try {
        // Fetch employee data
        const { data: employees } = await useFetch("/api/employee/active")

        // Create PDF
        const docDefinition = {
            pageSize: "A4",
            pageOrientation: "landscape",
            content: [
                { text: "Employee Report", style: "header" },
                { text: `Total: ${employees.value.length} employees`, style: "subheader" },

                // Employee table
                {
                    table: {
                        headerRows: 1,
                        widths: ["auto", "*", "*", "*", "auto", "auto"],
                        body: [
                            // Headers
                            [
                                { text: "Code", style: "tableHeader" },
                                { text: "Full Name", style: "tableHeader" },
                                { text: "Nickname", style: "tableHeader" },
                                { text: "Department", style: "tableHeader" },
                                { text: "Birth Date", style: "tableHeader" },
                                { text: "Status", style: "tableHeader" },
                            ],
                            // Data rows
                            ...employees.value.map((emp) => [
                                `${emp.comCode || ""}${emp.empCode}`,
                                `${emp.prefix || ""} ${emp.name} ${emp.surName}`,
                                emp.nickName || "-",
                                emp.department || "-",
                                emp.birthDate ? new Date(emp.birthDate).toLocaleDateString() : "-",
                                emp.endDate ? "Inactive" : "Active",
                            ]),
                        ],
                    },
                },
            ],
            styles: {
                header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
                subheader: { fontSize: 12, margin: [0, 0, 0, 10] },
                tableHeader: { bold: true, fontSize: 10, fillColor: "#eeeeee" },
            },
        }

        // ✅ Open in browser instead of downloading
        const pdfDocGenerator = pdfMake.createPdf(docDefinition)
        pdfDocGenerator.open(window)
    } catch (error) {
        console.error("Failed to generate report:", error)
    }
}
</script>
