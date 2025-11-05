<template>
    <UInput
        v-model="displayValue"
        type="text"
        placeholder="dd/mm/yyyy"
        maxLength="10"
        @blur="handleBlur"
        @input="filterInput"
    />
</template>

<script setup lang="ts">
const modelValue = defineModel<string | null>({ default: null })

const displayValue = ref<string>("")

watch(
    modelValue,
    (newModelValue) => {
        displayValue.value = new DateStr(newModelValue).localeDate
    },
    { immediate: true },
)

const handleBlur = () => {
    if (!displayValue.value) {
        modelValue.value = null
        return
    }
    const date = completeDate(displayValue.value)
    modelValue.value = date.isoDate
    displayValue.value = date.localeDate
}

import DateStr from "~~/shared/DateStr"

const filterInput = (event: Event) => {
    const inputElement = event.target as HTMLInputElement
    const value = inputElement.value
    if (value == " ") {
        inputElement.value = DateStr.TODAY().localeDate
        return
    }
    let filter = value.replaceAll(/\/\/+/g, "/").replaceAll(/[^\d/]/g, "")
    let idx = filter.indexOf("/")
    if (
        (filter.length == 2 && idx == -1) ||
        (filter.length <= 5 && filter.length == idx + 3 && idx === filter.lastIndexOf("/"))
    )
        filter += "/"
    if (value !== filter) inputElement.value = filter
}

function completeDate(date: string): DateStr {
    let day = ""
    let month = ""
    let year = ""
    let idx1 = date.indexOf("/")
    let idx2 = date.lastIndexOf("/")
    if (idx1 > -1 && idx1 <= 2) {
        day = date.substring(0, idx1).padStart(2, "0")
        if (day == "00") day = DateStr.TODAY().day!
        if (idx2 > idx1) {
            month = date.substring(idx1 + 1, idx2).padStart(2, "0")
            if (month == "00") month = DateStr.TODAY().month!
            if (date.length > idx2 + 1) {
                year = date.substring(idx2 + 1, date.length)
                year = year.padStart(2, "0").padStart(4, "20")
            } else year = DateStr.TODAY().year!
        }
    }
    return new DateStr(`${year}-${month}-${day}`)
}
</script>
