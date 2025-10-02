<script setup>
// 1. Define Props to receive the functions and any necessary control flags
defineProps({
    searchKey: { type: String, default: ".." },

    onLookupClick: { type: Function, required: false },
    onSelectClick: { type: Function, required: true },
    onInsertClick: { type: Function, required: true },
    onUpdateClick: { type: Function, required: true },
    onDeleteClick: { type: Function, required: true },
    onPrintClick: { type: Function, required: true },

    // Control flags for button state
    isInsertDisabled: { type: Boolean, default: false },
    isUpdateDisabled: { type: Boolean, default: false },
    isDeleteDisabled: { type: Boolean, default: false },
})
const emit = defineEmits([
  'update:searchKey'
]);

const updateSearch = (event) => {
  emit('update:searchKey', event.target.value);
};
</script>

<template>
    <UContainer class="flex gap-4 border-b-1 pb-4 mb-4">
        <UInput :value="searchKey" placeholder="id" class="w-40" @input="updateSearch">
            <template #trailing>
                <UButton
                    color="primary"
                    variant="link"
                    icon="i-lucide-search"
                    @click="onLookupClick"
                />
            </template>
        </UInput>
        <UButton
            label="Select"
            icon="i-lucide-mouse-pointer-click"
            class="bg-green-500"
            @click="onSelectClick"
        />
        <UButton
            label="Insert"
            icon="i-lucide-plus-circle"
            class="bg-blue-500"
            @click="onInsertClick"
            :disabled="isInsertDisabled"
        />
        <UButton
            label="Update"
            icon="i-lucide-save"
            class="bg-yellow-500"
            @click="onUpdateClick"
            :disabled="isUpdateDisabled"
        />
        <UButton
            label="Delete"
            icon="i-lucide-trash-2"
            class="bg-red-500"
            @click="onDeleteClick"
            :disabled="isDeleteDisabled"
        />
        <UButton
            label="Print"
            icon="i-lucide-printer"
            class="bg-yellow-100"
            @click="onPrintClick"
        />
    </UContainer>
</template>
