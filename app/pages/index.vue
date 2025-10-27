<template>
    Test Waiting bar
    <UButton class="m-4" label="Waiting" @click="isWaiting = true" :disabled="isWaiting == true" />
    <UButton class="m-4" label="Stop" @click="isWaiting = false" :disabled="!isWaiting" />
    <USeparator />
    Test Dialog
    <UButton class="m-4" label="Confirm" @click="askUser" />
    <UButton class="m-4" label="Lookup Company" @click="lookupCompany" />
    <USeparator />Test Report
    <UButton class="m-4" label="Open Report" @click="preview('openPDF', params)" />
    <UButton class="m-4" label="Save Report" @click="preview('filePDF', params)" />
</template>

<script lang="ts" setup>
// definePageMeta({ keepalive: true })

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

const { user } = useUserSession()

const lookupCompany = async () => {
    const code = await confirm({
        lookupName: "Company",
        lookupCode: user.value.comCode,
    })
    if (code) alert("Lookup = " + code)
}

const preview = useKxReport()

import type { ReportParameter } from "~~/shared/types"
const params: ReportParameter = {
    report: "A00",
    option: "3",
}
</script>
