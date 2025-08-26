import React from 'react';
import IssueItem from './IssueItem';

const IssueList = ({ 
  issues = [], 
  searchTerm = '', 
  statusFilter = 'all', 
  priorityFilter = 'all', 
  onEdit, 
  onDelete, 
  onAI, 
  aiBusy 
}) => {
  // Safe filtering with null checks
  const filteredIssues = issues.filter(issue => {
    if (!issue) return false;
    
    const title = issue.title || '';
    const description = issue.description || '';
    const status = issue.status || '';
    const priority = issue.priority || '';

    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (issues.length === 0) {
    return (
      <div className="text-center text-muted py-5">
        <h5>No issues yet</h5>
        <p>Create your first issue to get started!</p>
      </div>
    );
  }

  if (filteredIssues.length === 0) {
    return (
      <div className="text-center text-muted py-5">
        <h5>No matching issues found</h5>
        <p>Try adjusting your search terms or filters.</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h4 className="mb-3">
        Issues ({filteredIssues.length} of {issues.length})
      </h4>
      <div className="row g-3">
        {filteredIssues.map(issue => (
          <div key={issue.id} className="col-12">
            <IssueItem
              issue={issue}
              onEdit={onEdit}
              onDelete={onDelete}
              onAI={onAI}
              aiBusy={aiBusy}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default IssueList;