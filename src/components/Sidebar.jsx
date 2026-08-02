import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectAllPlatforms, togglePlatform, addPlatform } from '../store/platformsSlice';
import { selectAllPosts } from '../store/postsSlice';
import { useRenderCounter } from '../hooks/useRenderCounter';

const SidebarComponent = ({ selectedPlatform, onSelectPlatform }) => {
  const dispatch = useDispatch();
  const renderCount = useRenderCounter();
  
  const platforms = useSelector(selectAllPlatforms);
  const posts = useSelector(selectAllPosts);

  // Local state for platform creator form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#2563eb');
  const [newMaxChars, setNewMaxChars] = useState(280);
  const [formError, setFormError] = useState('');

  // Helper to count posts per platform - memoized internally if needed, or simple compute since platforms are few
  const getPostCount = (platformId) => {
    return posts.filter((p) => p.platformId === platformId).length;
  };

  const handleToggle = (id, e) => {
    e.stopPropagation(); // Avoid selecting filter when toggling switch
    dispatch(togglePlatform(id));
  };

  const handleAddPlatform = (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      setFormError('Platform name is required.');
      return;
    }
    
    // Check if duplicate
    const platformId = newName.toLowerCase().replace(/\s+/g, '-');
    if (platforms.some((p) => p.id === platformId)) {
      setFormError('A platform with this name already exists.');
      return;
    }

    dispatch(addPlatform({
      name: newName.trim(),
      color: newColor,
      maxChars: parseInt(newMaxChars) || 500
    }));

    // Reset form
    setNewName('');
    setNewColor('#2563eb');
    setNewMaxChars(280);
    setFormError('');
    setShowAddForm(false);
  };

  return (
    <aside className="app-sidebar render-tracker-container">
      {/* Visual Render Counter Badge */}
      <span className="render-badge">Sidebar Renders: {renderCount}</span>

      <div className="sidebar-section">
        <h3 className="sidebar-title">Publishing Channels</h3>
        <p className="sidebar-help">Toggle switch to enable/disable. Click channel to filter feed.</p>
        
        <ul className="platform-list">
          <li
            className={`platform-item ${selectedPlatform === 'all' ? 'active-filter' : ''}`}
            onClick={() => onSelectPlatform('all')}
          >
            <div className="platform-meta">
              <span className="platform-color-dot" style={{ backgroundColor: '#a1a1aa' }}></span>
              <span className="platform-name">Show All Feed</span>
            </div>
            <span className="badge">{posts.length}</span>
          </li>
          
          {platforms.map((platform) => {
            const count = getPostCount(platform.id);
            return (
              <li
                key={platform.id}
                className={`platform-item ${selectedPlatform === platform.id ? 'active-filter' : ''} ${!platform.active ? 'disabled-channel' : ''}`}
                onClick={() => platform.active && onSelectPlatform(platform.id)}
              >
                <div className="platform-meta">
                  <span
                    className="platform-color-dot"
                    style={{ backgroundColor: platform.color }}
                  ></span>
                  <span className="platform-name">{platform.name}</span>
                </div>
                
                <div className="platform-controls">
                  <span className="badge">{count}</span>
                  <label className="switch" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={platform.active}
                      onChange={(e) => handleToggle(platform.id, e)}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="sidebar-section border-top">
        {!showAddForm ? (
          <button
            className="btn btn-block btn-secondary"
            onClick={() => setShowAddForm(true)}
          >
            Add New Channel
          </button>
        ) : (
          <form onSubmit={handleAddPlatform} className="platform-form">
            <h4 className="form-subtitle">New Channel Details</h4>
            
            {formError && <div className="error-message">{formError}</div>}
            
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                placeholder="e.g. Mastodon"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group-row">
              <div className="form-group">
                <label>Theme Color</label>
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label>Character Limit</label>
                <input
                  type="number"
                  min="10"
                  max="10000"
                  value={newMaxChars}
                  onChange={(e) => setNewMaxChars(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-sm btn-primary">
                Save Channel
              </button>
            </div>
          </form>
        )}
      </div>
    </aside>
  );
};

// Wrap in React.memo for re-render checks on selectedPlatform or callbacks
export const Sidebar = React.memo(SidebarComponent);
