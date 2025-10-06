const BASE_URL = 'http://localhost:3030/api'

// Global 401 handler
let global401Handler = null

export const httpService = {
    get(endpoint, data) {
        return ajax(endpoint, 'GET', data)
    },
    post(endpoint, data) {
        return ajax(endpoint, 'POST', data)
    },
    put(endpoint, data) {
        return ajax(endpoint, 'PUT', data)
    },
    patch(endpoint, data) {
        return ajax(endpoint, 'PATCH', data)
    },
    delete(endpoint, data) {
        return ajax(endpoint, 'DELETE', data)
    },
    setGlobal401Handler(handler) {
        global401Handler = handler
    }
}

async function ajax(endpoint, method = 'GET', data = null) {
    try {
        const url = `${BASE_URL}/${endpoint}`
        
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Include HttpOnly cookies
        }

        // No Authorization header needed - cookies handle authentication

        if (data) {
            options.body = JSON.stringify(data)
        }

        const response = await fetch(url, options)
        
        // Handle 401 Unauthorized globally
        if (response.status === 401) {
            const errorData = await response.json().catch(() => ({}))
            
            // Call global 401 handler if set
            if (global401Handler && errorData.err === 'auth-required') {
                global401Handler()
            }
            
            throw new Error(errorData.err || `HTTP ${response.status}: ${response.statusText}`)
        }
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.err || `HTTP ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()
        return result
    } catch (error) {
        throw error
    }
}