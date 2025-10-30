<template>
    <USelectMenu
        v-model="lookupKey"
        v-model:open="isOpen"
        value-key="id"
        :class="name ? 'w-50' : 'w-30'"
        :items="data"
        @update:model-value="(item:string) => { if (props.name && lookupKey === item) lookupKey = undefined }"
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

import type { LookupItem } from "~~/shared/types"

const props = defineProps<{
    name?: string
    dialogName?: string
}>()

const lookupKey = defineModel<string | null>("lookupKey")

const data = ref<LookupItem[]>(
    props.name ? await $fetch("/api/lookup", { method: "GET", query: { name: props.name } }) : [],
)
</script>
