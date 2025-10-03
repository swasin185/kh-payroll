<script setup>
// 1. Define Props to receive the functions and any necessary control flags
defineProps({
    searchKey: { type: String, default: ".." },

    onLookupClick: { type: Function, required: false },
    onSelectClick: { type: Function, required: true },
    onInsertClick: { type: Function, required: false },
    onUpdateClick: { type: Function, required: false },
    onDeleteClick: { type: Function, required: false },
    onPrintClick: { type: Function, required: false },

    // Control flags for button state
    isLookupDisabled: { type: Boolean, default: false },
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
    <UContainer class="flex gap-2 border-b-1 pb-4 mb-4">
        <UInput :value="searchKey" placeholder="id" class="w-40" @input="updateSearch" :disabled="isLookupDisabled">
            <template #trailing>
                <UButton color="primary" variant="link" icon="i-lucide-search" @click="onLookupClick"
                    :disabled="isLookupDisabled" />
            </template>
        </UInput>
        <UButton label="Select" icon="i-lucide-mouse-pointer-click" @click="onSelectClick" />
        <UButton label="Insert" icon="i-lucide-plus-circle" @click="onInsertClick"
            :disabled="isInsertDisabled" />
        <UButton label="Update" icon="i-lucide-save" @click="onUpdateClick"
            :disabled="isUpdateDisabled" />
        <UButton label="Delete" icon="i-lucide-trash-2" @click="onDeleteClick"
            :disabled="isDeleteDisabled" />
        <UButton label="Print" icon="i-lucide-printer" @click="onPrintClick" />
    </UContainer>
</template>
