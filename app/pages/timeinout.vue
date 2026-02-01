<template>
    <ToolbarData
        lookupName="employee"
        v-model:searchKey="search"
        v-model:mode="mode"
        :newRecord="
            () => {
                Object.assign(record, AttendanceSchema.parse({}))
                record.comCode = comCode
                record.empCode = Number.parseInt(search)
                record.dateTxt = DateStr.TODAY().isoDate
            }
        "
        :onSelect="onSelect"
        :onInsert="onInsert"
        :onUpdate="onUpdate"
        :onDelete="onDelete"
        :onPrint="onPrint"
        :form="form!"
    />
    <div class="flex gap-x-2 mb-4">
        <UFormField label="ตั้งแต่วันที่" name="fromDate">
            <DateInput v-model="fromDate" />
        </UFormField>
        <UFormField label="ถึงวันที่" name="toDate">
            <DateInput v-model="toDate" />
        </UFormField>
    </div>
    <USeparator />
    <UForm
        ref="form"
        :state="record"
        :schema="AttendanceSchema"
        class="flex gap-x-2 mb-4"
        :disabled="mode !== DBMODE.Insert && mode !== DBMODE.Update || !record.empCode"
    >
        <UFormField label="วันที่" name="dateTxt">
            <DateInput v-model="record.dateTxt" />
        </UFormField>
        <UFormField label="เข้าเช้า" name="morning">
            <UInput type="text" v-model="record.morning" class="w-18" maxlength="5" />
        </UFormField>
        <UFormField label="พักเที่ยง" name="lunch_out">
            <UInput type="text" v-model="record.lunch_out" class="w-18" maxlength="5" />
        </UFormField>
        <UFormField label="กลับเที่ยง" name="lunch_in">
            <UInput type="text" v-model="record.lunch_in" class="w-18" maxlength="5" />
        </UFormField>
        <UFormField label="ออกเย็น" name="evening">
            <UInput type="text" v-model="record.evening" class="w-18" maxlength="5" />
        </UFormField>
        <UFormField label="ออกค่ำ" name="night">
            <UInput type="text" v-model="record.night" class="w-18" maxlength="5" />
        </UFormField>
        <UFormField label="ข้ามวัน" name="early">
            <UInput type="text" v-model="record.early" class="w-18" maxlength="5" />
        </UFormField>
        <UFormField label="พนักงาน" name="empCode">
            <UInput type="number" v-model="record.empCode" disabled class="w-20" />
        </UFormField>
    </UForm>
    <UTable
        ref="table"
        sticky
        @select="onSelectRow"
        @key.enter="onSelectRow"
        :row-selection="rowSelection"
        :data="attendance"
        :columns="columns"
        class="w-200 h-60"
    />
</template>
<script lang="ts" setup>
definePageMeta({ keepalive: true })

import { AttendanceSchema, type Attendance } from "~~/shared/schema"
import { DBMODE } from "~~/shared/utils"
import DateStr from "~~/shared/DateStr"

const form = useTemplateRef("form")
const { $waitFetch } = useNuxtApp()
const search: Ref<string> = ref("")
const mode = ref(DBMODE.Idle)
const record = reactive<Attendance>(AttendanceSchema.parse({}))

const { user } = useUserSession()
const comCode = ref(user.value.comCode)
const fromDate: Ref<string | null> = ref(DateStr.TODAY().getFirstDateOfMonth())
const toDate: Ref<string | null> = ref(DateStr.TODAY().getLastDateOfMonth())

const table = useTemplateRef("table")
const rowSelection: Ref<any> = ref({})
const attendance = reactive<Attendance[]>([])

import type { TableRow } from "#ui/types"

const columns = [
    {
        accessorKey: "dateTxt",
        header: "วันที่",
        class: "w-20"
    },
    {
        accessorKey: "morning",
        header: "Morning",
        class: "w-15"
    },
    {
        accessorKey: "lunch_out",
        header: "L-Out",
        class: "w-15"
    },
    {
        accessorKey: "lunch_in",
        header: "L-In",
        class: "w-15"
    },
    {
        accessorKey: "evening",
        header: "Evening",
        class: "w-15"
    },
    {
        accessorKey: "night",
        header: "Night",
        class: "w-15"
    },
    {
        accessorKey: "early",
        header: "Early",
        class: "w-15"
    },
    {
        accessorKey: "workMin",
        header: "นาทีงาน",
        class: "w-15"
    },
    {
        accessorKey: "otMin",
        header: "OT",
        class: "w-15"
    },
    {
        accessorKey: "status",
        header: "สถานะ",
        class: "w-20"
    },
]

async function onSelect() {
    Object.assign(
        attendance,
        await $waitFetch("/api/attendance", {
            method: "GET",
            query: {
                comCode: comCode.value,
                empCode: search.value,
                fromDate: fromDate.value,
                toDate: toDate.value,
            },
        }),
    )
}

async function onInsert() {
    console.log(record)
    return await $waitFetch("/api/attendance", {
        method: "POST",
        body: record,
    })
}

async function onUpdate() {
    return await $waitFetch("/api/attendance", {
        method: "PUT",
        body: record,
    })
}

async function onDelete() {
    return await $waitFetch("/api/attendance", {
        method: "DELETE",
        query: { comCode: record.comCode, empCode: record.empCode, dateTxt: record.dateTxt },
    })
}

function onPrint() {}

function onSelectRow(e: Event, row: TableRow<Attendance>) {
    if (!rowSelection.value[row.index])
        rowSelection.value = { [row.index]: true, dateTxt: row.getValue("dateTxt") }
    Object.assign(record, attendance[row.index])
}
</script>
