export async function api(path, options = {}) {
  console.log('🌐 API: Making request to:', path)
  const res = await fetch(path, { 
    headers: { 'Content-Type': 'application/json' }, 
    ...options 
  })
  console.log('📡 API: Response status:', res.status)
  if (!res.ok) {
    const errorText = await res.text()
    console.error('❌ API: Request failed:', errorText)
    throw new Error(errorText)
  }
  const data = await res.json()
  console.log('✅ API: Response data:', data)
  return data
}
