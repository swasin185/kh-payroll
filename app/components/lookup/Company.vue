<template>
    <UTable
        sticky
        @select="onSelect"
        :row-selection="rowSelection"
        :data="companies"
        :columns="columns"
    />
</template>

<script lang="ts" setup>
const props = defineProps<{
    lookupKey: string
}>()
const emit = defineEmits(["update:lookupKey"])

import type { SchemaTypes } from "~~/shared/types"
import type { TableColumn, TableRow } from "@nuxt/ui"
type Company = SchemaTypes["company"]
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
        accessorKey: "txtId",
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
const companies: Ref<Company[]> = ref(await $waitFetch("/api/companyList"))
const i = companies.value.findIndex((com) => com.comCode === props.lookupKey)
const rowSelection: Ref<any> = ref({ [i]: true, comCode: props.lookupKey })

function onSelect(row: TableRow<Company>) {
    if (!rowSelection.value[row.index]) {
        // don't nessecary to delete old attribute, just leave it as garbage
        rowSelection.value = { [row.index]: true, comCode: row.getValue("comCode") }
        emit("update:lookupKey", row.getValue("comCode"))
    }
}

async function onSubmit() {
    await $waitFetch("/api/company-session", {
        method: "PUT",
        query: { comCode: rowSelection.value.comCode },
    })
    location.reload()
}
</script>
