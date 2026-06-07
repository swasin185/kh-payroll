import SqlEmployee from "~~/server/database/SqlEmployee"
import SqlEmployeePhoto from "~~/server/database/SqlEmployeePhoto"

export default authEventHandler(async (event): Promise<any> => {
    const employees = await SqlEmployee.listActive()

    // Check which employees have photos
    for (const emp of employees) {
        try {
            const metadata = await SqlEmployeePhoto.getPhotoMetadata(emp.comCode, emp.empCode)
            ;(emp as any).hasPhoto = !!metadata
        } catch {
            ;(emp as any).hasPhoto = false
        }
    }

    return employees
})
