import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resetSystem } from '../store/postsSlice';

export const Header = () => {
  const dispatch = useDispatch();
  const postsStatus = useSelector((state) => state.posts.status);
  const isResetting = postsStatus === 'loading';

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the database to default values?')) {
      dispatch(resetSystem());
    }
  };

  return (
    <header className="app-header">
      <div className="header-brand">
        <h1>Unified Publisher Hub</h1>
        <p className="header-subtitle">Centralized Global State & Multi-Platform Publishing Manager</p>
      </div>
      <div className="header-actions">
        <button
          className="btn btn-outline"
          onClick={handleReset}
          disabled={isResetting}
        >
          {isResetting ? 'Resetting Database...' : 'Reset Database'}
        </button>
      </div>
    </header>
  );
};
