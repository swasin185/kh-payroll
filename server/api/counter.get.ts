import { getSessionCount } from "../utils/sessionCount"

export default eventHandler(async (event) => {
    return await getSessionCount()
})