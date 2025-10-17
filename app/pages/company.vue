<template>
    <ToolbarData
        lookupName=""
        dialogName="Company"
        v-model:searchKey="searchKey"
        v-model:mode="mode"
        :level="menu.level"
        :newRecord="newRecord"
        :onSelect="onSelect"
        :onInsert="onInsert"
        :onUpdate="onUpdate"
        :onDelete="onDelete"
        :onPrint="onPrint"
    />
    <UForm
        :state="record"
        :validate="validate"
        class="flex flex-wrap gap-4"
        :disabled="mode !== DBMODE.Insert && mode !== DBMODE.Update"
    >
        <UFormField label="ComCode" name="comCode">
            <UInput v-model="record.comCode" class="w-30" :disabled="mode !== DBMODE.Insert" />
        </UFormField>
        <UFormField label="Title" name="comName">
            <UInput v-model="record.comName" class="w-64" />
        </UFormField>
        <UFormField label="TaxID" name="taxId">
            <UInput v-model="record.taxId" class="w-40" />
        </UFormField>
        <UFormField label="Address" name="address">
            <UInput v-model="record.address" class="w-150" />
        </UFormField>
        <UFormField label="Phone" name="phone">
            <UInput v-model="record.phone" class="w-40" />
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
// comCode: varchar({ length: 2 }).notNull(),
// comName: varchar({ length: 64 }).notNull(),
// taxid: varchar({ length: 13 }),
// address: varchar({ length: 200 }),
// phone: varchar({ length: 100 }),
// email1: varchar({ length: 30 }),
// email2: varchar({ length: 30 }),
// email3: varchar({ length: 30 }),
// yrPayroll: year().default(sql`year(curdate())`),
// mnPayroll: tinyint().default(sql`month(curdate())`),
import type { FormError } from "@nuxt/ui"
const validate = (state: any): FormError[] => {
    const errors = []
    if (state.level > user.level) errors.push({ name: "level", message: "limit" })
    return errors
}

import { DBMODE, LEVELS } from "~~/shared/utils"
const { $waitFetch } = useNuxtApp()
const { user } = useUserSession()
const { activeMenu: menu } = usePayrollMenu()
const searchKey: Ref<string> = ref(user.value.comCode)
const mode = ref(DBMODE.Idle)
const record = ref<any>({})
const toast = useToast()

const newRecord = () => {
    searchKey.value = ""
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
    if (!record.value) {
        newRecord()
        toast.add({
            title: `[${new Date()}] Not Found`,
            description: "ไม่พบข้อมูล",
            color: "warning",
            duration: 1000,
        })
    }
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
