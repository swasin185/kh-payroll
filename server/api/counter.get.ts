import { getSessionCount, validateSession } from "../utils/session"
export default eventHandler(async (event) => {
    await validateSession(event)
    return await getSessionCount()
})