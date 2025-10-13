<template>
    <div class="flex space-x-2 border-b-1 pb-2 mb-2">
        <DBLookup
            v-model="model"
            :lookupKey="searchKey"
            :name="lookupName"
            @update:model-value="updateSearch"
            :disabled="isModeActive || level < LEVELS.Officer"
        />
        <USeparator orientation="vertical" class="h-8" />
        <UButton
            label="New"
            icon="i-lucide-plus-circle"
            class="bg-green-500"
            @click="setMode(DBMODE.Insert)"
            :variant="isModeActive ? (mode == DBMODE.Insert ? 'outline' : 'ghost') : 'solid'"
            :disabled="isModeActive || level < LEVELS.Entry"
        />
        <UButton
            label="Edit"
            icon="i-lucide-pencil"
            class="bg-yellow-500"
            @click="setMode(DBMODE.Update)"
            :variant="isModeActive ? (mode == DBMODE.Update ? 'outline' : 'ghost') : 'solid'"
            :disabled="isModeActive || level < LEVELS.Officer"
        />
        <UButton
            label="Delete"
            icon="i-lucide-trash-2"
            class="bg-red-500"
            @click="setMode(DBMODE.Delete)"
            :variant="isModeActive ? (mode == DBMODE.Delete ? 'outline' : 'ghost') : 'solid'"
            :disabled="isModeActive || level < LEVELS.Supervisor"
        />

        <UButton
            label="Print"
            icon="i-lucide-printer"
            @click="onPrint()"
            :variant="isModeActive ? 'ghost' : 'solid'"
            :disabled="isModeActive"
        />
        <USeparator orientation="vertical" class="h-8" />
        <template v-if="isModeActive">
            <UButton label="Save" class="bg-sky-500" icon="i-lucide-database" @click="saveClick" />
            <UButton
                label="Cancel"
                class="bg-gray-500"
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
        required: true,
    },
    searchKey: {
        type: String,
        default: "..",
        // validator: (value) => value !== null && value.length >= 0,
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
    onPrint: { type: Function, required: true },
    onInsert: { type: Function, required: true },
    onUpdate: { type: Function, required: true },
    onDelete: { type: Function, required: true },
    onLookup: { type: Function, required: true },
})

const model = defineModel<string>("searchKey")

const emit = defineEmits(["update:searchKey", "update:mode"])

const updateSearch = (item: string | null) => {
    if (model.value === item) item = null // allow cleared if same item selected
    emit("update:searchKey", item)
    setMode(DBMODE.Select)
}

const setMode = async (newMode: number) => {
    emit("update:mode", newMode)
    if (newMode === DBMODE.Select) await props.onSelect()
    else if (newMode === DBMODE.Insert || newMode === DBMODE.Delete) props.newRecord()
}

const isModeActive = computed(
    () => props.mode == DBMODE.Insert || props.mode == DBMODE.Update || props.mode == DBMODE.Delete,
)

const toast = useToast()

const saveClick = async () => {
    let success = false
    if (props.mode === DBMODE.Insert) success = await props.onInsert()
    else if (props.mode === DBMODE.Update) success = await props.onUpdate()
    else if (props.mode === DBMODE.Delete) success = await props.onDelete()
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
