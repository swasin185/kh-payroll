import SqlEmployeePhoto from "~~/server/database/SqlEmployeePhoto"
import SqlEmployee from "~~/server/database/SqlEmployee"

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

    // Generate a small circular WebP thumbnail (64x64) to keep on the employee row for fast listing
    const THUMB_SIZE = 64
    let thumbBuffer: Buffer | null = null
    try {
        // dynamic import to avoid hard dependency during dev if sharp is not installed
        // @ts-ignore - sharp is an optional dependency in some environments
        const sharpModule: any = (await import("sharp")).default ?? (await import("sharp"))
        const size = THUMB_SIZE
        const circleSvg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg"><circle cx="${
            size / 2
        }" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`

        thumbBuffer = await sharpModule(photoBuffer)
            .rotate()
            .resize({ width: size, height: size, fit: "cover" })
            .composite([{ input: Buffer.from(circleSvg), blend: "dest-in" }])
            .webp({ quality: 80 })
            .toBuffer()
    } catch (err: any) {
        // If thumbnail generation fails (or sharp not available), proceed with saving the full image anyway
        console.error("Thumbnail generation failed:", err)
        thumbBuffer = null
    }

    const success = await SqlEmployeePhoto.upsertPhoto(comCode, empCode, photoBuffer, mimeType)
    if (!success) return { success: false }

    // Try to save thumbnail into employee table; don't fail the whole upload if this step fails
    let thumbSuccess = true
    try {
        if (thumbBuffer) {
            thumbSuccess = await SqlEmployee.updatePhotoThumb(comCode, empCode, thumbBuffer)
        }
    } catch (err: any) {
        console.error("Failed to update employee thumbnail:", err)
        thumbSuccess = false
    }

    return { success: success && thumbSuccess }
})
