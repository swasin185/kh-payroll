<template>
    <ToolbarDataWork
        searchKey= "user.id"
        :onLookupClick="handleLookup"
        :onSelectClick="handleSelect"
        :onInsertClick="handleInsert"
        :onUpdateClick="handleUpdate"
        :onDeleteClick="handleDelete"
        :isInsertDisabled="true"
        :isUpdateDisabled="false"
        :isDeleteDisabled="true"
    />
    <UForm :state="dbuser" class="flex flex-col gap-4">
        <UFormField label="User ID" name="userid">
            <UInput v-model="dbuser.id" placeholder="ID ผู้ใช้" class="w-30" disabled />
        </UFormField>
        <UFormField label="ชื่อจริง" name="name">
            <UInput v-model="dbuser.name" class="w-75" />
        </UFormField>
        <UFormField label="อธิบาย" name="descript">
            <UInput v-model="dbuser.descript" class="w-100" />
        </UFormField>
        <UFormField label="LEVEL" name="level">
            <UInput v-model="dbuser.level" class="w-20" :disabled="user.level < 9" />
        </UFormField>
        <UFormField label="ROLE" name="role">
            <UInput v-model="dbuser.role" class="w-30" :disabled="user.level < 9" />
        </UFormField>
    </UForm>
</template>

<script lang="ts" setup>
const { $waitFetch } = useNuxtApp()
const { user } = useUserSession()
// v-model:searchKey= "user.id"
const dbuser: Ref<any> = ref({})
const toast = useToast()

const handleSelect = async () => {
    dbuser.value = await $waitFetch("/api/users", { method: "GET", query: { id: user.value.id } })
}

const handleInsert = () => {}

const handleUpdate = async () => {
    await $waitFetch("/api/users", {
        method: "PUT",
        query: {
            id: dbuser.value.id,
            name: dbuser.value.name,
            descript: dbuser.value.descript,
            level: dbuser.value.level,
            role: dbuser.value.role,
        },
    })
    toast.add({ title: `[${new Date()}] Save`, description: "บันทึกเรียบร้อย", color: "success" })
}

const handleDelete = () => {}
const handleLookup = () => {}

handleSelect()
</script>
