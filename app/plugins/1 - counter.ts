export default defineNuxtPlugin(async (nuxtApp) => {
    const fetchCounter = async () => {
        return await $fetch("/api/counter", { cache: "no-store" })
    }
    const delayTime = 10;
    const counter = useState("counter", () => 0)
    counter.value = await fetchCounter()
    const intervalId = setInterval(async () => {
        try {
            counter.value = await fetchCounter()
        } catch {
            clearInterval(intervalId)
            showError({
                statusCode: 666,
                message: "Server Disconnected !"
            })
        }
    }, 1000 * delayTime)

    console.log("Counter Refresh", delayTime , "s")
})
