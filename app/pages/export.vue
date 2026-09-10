<template>
    <div class="space-y-4 p-4">
        <div class="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center space-x-4">
            <span class="text-sm font-medium">Export to Bank (HPCT):</span>
            <UButton @click="onExportBank" icon="i-lucide-download">Export Bank Text File</UButton>
        </div>
    </div>
</template>

<script lang="ts" setup>
const { $waitFetch } = useNuxtApp()

async function onExportBank() {
    const textData = await $waitFetch<string>("/api/salary/export", {
        method: "POST",
        body: {
            dt: new Date().getDate(), // Value date is today
        },
    })

    if (textData) {
        const blob = new Blob([textData], { type: "text/plain;charset=utf-8" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        // Default filename pattern
        a.download = "bank_transfer.txt"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }
}
</script>
