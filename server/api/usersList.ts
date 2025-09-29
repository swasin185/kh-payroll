import { Users } from "~~/server/database/Users"
import { authEventHandler } from "~~/server/utils/authEventHandler"

export default authEventHandler(async (event) => {
    try {
        const allUsers = Users.selectAll()
        setResponseStatus(event, 200)
        return allUsers
    } catch (error) {
        console.error('Database query error in users.get.ts:', error)
        setResponseStatus(event, 500)
        return {
            error: 'An internal server error occurred while fetching users.',
            details: (error as Error).message
        }
    }
})