export default function PriorityBadge({ priority }) {
  return <span className={`badge ${priority === 'low' ? 'badge-low' : priority === 'medium' ? 'badge-medium' : 'badge-high'} me-1`}>{priority}</span>;
}