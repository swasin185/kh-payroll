<template>
    <ToolbarData
        lookupName="incometype"
        v-model:searchKey="search"
        v-model:mode="mode"
        :newRecord="newRecord"
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
        class="grid grid-flow-col grid-rows-5 gap-x-8 gap-y-4"
        :disabled="mode !== DBMODE.Insert && mode !== DBMODE.Update"
    >
        <UFormField label="Inc Code" name="inCode" class="w-30">
            <UInput type="text" v-model="record.inCode" :disabled="mode !== DBMODE.Insert" />
        </UFormField>
        <UFormField label="ชื่อเงินได้/หัก" name="inName" class="w-54">
            <UInput type="text" v-model="record.inName" />
        </UFormField>
        <UFormField label="ประเภท" name="inType" class="w-54">
            <UInputNumber v-model="record.inType" :min="-1" :max="1" :step="2" class="w-30" />
        </UFormField>
        <UFormField label="คิดภาษีหรือไม่" name="isTax" class="w-54">
            <USwitch v-model="record.isTax" />
        </UFormField>
        <UFormField label="รีเซ็ตเมื่อปิดงวด" name="isReset" class="w-54">
            <USwitch v-model="record.isReset" />
        </UFormField>
        <UFormField label="ค่าเริ่มต้นสำหรับทุกๆคนไม่เกิน" name="initLimit">
            <MoneyInput v-model="record.initLimit" />
        </UFormField>
        <UFormField label="อัตราค่าเริ่มต้นสำหรับทุกๆคน" name="initPercent">
            <UInputNumber
                v-model="record.initPercent"
                :step="0.01"
                :formatOptions="{ style: 'decimal' }"
                class="w-32"
            />
        </UFormField>
        <UButton label="test" @click="console.log(record)" />
    </UForm>
</template>
<script lang="ts" setup>
definePageMeta({ keepalive: true })

import type { boolean } from "zod"
import { IncomeTypeSchema, type IncomeType } from "~~/shared/schema"
import { DBMODE } from "~~/shared/utils"

const form = useTemplateRef("form")
const { $waitFetch } = useNuxtApp()
const search: Ref<string> = ref("")
const mode = ref(DBMODE.Idle)
const record = reactive<IncomeType>(IncomeTypeSchema.parse({}))

function newRecord(): void {
    Object.assign(record, IncomeTypeSchema.parse({}))
}

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
