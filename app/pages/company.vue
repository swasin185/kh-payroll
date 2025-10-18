<template>
    <ToolbarData
        lookupName=""
        dialogName="Company"
        v-model:searchKey="searchKey"
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
        :validate="validate"
        class="space-y-4"
        :disabled="mode !== DBMODE.Insert && mode !== DBMODE.Update"
    >
        <UFormField label="ComCode" name="comCode" class="w-15">
            <UInput v-model="record.comCode" :disabled="mode !== DBMODE.Insert" maxLength="2" />
        </UFormField>
        <UFormField label="Title" name="comName" class="w-80">
            <UInput v-model="record.comName" maxLength="90" />
        </UFormField>
        <UFormField label="TaxID" name="taxId" class="w-40">
            <UInput v-model="record.taxId" maxLength="13" />
        </UFormField>
        <UFormField label="Address" name="address" class="w-150">
            <UInput v-model="record.address" maxLength="200" />
        </UFormField>
        <UFormField label="Phone" name="phone" class="w-80">
            <UInput v-model="record.phone" maxLength="100" />
        </UFormField>
        <UFormField label="Email 1" name="email1" class="w-50">
            <UInput v-model="record.email1" maxLength="30" />
        </UFormField>
        <UFormField label="Email 2" name="email2" class="w-50">
            <UInput v-model="record.email2" maxLength="30" />
        </UFormField>
        <UFormField label="Email 3" name="email3" class="w-50">
            <UInput v-model="record.email3" maxLength="30" />
        </UFormField>
    </UForm>
</template>

<script lang="ts" setup>
const form = useTemplateRef("form")
import type { FormError } from "@nuxt/ui"
const validate = (state: any): FormError[] => {
    const errors = []
    if (state.level > user.level) errors.push({ name: "level", message: "limit" })
    return errors
}

import { DBMODE, LEVELS } from "~~/shared/utils"
const { $waitFetch } = useNuxtApp()
const { user } = useUserSession()
const searchKey: Ref<string> = ref(user.value.comCode)
const mode = ref(DBMODE.Idle)
const record = ref<any>({})
const toast = useToast()

const newRecord = () => {
    record.value = {
        comCode: "",
        comName: "",
        taxId: "",
        address: "",
        phone: "",
        email1: "",
        email2: "",
        email3: "",
    }
}

const onSelect = async () => {
    if (!searchKey.value) searchKey.value = user.value.comCode
    record.value = await $waitFetch("/api/company", {
        method: "GET",
        query: { comCode: searchKey.value },
    })
}

const onUpdate = async () => {
    return await $waitFetch("/api/company", {
        method: "PUT",
        body: record.value,
    })
}

const onDelete = async () => {
    return false
    // return await $waitFetch("/api/users", { method: "DELETE", query: { id: record.value.id } })
}

const onInsert = async () => {
    return await $waitFetch("/api/company", {
        method: "POST",
        body: record.value,
    })
}

const onPrint = async () => {}

await onSelect()
</script>
