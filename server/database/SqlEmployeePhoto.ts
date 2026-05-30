import { getDB } from "./pool"
import { RowDataPacket, ResultSetHeader } from "mysql2/promise"

const db = getDB()

export default {
    // Select binary data for a specific employee's photo
    async selectPhoto(
        comCode: string,
        empCode: number,
    ): Promise<{ photoData: Buffer; mimeType: string } | null> {
        const [result] = await db.query<RowDataPacket[]>(
            `SELECT photoData, mimeType FROM employee_photo WHERE comCode = ? AND empCode = ?`,
            [comCode, empCode],
        )
        if (result.length !== 1) return null
        return {
            photoData: result[0]!.photoData as Buffer,
            mimeType: result[0]!.mimeType as string,
        }
    },

    // Check if photo exists and get its metadata (without retrieving the heavy blob data)
    async getPhotoMetadata(
        comCode: string,
        empCode: number,
    ): Promise<{ mimeType: string; uploadedAt: string } | null> {
        const [result] = await db.query<RowDataPacket[]>(
            `SELECT mimeType, uploadedAt FROM employee_photo WHERE comCode = ? AND empCode = ?`,
            [comCode, empCode],
        )
        if (result.length !== 1) return null
        return {
            mimeType: result[0]!.mimeType as string,
            uploadedAt: result[0]!.uploadedAt as string,
        }
    },

    // Upsert photo (Insert or Update if already exists)
    async upsertPhoto(
        comCode: string,
        empCode: number,
        photoData: Buffer,
        mimeType: string,
    ): Promise<boolean> {
        const [result] = await db.execute<ResultSetHeader>(
            `INSERT INTO employee_photo (comCode, empCode, photoData, mimeType)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE photoData = VALUES(photoData), mimeType = VALUES(mimeType)`,
            [comCode, empCode, photoData, mimeType],
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
