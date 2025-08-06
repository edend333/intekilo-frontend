import { storageService } from '../async-storage.service.js'

const gUsers = [
  {
    _id: 'u101',
    username: 'alice_bloom',
    password: 'alice123',
    fullname: 'Alice Bloom',
    imgUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
    following: [
      { _id: 'u102', fullname: 'Tom Wayne', imgUrl: 'https://randomuser.me/api/portraits/men/45.jpg' }
    ],
    followers: [
      { _id: 'u103', fullname: 'Rita Moss', imgUrl: 'https://randomuser.me/api/portraits/women/55.jpg' }
    ],
    likedStoryIds: ['s201', 's202'],
    savedStoryIds: ['s203', 's204'],
  },
  {
    _id: 'u102',
    username: 'john_mav',
    password: 'maverick99',
    fullname: 'John Maverick',
    imgUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    following: [
      { _id: 'u101', fullname: 'Alice Bloom', imgUrl: 'https://randomuser.me/api/portraits/women/68.jpg' }
    ],
    followers: [
      { _id: 'u104', fullname: 'Sara Blue', imgUrl: 'https://randomuser.me/api/portraits/women/12.jpg' }
    ],
    likedStoryIds: ['s208', 's209'],
    savedStoryIds: ['s210'],
  }
]

storageService.saveMany('user', gUsers)