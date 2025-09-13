export async function api(path, options = {}) {
  const res = await fetch(path, { 
    headers: { 'Content-Type': 'application/json' }, 
    ...options 
  })
  if (!res.ok) {
    const errorText = await res.text()
    console.error('❌ API: Request failed:', errorText)
    throw new Error(errorText)
  }
  const data = await res.json()
  return data
}
