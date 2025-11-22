<template>
    <ToolbarData
        lookupName="timetype"
        v-model:searchKey="search"
        v-model:mode="mode"
        :newRecord="() => Object.assign(record, TimeTypeSchema.parse({}))"
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
        :schema="TimeTypeSchema"
        class="grid grid-flow-col grid-rows-8 gap-y-2"
        :disabled="mode !== DBMODE.Insert && mode !== DBMODE.Update"
    >
        <UFormField label="Time Code" name="timeCode">
            <UInput
                type="number"
                v-model="record.timeCode"
                :disabled="mode !== DBMODE.Insert"
                class="w-30"
            />
        </UFormField>
        <UFormField label="คำอธิบาย" name="descript">
            <UInput type="text" v-model="record.descript" class="w-54" />
        </UFormField>
        <UFormField label="เข้างาน 1" name="s1Start">
            <UInput type="text" v-model="record.s1Start" class="w-20" />
        </UFormField>
        <UFormField label="เลิกงาน 1" name="s1Finish">
            <UInput type="text" v-model="record.s1Finish" class="w-20" />
        </UFormField>
        <UFormField label="เข้างาน 2" name="s2Start">
            <UInput type="text" v-model="record.s2Start" class="w-20" />
        </UFormField>
        <UFormField label="เลิกงาน 2" name="s2Finish">
            <UInput type="text" v-model="record.s2Finish" class="w-20" />
        </UFormField>
        <UFormField label="เข้างาน 3" name="s3Start">
            <UInput type="text" v-model="record.s3Start" class="w-20" />
        </UFormField>
        <UFormField label="เลิกงาน 3" name="s3Finish">
            <UInput type="text" v-model="record.s3Finish" class="w-20" />
        </UFormField>
        <UFormField label="อัตราล่วงเวลา 1" name="otRate1">
            <UInputNumber v-model="record.otRate1" :min="1" :max="5" :step="0.5" class="w-30" />
        </UFormField>
        <UFormField label="อัตราล่วงเวลา 2" name="otRate2">
            <UInputNumber v-model="record.otRate2" :min="1" :max="5" :step="0.5" class="w-30" />
        </UFormField>
        <UFormField label="อัตราล่วงเวลา 3" name="otRate3">
            <UInputNumber v-model="record.otRate3" :min="1" :max="5" :step="0.5" class="w-30" />
        </UFormField>
        <UFormField label="เบี้ยเลี้ยง 1" name="allowance1">
            <MoneyInput v-model="record.allowance1" />
        </UFormField>
        <UFormField label="เบี้ยเลี้ยง 2" name="allowance2">
            <MoneyInput v-model="record.allowance2" />
        </UFormField>
    </UForm>
</template>

<script lang="ts" setup>
definePageMeta({ keepalive: true })

import { TimeTypeSchema, type TimeType } from "~~/shared/schema"
import { DBMODE } from "~~/shared/utils"

const form = useTemplateRef("form")
const { $waitFetch } = useNuxtApp()
const search: Ref<string> = ref("")
const mode = ref(DBMODE.Idle)
const record = reactive<TimeType>(TimeTypeSchema.parse({}))

async function onSelect() {
    Object.assign(
        record,
        await $waitFetch("/api/timetype", {
            method: "GET",
            query: { timeCode: search.value },
        }),
    )
}

async function onInsert() {
    return await $waitFetch("/api/timetype", {
        method: "POST",
        body: record,
    })
}

async function onUpdate() {
    return await $waitFetch("/api/timetype", {
        method: "PUT",
        body: record,
    })
}

async function onDelete() {
    await $waitFetch("/api/timetype", {
        method: "DELETE",
        query: { timeCode: search.value },
    })
}

function onPrint() {}
</script>
