'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Download } from "lucide-react"

export function AudioTranscription() {
  const [file, setFile] = useState<File | null>(null)
  const [transcription, setTranscription] = useState<string>('')
  const [isTranscribing, setIsTranscribing] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && selectedFile.type.startsWith('audio/')) {
      setFile(selectedFile)
    } else {
      alert('Please select a valid audio file')
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!file) return

    setIsTranscribing(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Transcription failed')
      }

      const result = await response.json()
      setTranscription(result.text)
    } catch (error) {
      console.error('Error during transcription:', error)
      alert('An error occurred during transcription. Please try again.')
    } finally {
      setIsTranscribing(false)
    }
  }

  const handleDownload = () => {
    const element = document.createElement("a")
    const file = new Blob([transcription], {type: 'text/plain'})
    element.href = URL.createObjectURL(file)
    element.download = "transcription.txt"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Audio Transcription
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="audio-file" className="block text-sm font-medium leading-6 text-gray-900">
                Upload Audio File
              </Label>
              <Input
                id="audio-file"
                name="audio-file"
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                required
                className="mt-2"
              />
            </div>
            <div>
              <Button type="submit" className="flex w-full justify-center" disabled={!file || isTranscribing}>
                {isTranscribing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Transcribing...
                  </>
                ) : (
                  'Transcribe'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-8 bg-white">
        <div className="sm:mx-auto sm:w-full sm:max-w-lg">
          <h3 className="text-lg font-semibold mb-4">Transcription</h3>
          {transcription ? (
            <>
              <div className="bg-gray-100 p-4 rounded-md min-h-[200px] mb-4">
                {transcription}
              </div>
              <Button onClick={handleDownload} className="flex items-center">
                <Download className="mr-2 h-4 w-4" />
                Download Transcription
              </Button>
            </>
          ) : (
            <p className="text-gray-500">Transcription will appear here once processed.</p>
          )}
        </div>
      </div>
    </div>
  )
}