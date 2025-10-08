const counter = ref<number>(0)
const { loggedIn, fetch: refreshSession } = useUserSession()
const toast = useToast()
const { activeMenuItem } = usePayrollMenu()
const config = useRuntimeConfig()
const idleLimit = config.public.idleLimit
const scheduleTime = config.public.schedule as number

const setScheduleCount = async () => {
    counter.value = await $fetch("/api/counter", { cache: "no-store" })
    const intervalId = setInterval(async () => {
        try {
            console.log("connect server")
            counter.value = await $fetch("/api/counter", { cache: "no-store" })
            if (loggedIn.value) {
                await refreshSession()
                if (!loggedIn.value && activeMenuItem.value.label! !== "/login") {
                    toast.add({
                        title: `[${new Date()}] Session's Expired`,
                        description: `Idel Time Limited ${idleLimit / 60} minute`,
                        color: "error",
                        duration: 30000,
                    })
                    await navigateTo("/login")
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

export default function useCounter() {
    return {
        counter,
        setScheduleCount,
    }
}
