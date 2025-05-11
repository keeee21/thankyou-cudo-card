import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { BigQuery } from '@google-cloud/bigquery'
import { Storage } from '@google-cloud/storage'
import * as dotenv from 'dotenv'

dotenv.config()

const app = new Hono()

// 環境変数の取得
const {
  GOOGLE_APPLICATION_CREDENTIALS,
  BUCKET_NAME,
  BQ_DATASET_ID,
  BQ_TABLE_ID,
} = process.env

if (!GOOGLE_APPLICATION_CREDENTIALS || !BUCKET_NAME || !BQ_DATASET_ID || !BQ_TABLE_ID) {
  console.error('環境変数が不足しています。')
  process.exit(1)
}

// GCP クライアント
const bigquery = new BigQuery({
  keyFilename: GOOGLE_APPLICATION_CREDENTIALS,
})
const storage = new Storage({
  keyFilename: GOOGLE_APPLICATION_CREDENTIALS,
})

app.get('/', (c) => {
  return c.text('Hello Hono with Env!')
})

// BigQuery へデータ追加
app.post('/log', async (c) => {
  const body = await c.req.json()

  const datasetId = body.datasetId || BQ_DATASET_ID
  const tableId = body.tableId || BQ_TABLE_ID
  const logData = body.logData

  if (!datasetId || !tableId || !logData) {
    return c.json({ status: 'error', message: 'datasetId, tableId, logData は必須です' }, 400)
  }

  try {
    const [insertErrors] = await bigquery
      .dataset(datasetId)
      .table(tableId)
      .insert([logData])

    if (insertErrors && insertErrors.length > 0) {
      console.error('BigQuery insert errors:', JSON.stringify(insertErrors, null, 2))
      return c.json({ status: 'partial-failure', insertErrors }, 500)
    }

    return c.json({ status: 'success', message: 'BigQueryに挿入完了' })
  } catch (err) {
    console.error('BigQuery insert exception:', JSON.stringify(err, null, 2))
    return c.json({ status: 'error', message: '挿入時にエラーが発生しました' }, 500)
  }
})

// Cloud Storage へファイル保存
app.post('/upload', async (c) => {
  const { filename, content } = await c.req.json()
  const file = storage.bucket(BUCKET_NAME!).file(filename)
  await file.save(content)
  return c.json({ status: 'success', message: 'Storageにアップロード完了' })
})

serve({ fetch: app.fetch, port: 3000 }, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})