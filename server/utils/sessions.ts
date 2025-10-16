import { H3Event } from "h3"

const storage = useStorage("sessions")
const config = useRuntimeConfig()
const idleLimit = config.public.idleLimit as number
const nowSecond = (): number => Math.trunc(Date.now() / 1000)
type SessItem = { userId: string; time: number }

export async function renewSession(sessId: string, userId: string) {
    await storage.setItem<SessItem>(
        sessId,
        { userId: userId, time: nowSecond() + idleLimit },
        { ttl: idleLimit },
    )
}

export async function removeSession(sessId: string) {
    await storage.removeItem(sessId)
}

export async function getSessionCount(): Promise<number> {
    const keys = await storage.keys()
    return keys?.length ?? 0
}

export async function validateSession(event: H3Event): Promise<any> {
    const session = await getUserSession(event)
    if (session?.user) {
        const xuser = await storage.getItem<SessItem>(session.id)
        if (!xuser || xuser.time <= nowSecond()) {
            await clearUserSession(event) // removeSessItem cascade from clear hook
            session.user = undefined
        }
    }
    return session
}

export async function sessionCountByUser() {
    const userSessionCounts: Record<string, number> = {}
    const allSessionKeys: string[] = await storage.getKeys()
    for (const sessId of allSessionKeys)
        try {
            const sess = await storage.getItem<SessItem>(sessId)
            if (sess && sess.userId)
                userSessionCounts[sess.userId] = (userSessionCounts[sess.userId] || 0) + 1
            else console.warn(`Session ID ${sessId} found but data is missing or corrupted.`)
        } catch (error) {
            console.error(`Error processing session key ${sessId}:`, error)
        }
    Object.entries(userSessionCounts).map(([userId, count]) => ({ userId, count }))
}