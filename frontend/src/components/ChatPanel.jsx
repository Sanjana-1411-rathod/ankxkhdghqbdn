import { useRef, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Send, Loader2, Zap } from 'lucide-react'
import './ChatPanel.css'

export default function ChatPanel({ chatHistory, loading, onSend, processed }) {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, loading])

  const submit = () => {
    const q = input.trim()
    if (!q || loading) return
    setInput('')
    onSend(q)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="chat-panel">
      <div className="chat-messages">
        {chatHistory.length === 0 && (
          <div className="chat-empty">
            <div className="chat-empty-icon">💬</div>
            <p className="chat-empty-title">Start a conversation</p>
            <p className="chat-empty-sub">
              Upload your sales & stock data, then ask anything!<br />
              Use the Quick Insights buttons on the right →
            </p>
          </div>
        )}

        {chatHistory.map((msg, i) => (
          <div key={i} className={`msg-wrap ${msg.role}`}>
            <div className="msg-label">
              {msg.role === 'user' ? 'You' : (
                <><Zap size={12} /> ANKAN AI</>
              )}
            </div>
            <div className={`msg-bubble ${msg.role}`}>
              {msg.role === 'user' ? (
                msg.content
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    table: ({ node, ...props }) => (
                      <div className="md-table-wrap"><table {...props} /></div>
                    ),
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              )}
            </div>
            {msg.meta && (
              <div className="msg-meta">
                ⚡ {msg.meta.elapsed}s · {msg.meta.model} · {msg.meta.chunks} chunks
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="msg-wrap assistant">
            <div className="msg-label"><Zap size={12} /> ANKAN AI</div>
            <div className="msg-bubble assistant thinking">
              <Loader2 size={16} className="spin" />
              <span>Thinking with Groq...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="chat-input-area">
        <textarea
          className="chat-input"
          placeholder={processed ? "Ask about sales, stock, brands, sizes..." : "⚠️ Upload & process data first to start chatting"}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={2}
          disabled={loading}
        />
        <button
          className="chat-send-btn"
          onClick={submit}
          disabled={!input.trim() || loading}
        >
          {loading ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
        </button>
      </div>
    </div>
  )
}
