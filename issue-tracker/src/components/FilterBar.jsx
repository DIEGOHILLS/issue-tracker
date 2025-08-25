import React from 'react';

export default function FilterBar({ searchTerm, setSearchTerm, statusFilter, setStatusFilter, priorityFilter, setPriorityFilter }) {
  return (
    <div className="d-flex gap-2 flex-wrap mb-3 animate__animated animate__fadeIn">
      <input
        className="form-control"
        placeholder="Search issues..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
      <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
        <option value="all">All Status</option>
        <option value="open">Open</option>
        <option value="in_progress">In Progress</option>
        <option value="closed">Closed</option>
      </select>
      <select className="form-select" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
        <option value="all">All Priority</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
    </div>
  );
}
