export const httpService = {
    get(endpoint, data) {
        console.log('MOCK GET:', endpoint, data)
        return Promise.resolve(_mockData(endpoint))
    },
    post(endpoint, data) {
        console.log('MOCK POST:', endpoint, data)
        return Promise.resolve(data)
    },
    put(endpoint, data) {
        console.log('MOCK PUT:', endpoint, data)
        return Promise.resolve(data)
    },
    delete(endpoint, data) {
        console.log('MOCK DELETE:', endpoint, data)
        return Promise.resolve()
    }
}

function _mockData(endpoint) {
  if (endpoint === 'user') {
    return [
      {
        _id: 'u101',
        username: 'eden',
        fullname: 'Eden Dev',
      },
      {
        _id: 'u102',
        username: 'bat',
        fullname: 'Bat Sheva',
      }
    ]
  }

  if (endpoint === 'review') {
    return [
      { _id: 'r1', txt: 'Great!', byUser: { username: 'eden' } },
      { _id: 'r2', txt: 'Nice app', byUser: { username: 'bat' } }
    ]
  }

  if (endpoint === 'car') {
    return [
      { _id: 'c1', model: 'Tesla', price: 100 },
      { _id: 'c2', model: 'Mazda', price: 70 }
    ]
  }

  return [] 
}
