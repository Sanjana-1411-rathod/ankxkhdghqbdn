import './QuickActions.css'

const QUICK_ACTIONS = [
  { label: '📦 Low Stock Alert',   question: 'Which products have low stock or are about to run out?' },
  { label: '🏆 Top Selling Items', question: 'What are the top 10 best selling products and brands?' },
  { label: '💰 Revenue Summary',   question: 'Give me a complete summary of total revenue and sales performance.' },
  { label: '📊 Size Trends',       question: 'Which sizes and categories are performing the best?' },
  { label: '🏷️ Brand Analysis',   question: 'Which brands are selling the most and which are slow movers?' },
  { label: '📈 Recent Sales',      question: 'What are the recent sales trends? Show me month-wise or date-wise if available.' },
  { label: '🔄 Reorder Needed',    question: 'Which items need to be reordered based on stock levels?' },
]

export default function QuickActions({ processed, onQuestion }) {
  return (
    <div className="quick-panel">
      <div className="quick-card">
        <div className="quick-section-label">⚡ Quick Insights</div>
        {QUICK_ACTIONS.map(({ label, question }) => (
          <button
            key={label}
            className="quick-btn"
            onClick={() => { if (processed) onQuestion(question) }}
            disabled={!processed}
            title={!processed ? 'Process data first' : question}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tips */}
      <div className="tips-card">
        <div className="quick-section-label">💡 Tips</div>
        <ul className="tips-list">
          <li>Upload CSV/Excel from the sidebar</li>
          <li>Ask about specific brands or SKUs</li>
          <li>Ask for date-wise or month-wise trends</li>
          <li>Compare categories side by side</li>
        </ul>
      </div>
    </div>
  )
}
