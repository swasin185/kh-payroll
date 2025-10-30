import { sqlCompany } from "~~/server/database/sqlCompany"
import { authEventHandler } from "~~/server/utils/authEventHandler"

export default authEventHandler(async (event) => {
    return await sqlCompany.selectAll()
})
