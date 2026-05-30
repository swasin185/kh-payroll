import SqlEmployeePhoto from "~~/server/database/SqlEmployeePhoto"

export default authEventHandler(async (event) => {
    const formData = await readMultipartFormData(event)
    if (!formData) {
        throw createError({ statusCode: 400, statusMessage: "No data uploaded" })
    }

    let comCode = ""
    let empCode = 0
    let photoBuffer: Buffer | null = null
    let mimeType = "image/jpeg"

    for (const field of formData) {
        if (field.name === "comCode") {
            comCode = field.data.toString()
        } else if (field.name === "empCode") {
            empCode = Number.parseInt(field.data.toString())
        } else if (field.name === "photo") {
            photoBuffer = field.data
            mimeType = field.type || "image/jpeg"
        }
    }

    if (!comCode || isNaN(empCode) || !photoBuffer) {
        throw createError({ statusCode: 400, statusMessage: "Missing required fields" })
    }

    // Strict validation: file size must be less than 1MB (1,048,576 bytes)
    if (photoBuffer.length >= 1024 * 1024) {
        throw createError({ statusCode: 400, statusMessage: "File size must be less than 1MB" })
    }

    const success = await SqlEmployeePhoto.upsertPhoto(comCode, empCode, photoBuffer, mimeType)
    return { success }
})
