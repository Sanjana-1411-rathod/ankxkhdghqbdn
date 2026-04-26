import { useState, useCallback, useEffect } from 'react'
import Sidebar from './components/Sidebar.jsx'
import HeroBanner from './components/HeroBanner.jsx'
import MetricsRow from './components/MetricsRow.jsx'
import ChatPanel from './components/ChatPanel.jsx'
import QuickActions from './components/QuickActions.jsx'
import './App.css'

const API = '/api'
const BODY_SCANNER_URL = 'https://elegant-semolina-ed569e.netlify.app/'

const MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'gemma2-9b-it',
  'llama3-8b-8192',
]

export default function App() {
  const [status, setStatus] = useState({ processed: false, total_chunks: 0, files_loaded: [] })
  const [chatHistory, setChatHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(null)
  const [topK, setTopK] = useState(5)
  const [model, setModel] = useState(MODELS[0])
  const [groqKey, setGroqKey] = useState(() => localStorage.getItem('ag_groq_key') || '')
  const [error, setError] = useState(null)

  useEffect(() => { fetchStatus() }, [])

  async function fetchStatus() {
    try {
      const r = await fetch(`${API}/status`)
      if (r.ok) setStatus(await r.json())
    } catch {}
  }

  const handleUpload = useCallback(async (files, autoLoad) => {
    if (!files.length && !autoLoad) return
    setUploading(true)
    setUploadProgress('Processing files...')
    setError(null)
    try {
      const fd = new FormData()
      files.forEach(f => fd.append('files', f))
      const r = await fetch(`${API}/upload?auto_load_data=${autoLoad}`, {
        method: 'POST',
        body: fd,
      })
      const text = await r.text()
      let data = {}
      try { data = JSON.parse(text) } catch {}
      if (!r.ok) {
        const detail = data.detail
        const msg = Array.isArray(detail)
          ? detail.map(d => d.msg || JSON.stringify(d)).join(', ')
          : typeof detail === 'object' && detail !== null
            ? JSON.stringify(detail)
            : detail || `Upload failed (${r.status})`
        throw new Error(msg)
      }
      setUploadProgress(`✅ Indexed ${data.total_chunks} chunks!`)
      await fetchStatus()
      setTimeout(() => setUploadProgress(null), 3000)
    } catch (e) {
      setError(e.message)
      setUploadProgress(null)
    } finally {
      setUploading(false)
    }
  }, [])

  const handleReset = useCallback(async () => {
    await fetch(`${API}/reset`, { method: 'DELETE' })
    setChatHistory([])
    await fetchStatus()
  }, [])

  const sendMessage = useCallback(async (question) => {
    if (!question.trim()) return
    if (!status.processed) {
      setError('Please upload and process data files first!')
      return
    }
    const userMsg = { role: 'user', content: question }
    setChatHistory(prev => [...prev, userMsg])
    setLoading(true)
    setError(null)
    try {
      const r = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, top_k: topK, model, groq_api_key: groqKey || undefined }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.detail || 'Chat failed')
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: data.answer,
        meta: { elapsed: data.elapsed, model: data.model, chunks: data.chunks_used },
      }])
    } catch (e) {
      setError(e.message)
      setChatHistory(prev => prev.filter(m => m !== userMsg))
    } finally {
      setLoading(false)
    }
  }, [status.processed, topK, model, groqKey])

  const clearChat = () => setChatHistory([])

  return (
    <div className="app-layout">
      <Sidebar
        status={status}
        uploading={uploading}
        uploadProgress={uploadProgress}
        topK={topK} setTopK={setTopK}
        model={model} setModel={setModel}
        models={MODELS}
        groqKey={groqKey}
        setGroqKey={(k) => { setGroqKey(k); localStorage.setItem('ag_groq_key', k) }}
        onUpload={handleUpload}
        onReset={handleReset}
        onClearChat={clearChat}
        bodyScannerUrl={BODY_SCANNER_URL}
        error={error}
      />
      <main className="app-main">
        <HeroBanner />
        <MetricsRow
          processed={status.processed}
          totalChunks={status.total_chunks}
          questionsAsked={chatHistory.filter(m => m.role === 'user').length}
          model={model}
        />
        <div className="content-grid">
          <ChatPanel chatHistory={chatHistory} loading={loading} onSend={sendMessage} processed={status.processed} />
          <QuickActions processed={status.processed} onQuestion={sendMessage} bodyScannerUrl={BODY_SCANNER_URL} />
        </div>
      </main>
    </div>
  )
}
