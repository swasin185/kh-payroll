<template>
    <USelectMenu
        v-model="lookupKey"
        v-model:open="isOpen"
        value-key="id"
        :class="name ? 'w-50' : 'w-30'"
        :items="data"
        @update:modelValue="(item:string) => { if (props.name && lookupKey === item) lookupKey = null }"
        @update:open="openLookupDialog"
    />
</template>

<script setup lang="ts">
const isOpen = ref(false)
const dialog = useDialog()
const openLookupDialog = async (open: boolean) => {
    if (open && data.value.length === 0) {
        isOpen.value = false
        if (props.dialogName) {
            const result = await dialog({
                lookupName: props.dialogName,
                lookupCode: lookupKey.value,
            })
            lookupKey.value = result
        } else
            await dialog({
                title: "No Lookup Dialog",
                message: "ไม่มีการค้นหา",
            })
    }
}

const props = defineProps<{
    name?: string
    dialogName?: string
}>()

const lookupKey = defineModel<string | null>("lookupKey")

import type { LookupItem } from "~~/shared/types"

const data = ref<LookupItem[] | null[]>([])
await refresh()

async function refresh(): Promise<void> {
    data.value = props.name
        ? await $fetch("/api/lookup", { method: "GET", query: { name: props.name } })
        : []
}

defineExpose({
    refresh,
})
</script>
