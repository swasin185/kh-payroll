import { SqlSalary } from "~~/server/database/SqlSalary"

export default authEventHandler(async (event): Promise<any> => {
    const query = getQuery(event)
    return await SqlSalary.list(query.comCode!.toString(), query.empCode as number)
})
