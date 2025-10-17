<template>
    <div class="flex space-x-2 border-b-1 pb-2 mb-2">
        <DBLookup
            v-model:lookupKey="model"
            :name="lookupName"
            :dialogName="dialogName"
            :disabled="isModeActive || level < LEVELS.Officer"
        />
        <USeparator orientation="vertical" class="h-8" />
        <UButton
            label="New"
            icon="i-lucide-plus-circle"
            class="bg-green-500 w-24"
            @click="setMode(DBMODE.Insert)"
            :variant="isModeActive ? (mode == DBMODE.Insert ? 'outline' : 'ghost') : 'solid'"
            :disabled="isModeActive || level < LEVELS.Entry || onInsert == undefined"
        />
        <UButton
            label="Edit"
            icon="i-lucide-pencil"
            class="bg-yellow-500 w-24"
            @click="setMode(DBMODE.Update)"
            :variant="isModeActive ? (mode == DBMODE.Update ? 'outline' : 'ghost') : 'solid'"
            :disabled="isModeActive || level < LEVELS.Officer || onUpdate == undefined"
        />
        <UButton
            label="Delete"
            icon="i-lucide-trash-2"
            class="bg-red-500 w-24"
            @click="setMode(DBMODE.Delete)"
            :variant="isModeActive ? (mode == DBMODE.Delete ? 'outline' : 'ghost') : 'solid'"
            :disabled="isModeActive || level < LEVELS.Supervisor || onDelete == undefined"
        />
        <UButton
            label="Print"
            icon="i-lucide-printer"
            class="w-24"
            @click="onPrint!()"
            :variant="isModeActive ? 'ghost' : 'solid'"
            :disabled="isModeActive || onPrint == undefined"
        />
        <USeparator orientation="vertical" class="h-8" />
        <template v-if="isModeActive">
            <UButton
                label="Save"
                class="bg-sky-500 w-24"
                icon="i-lucide-database-zap"
                @click="saveClick"
            />
            <UButton
                label="Cancel"
                class="bg-gray-500 w-24"
                icon="i-lucide-x-circle"
                @click="setMode(DBMODE.Select)"
            />
        </template>
    </div>
</template>

<script setup lang="ts">
import { DBMODE, LEVELS } from "~~/shared/utils"

const props = defineProps({
    lookupName: {
        type: String,
    },
    searchKey: {
        type: String,
        // validator: (value) => value !== null && value.length >= 0,
    },
    dialogName: {
        type: String,
    },
    mode: {
        type: Number,
        default: DBMODE.Idle,
    },
    level: {
        type: Number,
        default: LEVELS.Viewer,
        // validator: (value) => Object.values(LEVELS).includes(value),
    },
    newRecord: { type: Function, required: true },
    onSelect: { type: Function, required: true },
    onPrint: { type: Function, required: false },
    onInsert: { type: Function, required: false },
    onUpdate: { type: Function, required: false },
    onDelete: { type: Function, required: false },
})

const model = defineModel<string>("searchKey")
const modelMode = defineModel<number>("mode")

watch(model, async (value) => {
    if (value && (props.mode === DBMODE.Select || props.mode === DBMODE.Idle) && props.onSelect) 
        await props.onSelect()
})

const setMode = async (newMode: number) => {
    console.log("setMode", newMode)
    modelMode.value = newMode
    if (newMode === DBMODE.Insert) props.newRecord()
    // else if (newMode === DBMODE.Select) await props.onSelect()
}

const isModeActive = computed(
    () => props.mode == DBMODE.Insert || props.mode == DBMODE.Update || props.mode == DBMODE.Delete,
)

const toast = useToast()

const saveClick = async () => {
    let success = false
    if (props.onInsert && props.mode === DBMODE.Insert) success = await props.onInsert()
    else if (props.onUpdate && props.mode === DBMODE.Update) success = await props.onUpdate()
    else if (props.onDelete && props.mode === DBMODE.Delete) success = await props.onDelete()
    if (success)
        toast.add({
            title: `[${new Date()}] Save`,
            description: "บันทึกเรียบร้อย",
            color: "success",
            duration: 1000,
        })
    else
        toast.add({
            title: `[${new Date()}] Error`,
            description: "unsuccessful",
            color: "error",
        })
    setMode(DBMODE.Select)
}

</script>
