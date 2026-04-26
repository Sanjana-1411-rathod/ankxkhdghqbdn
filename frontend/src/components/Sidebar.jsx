import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Settings, Trash2, MessageSquare, RotateCcw, Key, ChevronDown } from 'lucide-react'
import './Sidebar.css'

export default function Sidebar({
  status, uploading, uploadProgress, topK, setTopK, model, setModel, models,
  groqKey, setGroqKey, onUpload, onReset, onClearChat, bodyScannerUrl, error
}) {
  const [files, setFiles] = useState([])
  const [autoLoad, setAutoLoad] = useState(true)
  const [showKey, setShowKey] = useState(false)
  const [keyInput, setKeyInput] = useState(groqKey)

  const onDrop = useCallback(accepted => setFiles(prev => [...prev, ...accepted]), [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
    },
    multiple: true,
  })

  const handleProcess = () => {
    onUpload(files, autoLoad)
    setFiles([])
  }

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-icon">👗</div>
        <div className="brand-name">ANKAN Garments</div>
        <div className="brand-sub">AI Store Intelligence</div>
        <span className="groq-badge">⚡ GROQ POWERED</span>
      </div>

      {/* Body Scanner Button */}
      <a href={bodyScannerUrl} target="_blank" rel="noreferrer" className="scanner-btn">
        🫁 &nbsp;Body Scanner
        <span className="scanner-arrow">↗</span>
      </a>
      <p className="scanner-sub">AI Body Measurement App</p>

      {/* Status */}
      <div className="sidebar-status">
        <span className={`status-dot ${status.processed ? 'ready' : 'waiting'}`} />
        <span>{status.processed ? `Ready · ${status.total_chunks.toLocaleString()} chunks` : 'Awaiting data'}</span>
      </div>

      <div className="sidebar-section-label">📁 Data Upload</div>

      {/* Dropzone */}
      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'drag' : ''}`}>
        <input {...getInputProps()} />
        <Upload size={16} />
        <span>{isDragActive ? 'Drop here...' : 'CSV / Excel / PDF / TXT'}</span>
      </div>

      {files.length > 0 && (
        <div className="file-list">
          {files.map((f, i) => (
            <div key={i} className="file-item">
              📄 {f.name}
              <button className="file-remove" onClick={() => setFiles(p => p.filter((_, j) => j !== i))}>×</button>
            </div>
          ))}
        </div>
      )}

      <label className="checkbox-row">
        <input type="checkbox" checked={autoLoad} onChange={e => setAutoLoad(e.target.checked)} />
        Auto-load /data folder
      </label>

      <button
        className="btn-process"
        onClick={handleProcess}
        disabled={uploading || (!files.length && !autoLoad)}
      >
        {uploading ? '⏳ Processing...' : '🚀 Process & Index Data'}
      </button>

      {uploadProgress && (
        <div className={`upload-msg ${uploadProgress.startsWith('✅') ? 'success' : ''}`}>
          {uploadProgress}
        </div>
      )}

      {error && <div className="upload-msg error">{error}</div>}

      {/* Loaded files */}
      {status.files_loaded?.length > 0 && (
        <>
          <div className="sidebar-section-label">📄 Loaded Files</div>
          {status.files_loaded.map((f, i) => (
            <div key={i} className="file-item loaded">📄 {f}</div>
          ))}
        </>
      )}

      {/* Settings */}
      <div className="sidebar-section-label">⚙️ Settings</div>

      <div className="setting-row">
        <label>Context Depth (Top K): <strong>{topK}</strong></label>
        <input
          type="range" min={1} max={10} value={topK}
          onChange={e => setTopK(Number(e.target.value))}
          className="slider"
        />
      </div>

      <div className="setting-row">
        <label>Groq Model</label>
        <div className="select-wrap">
          <select value={model} onChange={e => setModel(e.target.value)} className="select">
            {models.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <ChevronDown size={14} className="select-icon" />
        </div>
      </div>

      <div className="setting-row">
        <button className="btn-key" onClick={() => setShowKey(v => !v)}>
          <Key size={13} /> {groqKey ? 'Change API Key' : 'Set Groq API Key'}
        </button>
        {showKey && (
          <div className="key-input-wrap">
            <input
              type="password"
              placeholder="gsk_..."
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              className="key-input"
            />
            <button className="btn-save-key" onClick={() => { setGroqKey(keyInput); setShowKey(false) }}>Save</button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="sidebar-section-label">🗑️ Actions</div>
      <div className="action-row">
        <button className="btn-action" onClick={onClearChat}>
          <MessageSquare size={13} /> Clear Chat
        </button>
        <button className="btn-action danger" onClick={onReset}>
          <RotateCcw size={13} /> Reset All
        </button>
      </div>
    </aside>
  )
}
