import { authEventHandler } from "~~/server/utils/authEventHandler"
import { sqlCompany } from "~~/server/database/sqlCompany"

export default authEventHandler(async (event) => {
    return await sqlCompany.selectAll()
})
