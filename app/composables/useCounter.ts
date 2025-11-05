export default function useCounter() {
    const counter = ref<number>(0)
    const setScheduleCount = async () => {
        const { loggedIn, fetch: refreshSession } = useUserSession()
        const { activeMenu, loginUrl } = usePayrollMenu()
        const config = useRuntimeConfig()
        const idleLimit = config.public.idleLimit
        const scheduleTime = config.public.schedule as number

        counter.value = await $fetch("/api/lobby/counter", { cache: "no-store" })
        const intervalId = setInterval(async () => {
            try {
                counter.value = await $fetch("/api/lobby/counter", { cache: "no-store" })
                if (loggedIn.value) {
                    await refreshSession()
                    if (!loggedIn.value && activeMenu.value.label! !== loginUrl) {
                        useToast().add({
                            title: `[${new Date()}] Session's Expired`,
                            description: `Idel Time Limited ${idleLimit / 60} minute`,
                            color: "error",
                            duration: 10_000,
                        })
                        await navigateTo(loginUrl)
                    }
                }
            } catch {
                clearInterval(intervalId)
                showError({
                    statusCode: 666,
                    message: "Server Disconnected !",
                })
            }
        }, scheduleTime * 1000)
        console.log("Counter Schedule", scheduleTime, "s")
    }
    return {
        counter,
        setScheduleCount,
    }
}
