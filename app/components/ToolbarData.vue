<template>
    <div class="flex space-x-2 border-b-1 pb-2 mb-2">
        <DBLookup
            v-model:lookupKey="searchKey"
            :name="lookupName"
            :dialogName="dialogName"
            :disabled="isModeActive || level < LEVELS.Officer"
        />
        <USeparator orientation="vertical" class="h-8" />
        <UButton
            label="New"
            icon="i-lucide-plus-circle"
            class="bg-green-500 w-10"
            @click="setMode(DBMODE.Insert)"
            :variant="isModeActive ? (mode == DBMODE.Insert ? 'outline' : 'ghost') : 'solid'"
            :disabled="isModeActive || level < LEVELS.Entry || onInsert == undefined"
        />
        <UButton
            label="Edit"
            icon="i-lucide-pencil"
            class="bg-yellow-500 w-10"
            @click="setMode(DBMODE.Update)"
            :variant="isModeActive ? (mode == DBMODE.Update ? 'outline' : 'ghost') : 'solid'"
            :disabled="isModeActive || level < LEVELS.Officer || onUpdate == undefined"
        />
        <UButton
            label="Delete"
            icon="i-lucide-trash-2"
            class="bg-red-500 w-10"
            @click="setMode(DBMODE.Delete)"
            :variant="isModeActive ? (mode == DBMODE.Delete ? 'outline' : 'ghost') : 'solid'"
            :disabled="isModeActive || level < LEVELS.Supervisor || onDelete == undefined"
        />
        <UButton
            label="Print"
            icon="i-lucide-printer"
            class="w-10"
            @click="onPrint!()"
            :variant="isModeActive ? 'ghost' : 'solid'"
            :disabled="isModeActive || onPrint == undefined"
        />
        <USeparator orientation="vertical" class="h-8" />
        <UButton
            label="Save"
            class="bg-sky-500 w-25"
            icon="i-lucide-database-zap"
            @click="saveClick"
            v-if="isModeActive"
        />
        <UButton
            label="Cancel"
            class="bg-gray-500 w-25"
            icon="i-lucide-x-circle"
            @click="setMode(DBMODE.Select)"
            v-if="isModeActive"
        />
    </div>
</template>

<script setup lang="ts">
import { DBMODE, LEVELS } from "~~/shared/utils"
const { activeMenu } = usePayrollMenu()
const level = activeMenu.value.level

const searchKey = defineModel<string>("searchKey")
const mode = defineModel<number>("mode")

const props = defineProps({
    lookupName: {
        type: String,
        default: "",
    },
    dialogName: {
        type: String,
        default: "",
    },
    newRecord: { type: Function, required: true },
    onSelect: { type: Function, required: true },
    onPrint: { type: Function },
    onInsert: { type: Function },
    onUpdate: { type: Function },
    onDelete: { type: Function },
    form: {
        type: Object,
    },
})

watch(searchKey, async () => {
    if (!isModeActive.value && props.onSelect) await props.onSelect()
})

const setMode = async (newMode: number) => {
    if (props.form) props.form.clear()
    mode.value = newMode
    if (newMode === DBMODE.Insert) {
        props.newRecord()
    } else if (newMode === DBMODE.Select) await props.onSelect()
}

const isModeActive = computed(
    () => mode.value == DBMODE.Insert || mode.value == DBMODE.Update || mode.value == DBMODE.Delete,
)

const toast = useToast()

const saveClick = async () => {
    await props.form?.validate()
    let success = false
    if (props.onInsert && mode.value === DBMODE.Insert) success = await props.onInsert()
    else if (props.onUpdate && mode.value === DBMODE.Update) success = await props.onUpdate()
    else if (props.onDelete && mode.value === DBMODE.Delete) success = await props.onDelete()
    if (success)
        toast.add({
            title: "Save",
            description: "บันทึกเรียบร้อย",
            color: "success",
            duration: 1000,
        })
    else
        toast.add({
            title: "Error",
            description: "unsuccessful",
            color: "error",
        })
    setMode(DBMODE.Select)
}
</script>
