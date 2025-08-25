import React from 'react';
import 'animate.css';

const AlertToast = ({ message, type = 'success', onClose }) => {
  const colors = { success: 'bg-success text-white', danger: 'bg-danger text-white', info: 'bg-info text-dark', warning: 'bg-warning text-dark' };
  
  return (
    <div className={`toast show position-fixed top-0 end-0 m-3 animate__animated animate__fadeInDown ${colors[type]}`} role="alert">
      <div className="d-flex align-items-center justify-content-between">
        <div>{message}</div>
        <button type="button" className="btn-close btn-close-white ms-3" onClick={onClose}></button>
      </div>
    </div>
  );
};

export default AlertToast;
