<template>
    <ToolbarData
        lookupName="holiday"
        v-model:searchKey="search"
        v-model:mode="mode"
        :newRecord="() => Object.assign(record, HolidaySchema.parse({}))"
        :onSelect="onSelect"
        :onInsert="onInsert"
        :onUpdate="onUpdate"
        :onDelete="onDelete"
        :onPrint="onPrint"
        :form="form!"
    />
    <UForm
        ref="form"
        :state="record"
        :schema="HolidaySchema"
        class="grid grid-flow-col grid-rows-5 ap-y-2"
        :disabled="mode !== DBMODE.Insert && mode !== DBMODE.Update"
    >
        <UFormField label="Company" name="comCode">
            <DBLookup v-model:lookupKey="record.comCode" name="company" class="w-70" />
        </UFormField>
        <UFormField label="วันหยุด" name="dateValue">
            <DateInput v-model="record.dateValue" />
        </UFormField>
        <UFormField label="ชื่อวันหยุด" name="dateName">
            <UInput type="text" v-model="record.dateName" class="w-40" />
        </UFormField>
    </UForm>
</template>

<script lang="ts" setup>
definePageMeta({ keepalive: true })

import { HolidaySchema, type Holiday } from "~~/shared/schema"
import { DBMODE } from "~~/shared/utils"

const form = useTemplateRef("form")
const { $waitFetch } = useNuxtApp()
const search: Ref<string> = ref("")
const mode = ref(DBMODE.Idle)
const record = reactive<Holiday>(HolidaySchema.parse({}))
const { user } = useUserSession()
const comCode = ref(user.value.comCode)

async function onSelect() {
    Object.assign(
        record,
        await $waitFetch("/api/holiday", {
            method: "GET",
            query: { comCode: comCode, dateValue: search.value },
        }),
    )
}

async function onInsert() {
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
    await $waitFetch("/api/holiday", {
        method: "DELETE",
        query: { comCode: comCode, dateValue: search.value },
    })
}

function onPrint() {}
</script>
