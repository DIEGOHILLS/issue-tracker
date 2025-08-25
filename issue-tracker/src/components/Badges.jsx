import React from 'react';

export const PriorityBadge = ({ priority }) => {
  const colors = { low: 'success', medium: 'warning', high: 'danger' };
  return <span className={`badge bg-${colors[priority]}`}>{priority.toUpperCase()}</span>;
};

export const StatusBadge = ({ status }) => {
  const labels = { open: 'Open', in_progress: 'In Progress', closed: 'Closed' };
  const colors = { open: 'primary', in_progress: 'warning', closed: 'success' };
  return <span className={`badge bg-${colors[status]}`}>{labels[status]}</span>;
};
