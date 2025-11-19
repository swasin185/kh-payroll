import { authEventHandler } from "~~/server/utils/authEventHandler"
import { type LookupItem } from "~~/shared/types"
import SqlUsers from "~~/server/database/SqlUsers"
import SqlCompany from "~~/server/database/SqlCompany"
import SqlIncomeType from "~~/server/database/SqlIncomeType"
import SqlEmployee from "~~/server/database/SqlEmployee"
import SqlHoliday from "../database/SqlHoliday"
import SqlTimeType from "../database/SqlTimeType"

export default authEventHandler(async (event): Promise<LookupItem[]> => {
    const query = getQuery(event)
    const name = query.name!.toString()
    if (!name) throw createError({ statusCode: 400, statusMessage: "Missing Lookup Name" })
    let result: LookupItem[] = []
    if (name === "company") result = await SqlCompany.lookup()
    else if (name === "user") result = await SqlUsers.lookup()
    else if (name === "role") result = await SqlUsers.lookup()
    else if (name === "incometype") result = await SqlIncomeType.lookup()
    else if (name === "timetype") result = await SqlTimeType.lookup()
    else if (name === "employee") {
        const sess = await getUserSession(event)
        result = await SqlEmployee.lookup((sess.user! as any).comCode!.toString())
    } else if (name === "holiday") {
        const sess = await getUserSession(event)
        result = await SqlHoliday.lookup((sess.user! as any).comCode!.toString())
    }
    return result
})
