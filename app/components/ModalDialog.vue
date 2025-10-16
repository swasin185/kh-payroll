<template>
    <UModal
        v-model:open="state.show"
        :title="state.title"
        :description="state.message"
        :class="state.lookupName === '' ? '' : 'max-w-full md:max-w-[1000px] h-[750px]'"
    >
        <template #body v-if="state.lookupName">
            <KeepAlive>
                <component
                    :is="dynamicLookupComponent"
                    :key="state.lookupName"
                    v-model:lookupKey="state.lookupCode"
                />
            </KeepAlive>
        </template>
        <template #footer>
            <div class="flex justify-center w-full space-x-4">
                <UButton
                    color="warning"
                    class="font-bold"
                    @click="onConfirm"
                    label="&nbsp;&nbsp;&nbsp;OK&nbsp;&nbsp;&nbsp;"
                />
                <UButton v-if="state.isConfirm" @click="onCancel" label="Cancel" />
            </div>
        </template>
    </UModal>
</template>

<script setup lang="ts">
import { KeepAlive } from "vue"
import { useDialogState } from "../composables/useDialog"
const { state, resolve } = useDialogState()

function onConfirm() {
    if (state.lookupName) resolve(state.lookupCode)
    else resolve("OK")
}

function onCancel() {
    resolve("")
}

const dynamicLookupComponent = computed(() => {
    if (!state.lookupName) return null
    try {
        return defineAsyncComponent(() => import(`~/components/lookup/${state.lookupName}.vue`))
    } catch (error) {
        console.error(`Could not load lookup component: ${state.lookupName}.vue`, error)
        return null
    }
})
</script>
