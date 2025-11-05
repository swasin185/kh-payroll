import { getSessionCount, validateSession } from "../../utils/sessions"

export default eventHandler(async (event) => {
    await validateSession(event)
    return await getSessionCount()
})