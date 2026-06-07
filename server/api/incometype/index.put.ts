import SqlIncomeType from "~~/server/database/SqlIncomeType"

export default authEventHandler(async (event): Promise<any> => {
    const body = await readBody(event)
    return await SqlIncomeType.update(body)
})