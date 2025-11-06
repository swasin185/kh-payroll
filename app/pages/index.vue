<template>
    Test Waiting bar
    <UButton class="m-4" label="Waiting" @click="isWaiting = true" :disabled="isWaiting == true" />
    <UButton class="m-4" label="Stop" @click="isWaiting = false" :disabled="!isWaiting" />
    <USeparator />
    Test Dialog
    <UButton class="m-4" label="Confirm" @click="askUser" />
    <UButton class="m-4" label="Prompt" @click="promptDialog" />
    <USeparator />Test Report
    <UButton class="m-4" label="Open Report" @click="preview(params)" />
    <UButton class="m-4" label="Save Report" @click="preview(params, 'fname')" />
    <USeparator />Money Input
    <MoneyInput v-model="money" class="m-4"/>
    
</template>

<script lang="ts" setup>
// definePageMeta({ keepalive: true })

const money = ref<number>(1234567.89)

const isWaiting = useWaiting()
const confirm = useDialog()
const askUser = async () => {
    const ok = await confirm({
        title: "Hello",
        message: "Do you want to continues?",
        isConfirm: true,
    })
    if (ok) alert("Let's go!!")
}

const yourName = ref<string>("")

const promptDialog = async () => {
    yourName.value = await confirm({
        message: "What is your name ?",
        lookupCode: yourName.value,
        isPrompt: true,
    })
    if (yourName.value) alert(yourName.value)
}

const preview = useKxReport()

import MoneyInput from "~/components/MoneyInput.vue"
import type { ReportParameter } from "~~/shared/types"

const params: ReportParameter = {
    report: "A00",
    option: "3",
}
</script>
