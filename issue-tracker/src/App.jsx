import React, { useReducer, useState, useEffect } from 'react';
import IssueForm from './components/IssueForm';
import IssueList from './components/IssueList';
import AlertToast from './components/AlertToast';
import { STATUSES, PRIORITIES } from './constants';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';
import 'animate.css';

// Reducer for managing issues
const issueReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ISSUE':
      return [
        ...state,
        { ...action.payload, id: Date.now(), createdAt: new Date(), updatedAt: new Date() }
      ];
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
  const [darkMode, setDarkMode] = useState(false);

  // Load issues from localStorage on mount
  useEffect(() => {
    const savedIssues = localStorage.getItem('issues');
    if (savedIssues) {
      dispatch({ type: 'SET_ISSUES', payload: JSON.parse(savedIssues) });
    }
  }, []);

  // Save issues to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('issues', JSON.stringify(issues));
  }, [issues]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);
  const showAlert = (message, type = 'success') => setAlert({ message, type });
  const closeAlert = () => setAlert(null);

  const handleSubmit = () => {
    if (!formData.title.trim()) return;

    if (editingId) {
      dispatch({ type: 'UPDATE_ISSUE', payload: { id: editingId, data: formData } });
      showAlert('Issue updated!');
      setEditingId(null);
    } else {
      dispatch({ type: 'ADD_ISSUE', payload: formData });
      showAlert('Issue added!');
    }

    setFormData({ title: '', description: '', priority: PRIORITIES.MEDIUM, status: STATUSES.OPEN });
  };

  const handleEdit = issue => { setEditingId(issue.id); setFormData(issue); };
  const handleCancel = () => { setEditingId(null); setFormData({ title: '', description: '', priority: PRIORITIES.MEDIUM, status: STATUSES.OPEN }); };
  const handleDelete = id => { if(window.confirm('Delete this issue?')) { dispatch({ type: 'DELETE_ISSUE', payload: { id } }); showAlert('Issue removed!', 'danger'); } };

  return (
    <div className={`min-vh-100 px-3 py-4 ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
      {alert && <AlertToast {...alert} onClose={closeAlert} />}

      <div className="container animate__animated animate__fadeIn">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <h1 className="text-gradient">Issue Tracker</h1>
          <button className="btn btn-outline-secondary" onClick={toggleDarkMode}>
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        {/* Filters */}
        <div className="d-flex gap-2 mb-3 flex-wrap">
          <input
            className="form-control shadow-sm border-info"
            placeholder="Search..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select
            className="form-select shadow-sm border-warning"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>
          <select
            className="form-select shadow-sm border-success"
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
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
        />
      </div>
    </div>
  );
}

export default App;
