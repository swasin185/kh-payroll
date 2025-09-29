import { Company } from "~~/server/database/Company"
import { authEventHandler } from "~~/server/utils/authEventHandler"

export default authEventHandler(async (event) => {
    return await Company.selectAll()
})
