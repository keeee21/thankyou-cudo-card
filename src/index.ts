import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { handleSlackCommand } from './usecase/handleSlackCommand'

const app = new Hono()

app.post('/slack', async (c) => {
  const body = await c.req.parseBody() as Record<string, string>

  const result = await handleSlackCommand(body)
  return c.json(result)
})

serve({ fetch: app.fetch, port: 3000 }, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})