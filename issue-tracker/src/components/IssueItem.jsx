import React from 'react';
import { Edit, Trash2 } from 'react-feather';

const IssueItem = ({ issue, onEdit, onDelete }) => {
  return (
    <div className="card mb-2">
      <div className="card-body d-flex justify-content-between align-items-center">
        <div>
          <h5 className="card-title">{issue.title}</h5>
          <p className="card-text">{issue.description}</p>
        </div>
        <div>
          <button className="btn btn-sm btn-outline-primary me-2" onClick={() => onEdit(issue.id)}>
            <Edit />
          </button>
          <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(issue.id)}>
            <Trash2 />
          </button>
        </div>
      </div>
    </div>
  );
};

export default IssueItem;
