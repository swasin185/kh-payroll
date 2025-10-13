<template>
    <USelectMenu
        v-model="model"
        :value="lookupKey"
        value-key="id"
        class="w-50"
        :items="data"
        @update:model-value="updateValue"
    />
</template>

<script setup lang="ts">
import type { LookupItem } from "~~/shared/types"

const props = defineProps<{
    lookupKey: string
    name: string
}>()

const model = defineModel<string>("lookupKey")

const data = ref<LookupItem[]>(
    props.name && props.name > ""
        ? await $fetch("/api/lookup", { method: "GET", query: { name: props.name } })
        : [],
)

const emit = defineEmits(["update:lookupKey"])

const updateValue = (item: string | null) => {
    if (model.value === item) item = null // allow cleared if same item selected
    emit("update:lookupKey", item)
}
</script>
