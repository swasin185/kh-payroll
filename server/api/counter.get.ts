import { getActiveUsers } from "../utils/userCount"

export default eventHandler(async () => {
    return await getActiveUsers()
})