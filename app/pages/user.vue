<template>
    <ToolbarData
        lookupName="user"
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
        class="flex flex-col gap-4"
        :disabled="mode !== DBMODE.Insert && mode !== DBMODE.Update"
    >
        <UFormField label="User ID" name="userid">
            <UInput v-model="record.id" class="w-30" :disabled="mode !== DBMODE.Insert" />
        </UFormField>
        <UFormField label="ชื่อจริง" name="name">
            <UInput v-model="record.name" class="w-54" />
        </UFormField>
        <UFormField label="อธิบาย" name="descript">
            <UInput v-model="record.descript" class="w-100" />
        </UFormField>
        <UFormField label="LEVEL" name="level">
            <USelect
                v-model="record.level"
                class="w-36"
                :disabled="!isAdmin"
                :items="LEVEL_ITEMS"
            />
        </UFormField>
        <UFormField label="ROLE" name="role">
            <DBLookup v-model:lookupKey="record.role" name="role" :disabled="!isAdmin" />
        </UFormField>
        <UFormField label="Company" name="company">
            <DBLookup v-model:lookupKey="record.comCode" name="company" class="w-64" />
        </UFormField>
    </UForm>
</template>

<script lang="ts" setup>
import type { FormError } from "@nuxt/ui"
const validate = (state: any): FormError[] => {
    const errors = []
    if (!state.id) errors.push({ name: "userid", message: "ID is empty" })
    if (state.level > user.level) errors.push({ name: "level", message: "limit" })
    return errors
}

import { DBMODE, LEVEL_ITEMS } from "~~/shared/utils"

const { $waitFetch } = useNuxtApp()
const { user } = useUserSession()
const { activeMenu: menu, isAdmin } = usePayrollMenu()
const searchKey: Ref<string> = ref(user.value.id)
const mode = ref(DBMODE.Idle)
const record: Ref<any> = ref({})
const toast = useToast()

const newRecord = () => {
    searchKey.value = ""
    record.value = { id: "", name: "", descript: "", level: 1, role: "" }
}

const onSelect = async () => {
    if (!searchKey.value) searchKey.value = user.value.id
    record.value = await $waitFetch("/api/users", {
        method: "GET",
        query: { id: searchKey.value },
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
    return await $waitFetch("/api/users", {
        method: "PUT",
        body: {
            id: record.value.id,
            name: record.value.name,
            descript: record.value.descript,
            level: record.value.level,
            role: record.value.role,
            comCode: record.value.comCode,
        },
    })
}

const onDelete = async () => {
    return await $waitFetch("/api/users", { method: "DELETE", query: { id: record.value.id } })
}

const onInsert = async () => {
    return await $waitFetch("/api/users", {
        method: "POST",
        body: {
            id: record.value.id,
            name: record.value.name,
            descript: record.value.descript,
            level: record.value.level,
            role: record.value.role,
        },
    })
}

const onPrint = async () => {}

async function submit() {
    console.log("SUBMIT")
}

await onSelect()
</script>
