import { H3Event } from "h3"

const serverStorage = useStorage("sessions")
const config = useRuntimeConfig()
const maxAge = config.session.maxAge
const idleLimit = config.public.idleLimit
const scheduleTime = config.public.schedule as number

export function scheduleCleanSession() {
    const refreshRate = scheduleTime * 1000
    console.log(`MaxAge:${maxAge}s IdleLimit:${idleLimit}s Every:${refreshRate / 1000}s`)
    setTimeout(() => setInterval(cleanExpireSessions, refreshRate), idleLimit * 1000 - refreshRate)
}

const nowSecond = (): number => (Date.now() / 1000) | 0

async function cleanExpireSessions() {
    const now = nowSecond()
    for (const sessId of await serverStorage.keys()) {
        const sessTime = await serverStorage.getItem<number>(sessId)
        if (sessTime && now - sessTime >= idleLimit) {
            console.log("schedule clear session", sessId)
            await serverStorage.removeItem(sessId)
        }
    }
}

export async function addOrRenewSession(sessId: string) {
    await serverStorage.setItem(sessId, nowSecond())
}

export async function removeSession(sessId: string) {
    await serverStorage.removeItem(sessId)
}

export async function getSessionCount(): Promise<number> {
    const keys = (await serverStorage.keys()) || 0
    return keys.length
}

export async function validateSession(event: H3Event) {
    const session = await getUserSession(event)
    if (session?.user) {
        const sessTime = await serverStorage.getItem<number>(session?.id)
        if (!sessTime || nowSecond() - sessTime >= idleLimit) {
            console.log("Session Expired", sessTime, (session?.user as any)?.name)
            await clearUserSession(event)
            if (sessTime) await removeSession(session!.id)
        }
    }
}