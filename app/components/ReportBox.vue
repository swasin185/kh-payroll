<template>
    <div class="space-y-4 p-4">
        <!-- Report Selector -->
        <URadioGroup v-model="selected" color="primary" variant="table" :items="props.items" />
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
const props = defineProps<{ items: any[]; report?: string }>()

const selected = ref(props.report || (props.items.length > 0 ? props.items[0].value : ""))

const params = reactive({
    startDate: "",
    endDate: "",
    fromId: "",
    toId: "",
})

function getReport() {
    return props.items.find((item) => item.value === selected.value)
}

function applyParams() {
    const report = getReport()
    report.params = { ...params }
    return report
}

async function onPreview() {
    const report = applyParams()
    await report.previewPdf()
}

async function onSave() {
    const report = applyParams()
    await report.downloadPdf()
}

async function onExportTSV() {
    const report = applyParams()
    await report.downloadTsv()
}
</script>
