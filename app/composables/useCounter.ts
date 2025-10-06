const delaySecond = 60
const sessionCount = ref<number>(0)

const fetchCount = async () => {
    sessionCount.value = await $fetch("/api/counter", { cache: "no-store" })
}
const setScheduleCount = () => {
    fetchCount()
    const intervalId = setInterval(async () => {
        try {
            fetchCount()
        } catch {
            clearInterval(intervalId)
            showError({
                statusCode: 666,
                message: "Server Disconnected !",
            })
        }
    }, 1000 * delaySecond)
    console.log("Counter Schedule", delaySecond, "s")
}

export default () => {
    return {
        counter: sessionCount,
        fetchCount,
        setScheduleCount,
    }
}
