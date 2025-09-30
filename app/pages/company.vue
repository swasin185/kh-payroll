<template>
    <UCard>
        <template #header>
            <h2 class="text-xl font-bold">บริษัท</h2>
        </template>
        <UTable
            ref="table"
            sticky
            @select="onSelect"
            :row-selection="rowSelection"
            :data="companies"
            :columns="columns"
        />
        <template #footer>
            <UButton
                @click="onSubmit"
                label="เลือก"
                title="เปลี่ยนบริษัท เริ่มต้นทำงาน"
                :disabled="rowSelection.comCode == user?.comCode"
            />
        </template>
    </UCard>
</template>

<script lang="ts" setup>
useHead({
    title: "Company",
})
import type { SchemaTypes } from "~~/server/database/drizzle"
import type { TableColumn, TableRow } from "@nuxt/ui"
type Company = SchemaTypes["company"]
const table = useTemplateRef("table")
const UCheckbox = resolveComponent("UCheckbox")
const columns: TableColumn<Company>[] = [
    {
        id: "select",
        cell: ({ row }) =>
            h(UCheckbox, {
                modelValue: row.getIsSelected(),
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
const { user } = useUserSession()
const companies: Ref<Company[]> = ref(await $waitFetch("/api/companyList"))
const i = companies.value.findIndex((com) => com.comCode === user?.value.comCode)
const rowSelection: Ref<any> = ref({ [i]: true, comCode: user?.value.comCode })

function onSelect(row: TableRow<Company>) {
    if (!rowSelection.value[row.index]) {
        // don't nessecary to delete old attribute, just leave it as garbage
        rowSelection.value = { [row.index]: true, comCode: row.getValue("comCode") }
    }
    // table.value!.tableApi.toggleAllRowsSelected(false)
    // row.toggleSelected(true)
}

async function onSubmit() {
    await $waitFetch("/api/company-session", {
        method: "PUT",
        query: { comCode: rowSelection.value.comCode },
    })
    location.reload()
}
</script>
