import { generateImage } from '../services/generateImage'
import { uploadToStorage } from '../services/uploadToStorage'
import { logToBigQuery } from '../services/logToBigQuery'
import { randomUUID } from 'crypto'

export async function handleSlackCommand(cmd: Record<string, string>) {
  const {
    workspace_id,
    workspace_name,
    channel_id,
    channel_name,
    sender_user_id,
    sender_user_name,
    message_text,
    receiver_user_id,
    receiver_user_name,
  } = cmd

  // 1. 画像を生成
  const imageBuffer = await generateImage(message_text, receiver_user_name)

  // 2. GCSにアップロード
  const filename = `${Date.now()}_${receiver_user_id}.jpeg`
  const gcsPath = await uploadToStorage(filename, imageBuffer)

  // 3. BigQueryにログ保存
  await logToBigQuery({
    id: randomUUID(),
    created_at: new Date().toISOString(),
    workspace_id,
    workspace_name: workspace_name ?? '',
    channel_id,
    channel_name,
    sender_user_id,
    sender_user_name,
    receiver_user_id,
    receiver_user_name,
    message_text,
    image_gcs_path: gcsPath,
    image_slack_file_id: 'hoge',
    image_slack_url: 'fuga',
    app_version: '1.0.0',
  })

  return { status: 'ok', image_url: gcsPath }
}