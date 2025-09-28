import mongoose from 'mongoose'

const storySchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  byUserId: {
    type: String,
    required: true,
    ref: 'User'
  },
  txt: {
    type: String,
    default: ''
  },
  mediaUrl: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['image', 'video'],
    default: 'image'
  },
  loc: {
    lat: Number,
    lng: Number,
    name: String
  },
  createdAt: {
    type: Number,
    default: Date.now
  },
  expiresAt: {
    type: Number,
    required: true
  },
  likesCount: {
    type: Number,
    default: 0
  },
  viewersCount: {
    type: Number,
    default: 0
  },
  viewersPreview: [{
    type: String,
    ref: 'User'
  }],
  tags: [String]
}, {
  timestamps: false
})

// Index for better performance
storySchema.index({ byUserId: 1, createdAt: -1 })
storySchema.index({ expiresAt: 1 })

export const Story = mongoose.model('Story', storySchema)
