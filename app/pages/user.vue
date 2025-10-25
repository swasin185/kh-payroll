<template>
    <ToolbarData
        lookupName="user"
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
        :validate="validate"
        class="space-y-4"
        :disabled="mode !== DBMODE.Insert && mode !== DBMODE.Update"
    >
        <UFormField label="User ID" name="userid" class="w-30">
            <UInput v-model="record.id" :disabled="mode !== DBMODE.Insert" maxLength="16" />
        </UFormField>
        <UFormField label="ชื่อจริง" name="name" class="w-54">
            <UInput v-model="record.name" maxLength="40" />
        </UFormField>
        <UFormField label="อธิบาย" name="descript" class="w-100">
            <UInput v-model="record.descript" maxLength="100" />
        </UFormField>
        <UFormField label="LEVEL" name="level" class="w-36">
            <USelect v-model="record.level" :disabled="!isAdmin" :items="LEVEL_ITEMS" />
        </UFormField>
        <UFormField label="ROLE" name="role">
            <DBLookup v-model:lookupKey="record.role" name="role" :disabled="!isAdmin" />
        </UFormField>
        <UFormField label="Company" name="company">
            <DBLookup v-model:lookupKey="record.comCode" name="company" />
        </UFormField>
    </UForm>
    <USeparator class="mt-4" />
    <UButton label="Permission" icon="i-lucide-blinds" @click="gotoPermission" />
</template>

<script lang="ts" setup>

definePageMeta({ keepalive: true })

import type { FormError } from "@nuxt/ui"

const validate = (state: any): FormError[] => {
    const errors = []
    if (!state.id) errors.push({ name: "userid", message: "ID is empty" })
    if (state.level > user.level) errors.push({ name: "level", message: "limit" })
    return errors
}

import { DBMODE, LEVEL_ITEMS } from "~~/shared/utils"

const form = useTemplateRef("form")
const { $waitFetch } = useNuxtApp()
const { user } = useUserSession()
const { isAdmin } = usePayrollMenu()
const search: Ref<string> = ref(user.value.id)

const mode = ref(DBMODE.Idle)
const record = ref<any>({})

const newRecord = () => {
    record.value = { id: "", name: "", descript: "", level: 1, role: "" }
}

const onSelect = async () => {
    if (!search.value) search.value = user.value.id
    record.value = await $waitFetch("/api/users", {
        method: "GET",
        query: { id: search.value },
    })
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
    return false
    // return await $waitFetch("/api/users", { method: "DELETE", query: { id: record.value.id } })
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
            comCode: record.value.comCOde,
        },
    })
}

const onPrint = async () => {}

const gotoPermission = async () => {
    await navigateTo({
        path: "/permission",
        query: { userid: search.value },
    })
}

await onSelect()
</script>
