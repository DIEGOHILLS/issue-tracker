import React from 'react';
import IssueItem from './IssueItem';

const IssueList = ({ issues, searchTerm, statusFilter, priorityFilter, onEdit, onDelete }) => {
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          issue.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (filteredIssues.length === 0) return <p className="text-center mt-3">No issues found.</p>;

  return (
    <div className="mt-3">
      {filteredIssues.map(issue => (
        <IssueItem
          key={issue.id}
          issue={issue}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default IssueList;
