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
        :schema="UsersSchema"
        class="space-y-4"
        :disabled="mode !== DBMODE.Insert && mode !== DBMODE.Update"
    >
        <UFormField label="User ID" name="userid" class="w-30">
            <UInput v-model="record.id" :disabled="mode !== DBMODE.Insert" />
        </UFormField>
        <UFormField label="ชื่อจริง" name="name" class="w-54">
            <UInput v-model="record.name" />
        </UFormField>
        <UFormField label="อธิบาย" name="descript" class="w-100">
            <UInput v-model="record.descript" />
        </UFormField>
        <UFormField label="LEVEL" name="level" class="w-36">
            <USelect v-model="record.level" :disabled="!isAdmin" :items="LEVEL_ITEMS" />
        </UFormField>
        <UFormField label="ROLE" name="role">
            <DBLookup v-model:lookupKey="record.role" name="role" :disabled="!isAdmin" />
        </UFormField>
        <UFormField label="Company" name="comCode">
            <DBLookup v-model:lookupKey="record.comCode" name="company" />
        </UFormField>
    </UForm>
    <USeparator class="mt-4" />
    <UButton
        class="m-4"
        label="Permission"
        icon="i-lucide-blinds"
        @click="gotoPermission"
        :disabled="!isAdmin"
    />
    <UButton
        class="m-4"
        label="Password"
        icon="i-lucide-lock-keyhole"
        @click="gotoPassword"
        :disabled="!isAdmin"
    />
</template>

<script lang="ts" setup>
definePageMeta({ keepalive: true })

import { DBMODE, LEVEL_ITEMS } from "~~/shared/utils"

const form = useTemplateRef("form")
const { $waitFetch } = useNuxtApp()
const { user } = useUserSession()
const { isAdmin } = usePayrollMenu()
const search: Ref<string> = ref(user.value.id)

const mode = ref(DBMODE.Idle)

import type { Users } from "~~/shared/schema"
import { UsersSchema } from "~~/shared/schema"

const record = ref<Users>(UsersSchema.parse({}))

function newRecord(): void {
    record.value = UsersSchema.parse({})
}

async function onSelect() {
    if (!search.value) search.value = user.value.id
    record.value = await $waitFetch("/api/users", {
        method: "GET",
        query: { id: search.value },
    })
}

async function onUpdate() {
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

async function onDelete() {
    return false
    // return await $waitFetch("/api/users", { method: "DELETE", query: { id: record.value.id } })
}

async function onInsert() {
    return await $waitFetch("/api/users", {
        method: "POST",
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

const onPrint = async () => {}

const gotoPermission = async () => {
    await navigateTo({
        path: "/permission",
        query: { userId: record.value.id, comCode: record.value.comCode },
    })
}

const gotoPassword = async () => {
    await navigateTo({
        path: "/password",
        query: { userId: record.value.id },
    })
}

await onSelect()
</script>
