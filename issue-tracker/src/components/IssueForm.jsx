import React from 'react';
import { STATUSES, PRIORITIES } from '../constants';

const IssueForm = ({ formData, setFormData, onSubmit, editing, onCancel, aiBusy }) => {
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="card mb-4 shadow-sm">
      <div className="card-body">
        <h5 className="card-title">{editing ? 'Edit Issue' : 'Add New Issue'}</h5>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <textarea
            className="form-control"
            placeholder="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3 d-flex gap-2 flex-wrap">
          <select className="form-select" name="priority" value={formData.priority} onChange={handleChange}>
            <option value={PRIORITIES.LOW}>Low</option>
            <option value={PRIORITIES.MEDIUM}>Medium</option>
            <option value={PRIORITIES.HIGH}>High</option>
          </select>
          <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
            <option value={STATUSES.OPEN}>Open</option>
            <option value={STATUSES.IN_PROGRESS}>In Progress</option>
            <option value={STATUSES.CLOSED}>Closed</option>
          </select>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={onSubmit} disabled={aiBusy}>
            {editing ? 'Update Issue' : 'Add Issue'}
          </button>
          {editing && (
            <button className="btn btn-secondary" onClick={onCancel} disabled={aiBusy}>
              Cancel
            </button>
          )}
          {aiBusy && <span className="ms-2">AI thinking...</span>}
        </div>
      </div>
    </div>
  );
};

export default IssueForm;
