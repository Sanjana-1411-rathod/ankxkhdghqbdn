import './HeroBanner.css'

export default function HeroBanner() {
  return (
    <div className="hero-banner">
      <div className="hero-glow" />
      <h1 className="hero-title">👗 ANKAN Garments · AI Store Manager</h1>
      <p className="hero-subtitle">Ask anything about your sales, stock, brands & trends — powered by Groq AI</p>
      <div className="hero-badges">
        <span>⚡ Ultra-fast Groq LLM</span>
        <span>🔍 FAISS Vector Search</span>
        <span>📊 Sales Analytics</span>
        <span>📦 Stock Alerts</span>
        <span>⚛️ React Frontend</span>
      </div>
    </div>
  )
}
