<template>
    Test Waiting bar
    <UButton class="m-4" label="Waiting" @click="isWaiting = true" :disabled="isWaiting == true" />
    <UButton class="m-4" label="Stop" @click="isWaiting = false" :disabled="!isWaiting" />
    <USeparator />
    Test Dialog
    <UButton class="m-4" label="Confirm" @click="askUser" />
    <UButton class="m-4" label="Lookup Company" @click="lookupCompany" />
</template>

<script lang="ts" setup>
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

const lookupCompany = async () => {
    const { user } = useUserSession()
    const code = await confirm({
        lookupName: "Company",
        lookupCode: user.value.comCode,
    })
    if (code) alert("Lookup = " + code)
}
</script>
