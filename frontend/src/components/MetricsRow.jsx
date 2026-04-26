import './MetricsRow.css'

function MetricCard({ icon, value, label }) {
  return (
    <div className="metric-card">
      <div className="metric-icon">{icon}</div>
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label}</div>
    </div>
  )
}

export default function MetricsRow({ processed, totalChunks, questionsAsked, model }) {
  const statusEl = (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
      <span className={`status-dot-m ${processed ? 'ready' : 'waiting'}`} />
      {processed ? 'Ready' : 'Awaiting Data'}
    </span>
  )

  return (
    <div className="metrics-row">
      <MetricCard icon="🟢" value={statusEl} label="System Status" />
      <MetricCard icon="🧩" value={totalChunks.toLocaleString()} label="Indexed Chunks" />
      <MetricCard icon="💬" value={questionsAsked} label="Questions Asked" />
      <MetricCard icon="⚡" value={model.split('-')[0].toUpperCase()} label="Active Model" />
    </div>
  )
}
