import SqlEmployeePhoto from "~~/server/database/SqlEmployeePhoto"

export default authEventHandler(async (event) => {
    const query = getQuery(event)
    const comCode = query.comCode?.toString()
    const empCode = Number.parseInt(query.empCode?.toString() ?? "0")

    if (!comCode || isNaN(empCode)) {
        throw createError({ statusCode: 400, statusMessage: "Invalid Parameters" })
    }

    // Check if the client requested only the metadata (JSON)
    if (query.metadata === "1" || query.metadata === "true") {
        const metadata = await SqlEmployeePhoto.getPhotoMetadata(comCode, empCode)
        if (!metadata) {
            return { hasPhoto: false }
        }
        return {
            hasPhoto: true,
            mimeType: metadata.mimeType,
            uploadedAt: metadata.uploadedAt
        }
    }

    // Otherwise, return the raw binary photo data
    const photo = await SqlEmployeePhoto.selectPhoto(comCode, empCode)
    if (!photo) {
        throw createError({ statusCode: 404, statusMessage: "Photo not found" })
    }

    setHeader(event, "Content-Type", photo.mimeType)
    // Add caching header so we don't fetch heavy photos repeatedly if they haven't changed
    setHeader(event, "Cache-Control", "private, max-age=3600")
    return photo.photoData
})
