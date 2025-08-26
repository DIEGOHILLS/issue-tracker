import React, { useState } from 'react';
import { Edit, Trash2 } from 'react-feather';
import { summarizeIssue, suggestFix } from '../services/aiService';

const IssueItem = ({ issue, onEdit, onDelete }) => {
  const [summary, setSummary] = useState("");
  const [fix, setFix] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAI = async () => {
    setLoading(true);
    try {
      const s = await summarizeIssue(issue.description);
      const f = await suggestFix(issue.description);
      setSummary(s);
      setFix(f);
    } catch (error) {
      setSummary("AI failed to generate summary.");
      setFix("AI failed to generate suggestion.");
    }
    setLoading(false);
  };

  return (
    <div className="card mb-2 shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h5>{issue.title}</h5>
            <p>{issue.description}</p>
            {issue.aiSuggestion && (
              <div className="mt-2 p-2 bg-light border rounded">
                <strong>Stored AI Suggestion:</strong> {issue.aiSuggestion}
              </div>
            )}
          </div>
          <div>
            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => onEdit(issue)}>
              <Edit />
            </button>
            <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(issue.id)}>
              <Trash2 />
            </button>
          </div>
        </div>

        <button
          onClick={handleAI}
          className="mt-2 btn btn-sm btn-info"
          disabled={loading}
        >
          {loading ? "AI Thinking..." : "Ask AI"}
        </button>

        {summary && (
          <div className="mt-2 p-2 bg-warning rounded">
            <strong>AI Summary:</strong> {summary}
          </div>
        )}

        {fix && (
          <div className="mt-2 p-2 bg-success rounded text-white">
            <strong>AI Suggestion:</strong> {fix}
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueItem;
