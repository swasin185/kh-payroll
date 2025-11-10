<template>
    <ToolbarData
        lookupName="incometype"
        v-model:searchKey="search"
        v-model:mode="mode"
        :newRecord="() => Object.assign(record, IncomeTypeSchema.parse({}))"
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
        :schema="IncomeTypeSchema"
        class="grid grid-flow-col grid-rows-5 gap-y-2"
        :disabled="mode !== DBMODE.Insert && mode !== DBMODE.Update"
    >
        <UFormField label="Inc Code" name="inCode">
            <UInput
                type="text"
                v-model="record.inCode"
                :disabled="mode !== DBMODE.Insert"
                class="w-30"
            />
        </UFormField>
        <UFormField label="ชื่อเงินได้/หัก" name="inName">
            <UInput type="text" v-model="record.inName" class="w-54" />
        </UFormField>
        <UFormField label="ประเภท" name="inType">
            <UInputNumber v-model="record.inType" :min="-1" :max="1" :step="2" class="w-30" />
        </UFormField>
        <UFormField label="คิดภาษี" name="isTax">
            <USwitch v-model="record.isTax" class="w-54" />
        </UFormField>
        <UFormField label="รีเซ็ตเมื่อปิดงวด" name="isReset">
            <USwitch v-model="record.isReset" class="w-30" />
        </UFormField>
        <UFormField label="มูลค่าจำกัด ไม่เกิน" name="initLimit">
            <MoneyInput v-model="record.initLimit" />
        </UFormField>
        <UFormField label="มูลค่าเปอร์เซ็น" name="initPercent">
            <UInputNumber
                v-model="record.initPercent"
                :step="0.01"
                :formatOptions="{ style: 'decimal' }"
                class="w-32"
            />
        </UFormField>
    </UForm>
</template>
<script lang="ts" setup>
definePageMeta({ keepalive: true })

import { IncomeTypeSchema, type IncomeType } from "~~/shared/schema"
import { DBMODE } from "~~/shared/utils"

const form = useTemplateRef("form")
const { $waitFetch } = useNuxtApp()
const search: Ref<string> = ref("")
const mode = ref(DBMODE.Idle)
const record = reactive<IncomeType>(IncomeTypeSchema.parse({}))

async function onSelect() {
    Object.assign(
        record,
        await $waitFetch("/api/incometype", {
            method: "GET",
            query: { inCode: search.value },
        }),
    )
}

async function onInsert() {
    return await $waitFetch("/api/incometype", {
        method: "POST",
        body: record,
    })
}

async function onUpdate() {
    return await $waitFetch("/api/incometype", {
        method: "PUT",
        body: record,
    })
}

async function onDelete() {
    await $waitFetch("/api/incometype", {
        method: "DELETE",
        query: { inCode: search.value },
    })
}

function onPrint() {}
</script>
