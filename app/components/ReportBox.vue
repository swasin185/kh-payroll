<template>
    <div class="space-y-4 p-4">
        <!-- Report Selector -->
        <URadioGroup v-model="selected" color="primary" variant="table" :items="items" />
        <!-- Report Parameters -->
        <div class="grid grid-cols-2 gap-4">
            <DateInput v-model="params.startDate" label="Start Date" />
            <DateInput v-model="params.endDate" label="End Date" />
            <UInput type="text" v-model="params.fromId" class="w-40" placeholder="From ID" />
            <UInput type="text" v-model="params.toId" class="w-40" placeholder="To ID" />
        </div>
        <!-- Action Buttons -->
        <div class="flex space-x-2">
            <UButton @click="onPreview" icon="i-lucide-printer">Preview PDF</UButton>
            <UButton @click="onSave" icon="i-lucide-save">Save PDF</UButton>
            <UButton @click="onExportTSV" icon="i-lucide-table">Export TSV</UButton>
        </div>
    </div>
</template>

<script setup lang="ts">

import { ref, onMounted } from "vue"
const { $waitFetch } = useNuxtApp()

const props = defineProps<{
    report: string
    startDate?: string
    endDate?: string
    fromId?: string
    toId?: string
}>()

const items = ref<any[]>([])

onMounted(async () => {
    const rawReports = await $waitFetch<any[]>("/api/report?report=" + props.report)
    if (rawReports) {
        const list = Array.isArray(rawReports) ? rawReports : [rawReports]
        items.value = list.map((rep) => ({
            value: rep.id,
            label: rep.name,
            description: '[' + rep.id + '] ' + rep.description,
            params: rep.params
        }))
    }
    console.log(items.value)
})

const selected = ref<string>("")

const params = reactive({
    startDate: props.startDate || "",
    endDate: props.endDate || "",
    fromId: props.fromId || "",
    toId: props.toId || "",
})

const openPDF = useReport()

async function onPreview() {
    const report =
        await openPDF({
            report: selected.value,
            ...params,
        })
}

async function onSave() {
    await openPDF({
        report: selected.value,
        saveFile: selected.value,
        ...params,
    })
}

async function onExportTSV() {
    const tsvBlob = await $waitFetch<Blob>("/api/report/tsv", {
        method: "POST",
        body: {
            report: selected.value,
            saveFile: selected.value,
            ...params,
        },
    })
    if (tsvBlob) {
        const url = URL.createObjectURL(tsvBlob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${selected.value}.tsv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }
}
</script>
