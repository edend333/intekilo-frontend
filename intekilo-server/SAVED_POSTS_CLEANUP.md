# Saved Posts Data Cleanup

## Problem
The `savedPostIds` array contains mixed ID formats:
- Valid ObjectIds: `"68d7c19c113b369b4144a803"`
- Invalid short strings: `"SO0cS3"`

This causes 400 Bad Request when trying to query posts with `$in` operator.

## Solution Applied

### 1. **Server-Side Validation**
- Filter only valid ObjectId strings (24 hex characters)
- Ignore invalid IDs and log them for cleanup
- Return empty array if no valid IDs found

### 2. **Automatic Cleanup**
- Remove invalid IDs from user's `savedPostIds` array
- Keep only valid ObjectIds that exist in posts collection
- Update user record with cleaned array

### 3. **Input Validation**
- `addSavedPost` and `removeSavedPost` now validate postId format
- Only accept valid ObjectId strings
- Throw clear error for invalid formats

## Code Changes

### **getSavedPosts Function**
```javascript
// Filter and convert only valid ObjectIds
const validObjectIds = savedPostIds
    .filter(id => {
        const isValid = typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)
        if (!isValid) {
            console.log('⚠️ Invalid savedPostId found:', id, 'type:', typeof id)
        }
        return isValid
    })
    .map(id => new ObjectId(id))
```

### **Automatic Cleanup**
```javascript
// Clean up invalid post IDs (both non-existent posts and invalid ObjectIds)
const invalidPostIds = savedPostIds.filter(id => {
    const isValidFormat = typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)
    if (!isValidFormat) {
        return true // Remove invalid format IDs
    }
    return !validPostIds.includes(id) // Remove non-existent posts
})
```

### **Input Validation**
```javascript
// Validate postId format
if (!postId || typeof postId !== 'string' || !/^[0-9a-fA-F]{24}$/.test(postId)) {
    throw new Error('Invalid postId format')
}
```

## Manual Cleanup (Optional)

If you want to clean up existing data manually:

### **MongoDB Query to Find Users with Invalid IDs**
```javascript
db.users.find({
  savedPostIds: {
    $exists: true,
    $not: {
      $all: [
        { $regex: /^[0-9a-fA-F]{24}$/ }
      ]
    }
  }
})
```

### **MongoDB Query to Clean Invalid IDs**
```javascript
db.users.updateMany(
  { savedPostIds: { $exists: true } },
  {
    $set: {
      savedPostIds: {
        $filter: {
          input: "$savedPostIds",
          cond: { $regexMatch: { input: "$$this", regex: /^[0-9a-fA-F]{24}$/ } }
        }
      }
    }
  }
)
```

## Expected Behavior After Fix

### ✅ **API Response**
- `GET /api/users/me/saved-posts` returns 200 OK
- Returns empty array `[]` if no valid saved posts
- Returns actual posts if valid IDs exist

### ✅ **Automatic Cleanup**
- Invalid IDs are logged and removed
- User's `savedPostIds` array is updated
- No more 400 errors

### ✅ **Input Validation**
- Only valid ObjectId strings accepted
- Clear error messages for invalid input
- Consistent data format

## Testing

1. **Test with mixed IDs**: User with both valid and invalid IDs
2. **Test with only invalid IDs**: Should return empty array
3. **Test with valid IDs**: Should return actual posts
4. **Test add/remove**: Only valid ObjectIds accepted

## Logs to Monitor

Look for these log messages:
- `⚠️ Invalid savedPostId found: [id] type: [type]`
- `🧹 Cleaning up invalid post IDs: [array]`
- `📝 No valid saved post IDs found, returning empty array`

The fix is backward compatible and will automatically clean up existing data.
