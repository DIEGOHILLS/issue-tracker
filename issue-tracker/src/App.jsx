import React, { useReducer, useState, useEffect } from 'react';
import IssueForm from './components/IssueForm';
import IssueList from './components/IssueList';
import AlertToast from './components/AlertToast';
import { STATUSES, PRIORITIES } from './constants';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';
import 'animate.css';
import { summarizeIssue, suggestFix } from './services/aiService';

// Storage keys
const STORAGE_KEYS = {
  ISSUES: 'issueTracker_issues',
  DARK_MODE: 'issueTracker_darkMode'
};

// Helper function for safe localStorage operations
const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
      return false;
    }
  }
};

// Reducer for managing issues
const issueReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ISSUE':
      const newIssue = {
        ...action.payload,
        id: Date.now(),
        createdAt: new Date(),
        updatedAt: new Date(),
        aiSummary: '',
        aiFix: ''
      };
      return [...state, newIssue];
    
    case 'UPDATE_ISSUE':
      return state.map(issue =>
        issue.id === action.payload.id
          ? { ...issue, ...action.payload.data, updatedAt: new Date() }
          : issue
      );
    
    case 'DELETE_ISSUE':
      return state.filter(issue => issue.id !== action.payload.id);
    
    case 'SET_ISSUES':
      return action.payload;
    
    case 'SET_AI':
      return state.map(issue =>
        issue.id === action.payload.id
          ? { 
              ...issue, 
              aiSummary: action.payload.aiSummary, 
              aiFix: action.payload.aiFix,
              updatedAt: new Date() 
            }
          : issue
      );
    
    case 'CLEAR_ALL_ISSUES':
      return [];
    
    default:
      return state;
  }
};

function App() {
  const [issues, dispatch] = useReducer(issueReducer, []);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: PRIORITIES.MEDIUM,
    status: STATUSES.OPEN
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [alert, setAlert] = useState(null);
  const [darkMode, setDarkMode] = useState(() => storage.get(STORAGE_KEYS.DARK_MODE, false));
  const [aiBusy, setAiBusy] = useState(false);

  // Load issues from localStorage on mount
  useEffect(() => {
    const savedIssues = storage.get(STORAGE_KEYS.ISSUES, []);
    
    // Convert string dates back to Date objects and ensure all fields exist
    const parsedIssues = savedIssues.map(issue => ({
      id: issue.id || Date.now(),
      title: issue.title || '',
      description: issue.description || '',
      priority: issue.priority || PRIORITIES.MEDIUM,
      status: issue.status || STATUSES.OPEN,
      aiSummary: issue.aiSummary || '',
      aiFix: issue.aiFix || '',
      createdAt: new Date(issue.createdAt || new Date()),
      updatedAt: new Date(issue.updatedAt || new Date())
    }));
    
    dispatch({ type: 'SET_ISSUES', payload: parsedIssues });
  }, []);

  // Save issues to localStorage whenever they change
  useEffect(() => {
    storage.set(STORAGE_KEYS.ISSUES, issues);
  }, [issues]);

  // Save dark mode preference
  useEffect(() => {
    storage.set(STORAGE_KEYS.DARK_MODE, darkMode);
  }, [darkMode]);

  // Apply dark mode theme
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('bg-dark', 'text-light');
      document.body.classList.remove('bg-light', 'text-dark');
    } else {
      document.body.classList.add('bg-light', 'text-dark');
      document.body.classList.remove('bg-dark', 'text-light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const closeAlert = () => setAlert(null);

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      showAlert('Please enter a title for the issue.', 'warning');
      return;
    }

    if (editingId) {
      dispatch({ type: 'UPDATE_ISSUE', payload: { id: editingId, data: formData } });
      showAlert('Issue updated successfully!');
      setEditingId(null);
    } else {
      dispatch({ type: 'ADD_ISSUE', payload: formData });
      showAlert('Issue added successfully!');
    }

    setFormData({ title: '', description: '', priority: PRIORITIES.MEDIUM, status: STATUSES.OPEN });
  };

  const handleEdit = issue => {
    setEditingId(issue.id);
    setFormData(issue);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ title: '', description: '', priority: PRIORITIES.MEDIUM, status: STATUSES.OPEN });
  };

  const handleDelete = id => {
    if (window.confirm('Are you sure you want to delete this issue?')) {
      dispatch({ type: 'DELETE_ISSUE', payload: { id } });
      showAlert('Issue removed successfully!', 'info');
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete ALL issues? This cannot be undone.')) {
      dispatch({ type: 'CLEAR_ALL_ISSUES' });
      showAlert('All issues have been cleared.', 'info');
    }
  };

  // AI integration
  const handleAI = async (issue) => {
    try {
      setAiBusy(true);
      showAlert('AI is analyzing your issue...', 'info');
      
      const [aiSummary, aiFix] = await Promise.all([
        summarizeIssue(issue.description),
        suggestFix(issue.description)
      ]);
      
      dispatch({ type: 'SET_AI', payload: { id: issue.id, aiSummary, aiFix } });
      showAlert('AI analysis complete!');
    } catch (error) {
      console.error('AI processing error:', error);
      showAlert('AI analysis failed. Please try again.', 'danger');
    } finally {
      setAiBusy(false);
    }
  };

  return (
    <div className="min-vh-100 px-3 py-4">
      {alert && <AlertToast {...alert} onClose={closeAlert} />}

      <div className="container animate__animated animate__fadeIn">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h1 className="text-gradient">AI-Powered Issue Tracker</h1>
            <p className="text-muted small mb-0">
              {issues.length} issue{issues.length !== 1 ? 's' : ''} stored locally
            </p>
          </div>
          <div className="d-flex gap-2">
            {issues.length > 0 && (
              <button 
                className="btn btn-outline-danger btn-sm"
                onClick={handleClearAll}
                title="Clear all issues"
              >
                🗑️ Clear All
              </button>
            )}
            <button className="btn btn-outline-secondary" onClick={toggleDarkMode}>
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="d-flex gap-2 mb-3 flex-wrap">
          <input
            className="form-control shadow-sm"
            placeholder="Search issues..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select
            className="form-select shadow-sm"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value={STATUSES.OPEN}>Open</option>
            <option value={STATUSES.IN_PROGRESS}>In Progress</option>
            <option value={STATUSES.CLOSED}>Closed</option>
          </select>
          <select
            className="form-select shadow-sm"
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
          >
            <option value="all">All Priority</option>
            <option value={PRIORITIES.LOW}>Low</option>
            <option value={PRIORITIES.MEDIUM}>Medium</option>
            <option value={PRIORITIES.HIGH}>High</option>
          </select>
        </div>

        {/* Form */}
        <IssueForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          editing={!!editingId}
          onCancel={handleCancel}
        />

        {/* Issue List */}
        <IssueList
          issues={issues}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAI={handleAI}
          aiBusy={aiBusy}
        />
      </div>
    </div>
  );
}

export default App;