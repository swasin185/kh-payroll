import SqlEmployeePhoto from "~~/server/database/SqlEmployeePhoto"

export default authEventHandler(async (event): Promise<any> => {
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
            uploadedAt: metadata.uploadedAt,
        }
    }

    // If the client requested a small thumbnail, try to serve the denormalized thumbnail
    if (query.thumb === "1" || query.thumb === "true") {
        const thumb = await SqlEmployeePhoto.selectPhotoThumb(comCode, empCode)
        if (!thumb) {
            throw createError({ statusCode: 404, statusMessage: "Thumbnails not found" })
        }
        setHeader(event, "Content-Type", "image/webp")
        setHeader(event, "Cache-Control", "private, max-age=3600")
        return thumb
    }

    // Otherwise, return the raw binary photo data
    const photoData = await SqlEmployeePhoto.selectPhoto(comCode, empCode)
    if (!photoData) {
        throw createError({ statusCode: 404, statusMessage: "Photo not found" })
    }

    setHeader(event, "Content-Type", "image/jpeg")
    // Add caching header so we don't fetch heavy photos repeatedly if they haven't changed
    setHeader(event, "Cache-Control", "private, max-age=3600")
    return photoData
})
