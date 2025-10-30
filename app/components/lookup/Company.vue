<template>
    <UTable
        ref="table"
        sticky
        @select="onSelect"
        @key.enter="onSelect"
        :row-selection="rowSelection"
        :data="companies"
        :columns="columns"
    />
</template>

<script lang="ts" setup>
const table = useTemplateRef("table")
import type { Company } from "~~/shared/schema"
import type { TableColumn, TableRow } from "@nuxt/ui"
const UCheckbox = resolveComponent("UCheckbox")
const columns: TableColumn<Company>[] = [
    {
        id: "select",
        cell: ({ row }) =>
            h(UCheckbox, {
                modelValue: row.getIsSelected(),
                onClick: () =>
                    (rowSelection.value = { [row.index]: true, comCode: row.getValue("comCode") }),
            }),
    },
    {
        accessorKey: "comCode",
        header: "Code",
    },
    {
        accessorKey: "comName",
        header: "ชื่อบริษัท",
        cell: ({ row }) => h("div", { class: "font-bold" }, row.getValue("comName")),
    },
    {
        accessorKey: "taxId",
        header: "เลขผู้เสียภาษี",
    },
    {
        accessorKey: "yrPayroll",
        header: "ปี",
    },
    {
        accessorKey: "mnPayroll",
        header: "เดือน",
    },
]
const { $waitFetch } = useNuxtApp()
const lookupKey = defineModel<string>("lookupKey")
const companies: Ref<Company[]> = ref(await $waitFetch("/api/companyList"))
const i = companies.value.findIndex((com) => com.comCode == lookupKey.value)
const rowSelection: Ref<any> = ref({ [i]: true, comCode: lookupKey.value })
const rowIdx = ref(i)
function onSelect(e:Event, row: TableRow<Company>) {
    if (!rowSelection.value[row.index]) {
        rowIdx.value = row.index
        lookupKey.value = row.getValue("comCode")
        // don't nessecary to delete old attribute, just leave it as garbage
        rowSelection.value = { [row.index]: true, comCode: lookupKey.value }
    }
}

defineShortcuts({
    arrowup: (event) => {
        // event.preventDefault()
        if (rowIdx.value > 0) rowIdx.value--
        lookupKey.value = companies.value[rowIdx.value]?.comCode
        rowSelection.value = { [rowIdx.value]: true, lookupKey }
    },
    arrowdown: (event) => {
        // event.preventDefault()
        if (rowIdx.value < companies.value.length - 1) rowIdx.value++
        lookupKey.value = companies.value[rowIdx.value]?.comCode
        rowSelection.value = { [rowIdx.value]: true, lookupKey }
    },
})
</script>
