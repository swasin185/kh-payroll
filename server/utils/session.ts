import { H3Event } from "h3"

const serverStorage = useStorage("sessions")
const config = useRuntimeConfig()
const idleLimit = config.public.idleLimit as number
console.log("idle", idleLimit)
const nowSecond = (): number => Math.trunc(Date.now() / 1000)

export async function addOrRenewSession(sessId: string) {
    await serverStorage.setItem(sessId, nowSecond(), { ttl: idleLimit })
}

export async function removeSession(sessId: string) {
    await serverStorage.removeItem(sessId)
}

export async function getSessionCount(): Promise<number> {
    const keys = (await serverStorage.keys()) || 0
    return keys.length
}

export async function validateSession(event: H3Event) : Promise<any> {
    const session = await getUserSession(event)
    if (session?.user) {
        const sessTime = await serverStorage.getItem<number>(session?.id)
        if (!sessTime) {
            await clearUserSession(event)
            session.user = undefined
            if (sessTime) await removeSession(session!.id)
        }
    }
    return session
}
