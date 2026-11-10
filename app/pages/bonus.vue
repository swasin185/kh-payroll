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
        :form="form!" />

    <USeparator class="mb-4" />

    <UForm
        ref="form"
        :state="record"
        :schema="SalarySchema"
        class="flex gap-x-2 mb-4"
        :disabled="(mode !== DBMODE.Insert && mode !== DBMODE.Update) || !record.empCode">
        <UFormField label="Bonus Type" name="inCode">
            <DBLookup v-model:lookupKey="record.inCode" name="bonustype" class="w-70" />
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
        :data="bonuses"
        :columns="columns"
        class="w-120 h-60" />

    <div class="w-120 flex justify-between items-center border-t border-(--ui-border) px-4 py-2 text-sm font-semibold">
        <span class="text-(--ui-text-muted)">Total</span>
        <span class="font-mono">{{ formatMoney(total) }}</span>
    </div>
</template>

<script lang="ts" setup>
definePageMeta({ keepalive: true })

import { SalarySchema, type Salary } from "~~/shared/schema"
import { DBMODE, formatMoney } from "~~/shared/utils"

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
const bonuses = reactive<Salary[]>([])
const total = computed(() => bonuses.reduce((sum, row) => sum + Number(row.value ?? 0), 0))


import type { TableRow } from "#ui/types"

const columns = [
    {
        accessorKey: "inCode",
        header: "Code",
        class: "w-20",
    },
    {
        accessorKey: "inName",
        header: "Bonus Type",
        class: "w-48",
    },
    {
        accessorKey: "value",
        header: "Amount",
        class: "w-32",
        cell: (data: any) => formatMoney(data.getValue() as number),
        meta: {
            class: {
                th: "text-right justify-end",
                td: "text-right font-mono",
            },
        },
    },
]

async function onSelect() {
    if (!search.value) return
    Object.assign(
        bonuses,
        await $waitFetch("/api/bonus", {
            method: "GET",
            query: {
                comCode: user.value.comCode,
                empCode: search.value,
            },
        }),
    )
}

async function onInsert() {
    return await $waitFetch("/api/bonus", {
        method: "POST",
        body: record,
    })
}

async function onUpdate() {
    return await $waitFetch("/api/bonus", {
        method: "PUT",
        body: record,
    })
}

async function onDelete() {
    return await $waitFetch("/api/bonus", {
        method: "DELETE",
        query: {
            comCode: record.comCode,
            empCode: record.empCode,
            inCode: record.inCode,
        },
    })
}

function onSelectRow(e: Event, row: TableRow<Salary>) {
    if (!rowSelection.value[row.index]) rowSelection.value = { [row.index]: true }
    Object.assign(record, bonuses[row.index])
}
</script>
