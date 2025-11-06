import SqlIncomeType from "~~/server/database/SqlIncomeType"

export default authEventHandler(async (event) => {
    const body = await readBody(event)
    return await SqlIncomeType.insert(body)
})