<template>
    <ToolbarData
        lookupName=""
        dialogName="Employee"
        v-model:searchKey="search"
        v-model:mode="mode"
        :newRecord="
            () => {
                Object.assign(record, SalarySchema.parse({}))
                record.comCode = user.comCode
                record.empCode = Number.parseInt(search) | 0
                record.inCode = '01'
                record.value = 0
            }
        "
        :onSelect="onSelect"
        :onInsert="onInsert"
        :onUpdate="onUpdate"
        :onDelete="onDelete"
        :onPrint="onPrint"
        :form="form!" />

    <USeparator class="mb-4" />

    <UForm
        ref="form"
        :state="record"
        :schema="SalarySchema"
        class="flex gap-x-2 mb-4"
        :disabled="(mode !== DBMODE.Insert && mode !== DBMODE.Update) || !record.empCode">
        <UFormField label="Income Type" name="inCode">
            <DBLookup v-model:lookupKey="record.inCode" name="incometype" class="w-70" />
        </UFormField>
        <UFormField label="Amount" name="value">
            <MoneyInput v-model="record.value" class="text-right" />
        </UFormField>
    </UForm>

    <UTable
        ref="table"
        sticky
        @select="onSelectRow"
        @key.enter="onSelectRow"
        :row-selection="rowSelection"
        :data="incomes"
        :columns="columns"
        class="w-120 h-60" />
</template>

<script lang="ts" setup>
definePageMeta({ keepalive: true })

import { SalarySchema, type Salary, type IncomeType } from "~~/shared/schema"
import { DBMODE } from "~~/shared/utils"

const form = useTemplateRef("form")
const { $waitFetch } = useNuxtApp()
const search: Ref<string> = ref("")
const mode = ref(DBMODE.Idle)
const { user } = useUserSession()

const record = reactive<Salary>(
    SalarySchema.parse({
        comCode: user.comCode,
        empCode: Number.parseInt(search.value) | 0,
        inCode: "00",
        value: 0,
    }),
)

const table = useTemplateRef("table")
const rowSelection: Ref<any> = ref({})
const incomes = reactive<Salary[]>([])

import type { TableRow } from "#ui/types"

const columns = [
    {
        accessorKey: "inCode",
        header: "Code",
        class: "w-20",
    },
    {
        accessorKey: "inName",
        header: "Income Type",
        class: "w-48",
    },
    {
        accessorKey: "value",
        header: "Amount",
        class: "w-32",
        meta: {
            class: {
                th: "text-right justify-end", // Aligns the header <th> text and its flex container
                td: "text-right font-mono", // Aligns the row cell <td> data
            },
        },
    },
]

async function onSelect() {
    if (!search.value) return
    Object.assign(
        incomes,
        await $waitFetch("/api/salary", {
            method: "GET",
            query: {
                comCode: user.value.comCode,
                empCode: search.value,
            },
        }),
    )
}

async function onInsert() {
    return await $waitFetch("/api/salary", {
        method: "POST",
        body: record,
    })
}

async function onUpdate() {
    return await $waitFetch("/api/salary", {
        method: "PUT",
        body: record,
    })
}

async function onDelete() {
    return await $waitFetch("/api/salary", {
        method: "DELETE",
        query: {
            comCode: record.comCode,
            empCode: record.empCode,
            inCode: record.inCode,
        },
    })
}

function onPrint() {}

function onSelectRow(e: Event, row: TableRow<Salary>) {
    if (!rowSelection.value[row.index]) rowSelection.value = { [row.index]: true }
    Object.assign(record, incomes[row.index])
}
</script>
