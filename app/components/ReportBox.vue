<template>
    <div class="space-y-4 p-4">
        <URadioGroup v-model="selected" color="primary" variant="table" :items="items" />
        <div v-if="Object.keys(activeParams).length > 0" class="grid grid-cols-8 gap-4">
            <div v-if="'startDate' in activeParams">จากวันที่</div>
            <div v-else />
            <DateInput class="col-span-2" v-if="'startDate' in activeParams" v-model="params.startDate"
                placeholder="Start Date" />
            <div v-else class="col-span-2" />
            <div v-if="'endDate' in activeParams">ถึงวันที่</div>
            <div v-else />
            <DateInput class="col-span-4" v-if="'endDate' in activeParams" v-model="params.endDate"
                placeholder="End Date" />
            <div v-else class="col-span-4" />
            <div v-if="'fromId' in activeParams">ตั้งแต่รหัส</div>
            <div v-else />
            <UInput v-if="'fromId' in activeParams" type="text" v-model="params.fromId" class="w-40 col-span-2"
                placeholder="From ID" />
            <div v-else class="col-span-2" />
            <div v-if="'toId' in activeParams">ถึงรหัส</div>
            <div v-else />
            <UInput v-if="'toId' in activeParams" type="text" v-model="params.toId" class="w-40 col-span-4"
                placeholder="To ID" />
            <div v-else class="col-span-4" />
        </div>
        <div class="flex space-x-2">
            <UButton @click="onPreview" icon="i-lucide-printer">Preview PDF</UButton>
            <UButton @click="onSave" icon="i-lucide-save">Save PDF</UButton>
            <UButton @click="onExportTSV" icon="i-lucide-table">Export TSV</UButton>
        </div>
    </div>
</template>

<script setup lang="ts">

import { ref, reactive, computed, onMounted } from "vue"
import DateStr from "~~/shared/DateStr";
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
            label: '[' + rep.id + '] ' + rep.name,
            description: rep.description,
            params: rep.params
        }))
        if (items.value.length > 0) {
            selected.value = items.value[0].value
        }
    }
})

const selected = ref<string>("")

const activeParams = computed(() => {
    const currentItem = items.value.find((item) => item.value === selected.value)
    return currentItem?.params || {}
})

const params = reactive({
    startDate: props.startDate || DateStr.TODAY().localeDate,
    endDate: props.endDate || DateStr.TODAY().localeDate,
    fromId: props.fromId || "0",
    toId: props.toId || "9",
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
    const tsvData = await $waitFetch<string>("/api/report/tsv", {
        method: "POST",
        body: {
            report: selected.value,
            saveFile: selected.value,
            ...params,
        },
    })
    if (tsvData) {
        const blob = new Blob([tsvData], { type: "text/tab-separated-values;charset=utf-8" })
        const url = URL.createObjectURL(blob)
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
