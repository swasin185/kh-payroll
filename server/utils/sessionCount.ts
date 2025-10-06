import { H3Event } from "h3"

const serverStorage = useStorage("data")

const config = useRuntimeConfig()
const serverMaxAge = config.session.maxAge || 3600

export async function increaseSessionCount(event: H3Event) {
    await cleanExpireSession()
    const session = await getUserSession(event)
    const loginTime = (await serverStorage.getItem<number>(session.id)) || 0
    if (loginTime == 0) await serverStorage.setItem(session.id, Math.floor(Date.now() / 1000))
}

export async function decreaseSessionCount(event: H3Event) {
    const session = await getUserSession(event)
    await serverStorage.removeItem(session.id)
}

async function cleanExpireSession() {
    const keys = await serverStorage.keys()
    const now = Math.floor(Date.now() / 1000)
    for (const sessId of keys) {
        const loginTime = await serverStorage.getItem<number>(sessId)
        if (loginTime && now - loginTime > serverMaxAge) await serverStorage.removeItem(sessId)
    }
}

export async function getSessionCount() {
    const keys = await serverStorage.keys()
    return keys.length || 0
}
