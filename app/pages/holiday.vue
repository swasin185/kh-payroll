<template>
    <ToolbarData
        v-model:searchKey="search"
        v-model:mode="mode"
        :newRecord="
            () => {
                Object.assign(record, HolidaySchema.parse({}))
                record.comCode = comCode
            }
        "
        :onSelect="onSelect"
        :onInsert="onInsert"
        :onUpdate="onUpdate"
        :onDelete="onDelete"
        :onPrint="onPrint"
        :form="form!"
    />
    <USeparator />
    <UForm
        ref="form"
        :state="record"
        :schema="HolidaySchema"
        class="flex gap-x-2 mb-4"
        :disabled="mode !== DBMODE.Insert && mode !== DBMODE.Update"
    >
        <UFormField label="วันหยุด" name="day">
            <DateInput v-model="record.day" />
        </UFormField>
        <UFormField label="ชื่อวันหยุด" name="name">
            <UInput type="text" v-model="record.name" class="w-40" />
        </UFormField>
    </UForm>
    <UTable
        ref="table"
        sticky
        @select="onSelectRow"
        @key.enter="onSelectRow"
        :row-selection="rowSelection"
        :data="holidays"
        :columns="columns"
        class="w-100 h-50"
    />
</template>

<script lang="ts" setup>
definePageMeta({ keepalive: true })

import { HolidaySchema, type Holiday } from "~~/shared/schema"
import { DBMODE } from "~~/shared/utils"
import type { TableRow } from "#ui/types"

const form = useTemplateRef("form")
const { $waitFetch } = useNuxtApp()
const mode = ref(DBMODE.Idle)
const record = reactive<Holiday>(HolidaySchema.parse({}))
const { user } = useUserSession()
const comCode = user.value.comCode
const search = ref(user.value.yrPayroll!.toString())

const table = useTemplateRef("table")
const rowSelection: Ref<any> = ref({})
const holidays = reactive<Holiday[]>([])

const columns = [
    {
        id: "rowNumber",
        header: "#",
        cell: ({ row }: any) => row.index + 1,
        class: "w-20"
    },
    {
        accessorKey: "day",
        header: "วันหยุด",
        class: "w-30"
    },
    {
        accessorKey: "name",
        header: "ชื่อวันหยุด",
        class: "w-60"
    },
]

async function onSelect() {
    const startDate = `${search.value}-01-01`
    const endDate = `${search.value}-12-31`
    
    const result = await $waitFetch("/api/holiday/list", {
        method: "GET",
        query: {
            comCode: comCode,
            startDate: startDate,
            endDate: endDate,
        },
    })
   
    holidays.splice(0, holidays.length, ...(result || []))
}

watch(search, () => {
    onSelect()
})

async function onInsert() {
    record.comCode = comCode
    return await $waitFetch("/api/holiday", {
        method: "POST",
        body: record,
    })
}

async function onUpdate() {
    return await $waitFetch("/api/holiday", {
        method: "PUT",
        body: record,
    })
}

async function onDelete() {
    console.log("delete", record)
    return await $waitFetch("/api/holiday", {
        method: "DELETE",
        query: { comCode: comCode, dateValue: record.day },
    })
}

function onPrint() {}

function onSelectRow(e: Event, row: TableRow<Holiday>) {
    if (!rowSelection.value[row.index])
        rowSelection.value = { [row.index]: true, day: row.getValue("day") }
    Object.assign(record, holidays[row.index])
}

onMounted(() => {
    onSelect()
})
</script>
