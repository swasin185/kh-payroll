import DateStr from "~~/shared/DateStr"

export default defineNuxtPlugin(async () => {
    const txt = "Initialized"
    console.time(txt)
    DateStr.init(await $fetch("/api/lobby/today"))
    console.timeEnd(txt)
})
