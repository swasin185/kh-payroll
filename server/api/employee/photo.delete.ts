import SqlEmployeePhoto from "~~/server/database/SqlEmployeePhoto"

export default authEventHandler(async (event) => {
    const query = getQuery(event)
    const comCode = query.comCode?.toString()
    const empCode = Number.parseInt(query.empCode?.toString() ?? "0")

    if (!comCode || isNaN(empCode)) {
        throw createError({ statusCode: 400, statusMessage: "Invalid Parameters" })
    }

    const success = await SqlEmployeePhoto.deletePhoto(comCode, empCode)
    return { success }
})
