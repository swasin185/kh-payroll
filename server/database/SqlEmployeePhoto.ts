import { getDB } from "./pool"
import { RowDataPacket, ResultSetHeader } from "mysql2/promise"

const db = getDB()

export default {
    // Select binary data for a specific employee's photo
    async selectPhoto(
        comCode: string,
        empCode: number,
    ): Promise<Buffer | null> {
        const [result] = await db.query<RowDataPacket[]>(
            `SELECT photoData FROM employee_photo WHERE comCode = ? AND empCode = ?`,
            [comCode, empCode],
        )
        if (result.length !== 1) return null
        return result[0]!.photoData as Buffer
    },

    // Retrieve thumbnail from employee_photo table
    async selectPhotoThumb(comCode: string, empCode: number): Promise<Buffer | null> {
        const [result] = await db.query<RowDataPacket[]>(
            `SELECT photoThumb FROM employee_photo WHERE comCode = ? AND empCode = ?`,
            [comCode, empCode],
        )
        if (result.length !== 1) return null
        const row = result[0]!
        if (!row.photoThumb) return null
        return row.photoThumb as Buffer
    },

    // Check if photo exists and get its metadata (without retrieving the heavy blob data)
    async getPhotoMetadata(
        comCode: string,
        empCode: number,
    ): Promise<{ uploadedAt: string } | null> {
        const [result] = await db.query<RowDataPacket[]>(
            `SELECT uploadedAt FROM employee_photo WHERE comCode = ? AND empCode = ?`,
            [comCode, empCode],
        )
        if (result.length !== 1) return null
        return {
            uploadedAt: result[0]!.uploadedAt as string,
        }
    },

    // Upsert photo (Insert or Update if already exists)
    async upsertPhoto(
        comCode: string,
        empCode: number,
        photoData: Buffer,
        photoThumb: Buffer | null,
    ): Promise<boolean> {
        const [result] = await db.execute<ResultSetHeader>(
            `INSERT INTO employee_photo (comCode, empCode, photoData, photoThumb)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE photoData = VALUES(photoData), photoThumb = VALUES(photoThumb)`,
            [comCode, empCode, photoData, photoThumb],
        )
        return result.affectedRows >= 1
    },

    // Delete photo
    async deletePhoto(comCode: string, empCode: number): Promise<boolean> {
        const [result] = await db.execute<ResultSetHeader>(
            `DELETE FROM employee_photo WHERE comCode = ? AND empCode = ?`,
            [comCode, empCode],
        )
        return result.affectedRows === 1
    },
}
