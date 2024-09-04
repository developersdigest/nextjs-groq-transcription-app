import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import fs from 'fs'
import os from 'os'
import path from 'path'

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: process.env.GROQ_BASE_URL,
})

export async function POST(req: NextRequest) {
  console.log('Transcription request received')

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      console.error('No file provided')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('File received:', file.name)

    // Save the file temporarily
    const tempDir = os.tmpdir()
    const tempFilePath = path.join(tempDir, file.name)
    const bytes = await file.arrayBuffer()
    fs.writeFileSync(tempFilePath, Buffer.from(bytes))

    console.log('Temporary file saved:', tempFilePath)

    // Transcribe the audio
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: 'whisper-large-v3',
    })

    console.log('Transcription completed')

    // Clean up the temporary file
    fs.unlinkSync(tempFilePath)
    console.log('Temporary file deleted')

    return NextResponse.json(transcription)
  } catch (error) {
    console.error('Error during transcription:', error)
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
  }
}