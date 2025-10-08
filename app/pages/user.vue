<template>
    <ToolbarCRUID :searchKey="user?.id" :onLookupClick="handleLookup" :onSelectClick="handleSelect"
        :onInsertClick="handleInsert" :onUpdateClick="handleUpdate" :onDeleteClick="handleDelete"
        :isLookupDisabled="true" :isInsertDisabled="true" :isUpdateDisabled="false" :isDeleteDisabled="true" />

    <UForm :state="record" class="flex flex-col gap-4">
        <UFormField label="User ID" name="userid">
            <UInput v-model="record.id" placeholder="ID ผู้ใช้" class="w-30" disabled />
        </UFormField>
        <UFormField label="ชื่อจริง" name="name">
            <UInput v-model="record.name" class="w-75" />
        </UFormField>
        <UFormField label="อธิบาย" name="descript">
            <UInput v-model="record.descript" class="w-100" />
        </UFormField>
        <UFormField label="LEVEL" name="level">
            <UInputNumber v-model="record.level" class="w-25" :disabled="user?.level < 9" :min="1" :max="9" />
        </UFormField>
        <UFormField label="ROLE" name="role">
            <USelect v-model="record.role" class="w-40" :disabled="user?.level < 9" />
        </UFormField>
    </UForm>
</template>

<script lang="ts" setup>
const { $waitFetch } = useNuxtApp()
const { user } = useUserSession()

const record: Ref<any> = ref({})
const toast = useToast()

const handleSelect = async () => {
    record.value = await $waitFetch("/api/users", { method: "GET", query: { id: user.value?.id } })
}

const handleInsert = () => { }

const handleUpdate = async () => {
    await $waitFetch("/api/users", {
        method: "PUT",
        query: {
            id: record.value.id,
            name: record.value.name,
            descript: record.value.descript,
            level: record.value.level,
            role: record.value.role,
        },
    })
    toast.add({ title: `[${new Date()}] Save`, description: "บันทึกเรียบร้อย", color: "success" })
}

const handleDelete = () => { }
const handleLookup = () => { }

handleSelect()
</script>
