import { Storage } from '@google-cloud/storage'
import * as dotenv from 'dotenv'

dotenv.config()

const bucketName = process.env.BUCKET_NAME!
const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
})

export async function uploadToStorage(filename: string, buffer: Buffer): Promise<string> {
  const file = storage.bucket(bucketName).file(filename)
  await file.save(buffer, { contentType: 'image/jpeg' })
  return `gs://${bucketName}/${filename}`
}