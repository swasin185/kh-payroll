<template>
    <ToolbarData
        lookupName="user"
        v-model:searchKey="search"
        v-model:mode="mode"
        :newRecord="() => Object.assign(record, UsersSchema.parse({}))"
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
        :schema="UsersSchema"
        class="grid grid-flow-col grid-rows-5 gap-x-8 gap-y-4"
        :disabled="mode !== DBMODE.Insert && mode !== DBMODE.Update"
    >
        <UFormField label="User ID" name="id">
            <UInput v-model="record.id" :disabled="mode !== DBMODE.Insert" class="w-30" />
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
                :disabled="!isAdmin"
                :items="LEVEL_ITEMS"
                class="w-36"
            />
        </UFormField>
        <UFormField label="ROLE" name="role">
            <DBLookup
                v-model:lookupKey="record.role"
                name="role"
                :disabled="!isAdmin"
                class="w-55"
            />
        </UFormField>
        <UFormField label="Company" name="comCode">
            <DBLookup v-model:lookupKey="record.comCode" name="company" class="w-70" />
        </UFormField>
        <UFormField label="วันที่รหัสผ่าน" name="passwdTime">
            <UInput v-model="record.passwdTime" disabled class="w-40" />
        </UFormField>
        <UFormField label="วันที่สร้าง" name="created">
            <DateInput v-model="record.created" disabled />
        </UFormField>
        <UFormField label="วันที่ยกเลิก" name="stoped">
            <DateInput v-model="record.stoped" />
        </UFormField>
    </UForm>
    <USeparator class="mt-4" />
    <UButton class="m-4" label="Permission" icon="i-lucide-blinds" @click="gotoPermission" />
    <UButton class="m-4" label="Password" icon="i-lucide-lock-keyhole" @click="gotoPassword" />
</template>

<script lang="ts" setup>
definePageMeta({ keepalive: true })

import { DBMODE, LEVEL_ITEMS } from "~~/shared/utils"
import { UsersSchema, type Users } from "~~/shared/schema"

const form = useTemplateRef("form")
const { $waitFetch } = useNuxtApp()
const { user } = useUserSession()
const { isAdmin } = usePayrollMenu()
const search: Ref<string> = ref(user.value.id)
const mode = ref(DBMODE.Idle)
const record = reactive<Users>(UsersSchema.parse({}))

async function onSelect() {
    if (!search.value) search.value = user.value.id
    Object.assign(
        record,
        await $waitFetch("/api/users", {
            method: "GET",
            query: { id: search.value },
        }),
    )
}

async function onUpdate() {
    return await $waitFetch("/api/users", {
        method: "PUT",
        body: {
            id: record.id,
            name: record.name,
            descript: record.descript,
            level: record.level,
            role: record.role,
            comCode: record.comCode,
        },
    })
}

async function onDelete() {
    if (record.id === user.value.id) return false
    return await $waitFetch("/api/users", { method: "DELETE", query: { id: record.id } })
}

async function onInsert() {
    return await $waitFetch("/api/users", {
        method: "POST",
        body: {
            id: record.id,
            name: record.name,
            descript: record.descript,
            level: record.level,
            role: record.role,
            comCode: record.comCode,
        },
    })
}

const onPrint = async () => {}

const gotoPermission = async () => {
    await navigateTo({
        path: "/permission",
        query: { userId: record.id, comCode: record.comCode },
    })
}

const gotoPassword = async () => {
    await navigateTo({
        path: "/password",
        query: { userId: record.id },
    })
}

await onSelect()
</script>
