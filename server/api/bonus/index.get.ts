import { SqlBonus } from "~~/server/database/SqlBonus"

export default authEventHandler(async (event): Promise<any> => {
    const query = getQuery(event)
    return await SqlBonus.list(query.comCode!.toString(), query.empCode as number)
})
