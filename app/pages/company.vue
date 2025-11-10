<template>
    <ToolbarData
        lookupName=""
        dialogName="Company"
        v-model:searchKey="searchKey"
        v-model:mode="mode"
        :newRecord="() => Object.assign(record, CompanySchema.parse({}))"
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
        :schema="CompanySchema"
        class="space-y-2"
        :disabled="mode !== DBMODE.Insert && mode !== DBMODE.Update"
    >
        <UFormField label="ComCode" name="comCode">
            <UInput v-model="record.comCode" :disabled="mode !== DBMODE.Insert" class="w-15" />
        </UFormField>
        <UFormField label="Title" name="comName">
            <UInput v-model="record.comName" class="w-80" />
        </UFormField>
        <UFormField label="TaxID" name="taxId">
            <UInput v-model="record.taxId" class="w-40" />
        </UFormField>
        <UFormField label="Address" name="address">
            <UInput v-model="record.address" class="w-150" />
        </UFormField>
        <UFormField label="Phone" name="phone">
            <UInput v-model="record.phone" class="w-80" />
        </UFormField>
        <UFormField label="Email 1" name="email1">
            <UInput v-model="record.email1" class="w-50" />
        </UFormField>
        <UFormField label="Email 2" name="email2">
            <UInput v-model="record.email2" class="w-50" />
        </UFormField>
        <UFormField label="Email 3" name="email3">
            <UInput v-model="record.email3" class="w-50" />
        </UFormField>
    </UForm>
</template>

<script lang="ts" setup>
definePageMeta({ keepalive: true })

import { CompanySchema, type Company } from "~~/shared/schema"
import { DBMODE } from "~~/shared/utils"

const form = useTemplateRef("form")
const { $waitFetch } = useNuxtApp()
const { user } = useUserSession()
const searchKey: Ref<string> = ref(user.value.comCode)
const mode = ref(DBMODE.Idle)
const record = reactive<Company>(CompanySchema.parse({}))

async function onSelect() {
    if (!searchKey.value) searchKey.value = user.value.comCode
    Object.assign(
        record,
        await $waitFetch("/api/company", {
            method: "GET",
            query: { comCode: searchKey.value },
        }),
    )
}

async function onUpdate() {
    return await $waitFetch("/api/company", {
        method: "PUT",
        body: record,
    })
}

async function onDelete() {
    return false
    // return await $waitFetch("/api/users", { method: "DELETE", query: { id: record.value.id } })
}

async function onInsert() {
    return await $waitFetch("/api/company", {
        method: "POST",
        body: record,
    })
}

function onPrint() {}

await onSelect()
</script>
