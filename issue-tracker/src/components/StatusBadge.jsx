export default function StatusBadge({ status }) {
  return <span className={`badge ${status === 'open' ? 'status-open' : status === 'in_progress' ? 'status-in_progress' : 'status-closed'} me-1`}>{status.replace('_',' ')}</span>;
}