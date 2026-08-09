// This method returns the stored value for type T and the given key in the local storage.
// This is very useful to share information between different pages. We store the info as a JSON value in local storage
export function getStoredValue<T>(key: string, fallback: T): T {
  try {
    const storedValue = localStorage.getItem(key)
    return storedValue ? (JSON.parse(storedValue) as T) : fallback
  } catch {
    return fallback
  }
}

// Set the stored info with the given key (and type T)
export function setStoredValue<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}