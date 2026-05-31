import SqlEmployeePhoto from "~~/server/database/SqlEmployeePhoto"
import SqlEmployee from "~~/server/database/SqlEmployee"

export default authEventHandler(async (event) => {
    const query = getQuery(event)
    const comCode = query.comCode?.toString()
    const empCode = Number.parseInt(query.empCode?.toString() ?? "0")

    if (!comCode || isNaN(empCode)) {
        throw createError({ statusCode: 400, statusMessage: "Invalid Parameters" })
    }

    const success = await SqlEmployeePhoto.deletePhoto(comCode, empCode)

    // Clear thumbnail column on employee row; don't fail the request if this step errors
    try {
        await SqlEmployee.updatePhotoThumb(comCode, empCode, null)
    } catch (err: any) {
        console.error("Failed to clear employee thumbnail:", err)
    }

    return { success }
})
