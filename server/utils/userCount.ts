import { useStorage } from '#imports'

const USER_COUNT_KEY = 'global:activeUsers'

// Access the default server storage (which uses the 'memory' driver by default)
const serverStorage = useStorage('data')

/**
 * Increments the active user count in server memory.
 */
export async function increaseActiveUsers() {
  let currentCount = await serverStorage.getItem<number>(USER_COUNT_KEY) || 0
  currentCount++
  serverStorage.setItem(USER_COUNT_KEY, currentCount)
  console.log(`User logged in. Count: ${currentCount}`)
  return currentCount
}

/**
 * Decrements the active user count in server memory.
 */
export async function decreaseActiveUsers() {
  let currentCount = await serverStorage.getItem<number>(USER_COUNT_KEY) || 0
  
  // Ensure the count never goes below zero
  if (currentCount > 0) {
    currentCount--
  }

  serverStorage.setItem(USER_COUNT_KEY, currentCount)
  console.log(`User logged out. Count: ${currentCount}`)
  return currentCount
}

/**
 * Retrieves the current count.
 */
export async function getActiveUsers() {
  return await serverStorage.getItem<number>(USER_COUNT_KEY) || 0
}