import { BigQuery } from '@google-cloud/bigquery'

const datasetId = process.env.BQ_DATASET_ID!
const tableId = process.env.BQ_TABLE_ID!
const bigquery = new BigQuery({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
})

export async function logToBigQuery(row: any) {
  try {
    const [insertErrors] = await bigquery.dataset(datasetId).table(tableId).insert([row])

    if (Array.isArray(insertErrors) && insertErrors.length > 0) {
      console.error('⚠️ BigQuery Insert Errors:')
      console.error(JSON.stringify(insertErrors, null, 2))
    }
  } catch (err: any) {
    console.error('🔥 BigQuery Insert Exception:')
    console.error(JSON.stringify(err, null, 2))
  }
}