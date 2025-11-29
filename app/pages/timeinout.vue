<template>
    <ToolbarData
        lookupName="employee"
        v-model:searchKey="search"
        v-model:mode="mode"
        :newRecord="() => Object.assign(record, AttendanceSchema.parse({}))"
        :onSelect="onSelect"
        :onInsert="onInsert"
        :onUpdate="onUpdate"
        :onDelete="onDelete"
        :onPrint="onPrint"
        :form="form!"
    />
    <div class="grid grid-flow-col w-100 mb-4">
        <UFormField label="ตั้งแต่วันที่" name="fromDate">
            <DateInput v-model="fromDate" />
        </UFormField>
        <UFormField label="ถึงวันที่" name="toDate">
            <DateInput v-model="toDate" />
        </UFormField>
    </div>
    <UForm
        ref="form"
        :state="record"
        :schema="AttendanceSchema"
        class="grid grid-flow-col grid-rows-6 gap-y-2"
        :disabled="mode !== DBMODE.Insert && mode !== DBMODE.Update"
    >
    </UForm>
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

async function onSelect() {
    const result = await $waitFetch("/api/attendance", {
        method: "GET",
        query: { comCode: comCode.value, empCode: search.value, fromDate: fromDate.value, toDate: toDate.value },
    })
    console.log(result)
}

async function onInsert() {
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
    await $waitFetch("/api/attendance", {
        method: "DELETE",
        query: { inCode: search.value },
    })
}

function onPrint() {}
</script>
