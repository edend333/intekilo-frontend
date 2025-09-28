import bcrypt from 'bcrypt'
import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const hashPasswords = async () => {
    try {
        console.log('🔄 מתחבר ל-MongoDB Atlas...')
        
        // התחברות ל-MongoDB
        const client = new MongoClient(process.env.MONGO_URL)
        await client.connect()
        const db = client.db(process.env.DB_NAME)
        const usersCollection = db.collection('users')

        console.log('✅ התחברתי ל-MongoDB בהצלחה!')

        // קבלת כל המשתמשים
        const users = await usersCollection.find({}).toArray()
        
        console.log(`📊 מצאתי ${users.length} משתמשים`)

        // הצפנת כל סיסמה
        for (const user of users) {
            // בדיקה אם הסיסמה כבר מוצפנת
            if (user.password && user.password.length > 10) {
                console.log(`✅ הסיסמה של ${user.username} כבר מוצפנת`)
                continue
            }

            console.log(`🔐 מצפין את הסיסמה של ${user.username}...`)
            
            const saltRounds = 10
            const hashedPassword = await bcrypt.hash('1234', saltRounds)
            
            await usersCollection.updateOne(
                { _id: user._id },
                { $set: { password: hashedPassword } }
            )
            
            console.log(`✅ הצפנתי את הסיסמה של ${user.username}`)
        }

        console.log('🎉 כל הסיסמאות הוצפנו בהצלחה!')
        await client.close()
        
    } catch (error) {
        console.error('❌ שגיאה בהצפנת הסיסמאות:', error)
    }
}

hashPasswords()
