import React from 'react';
import { useRenderCounter } from '../hooks/useRenderCounter';

const PostCardComponent = ({ post, platform, onEdit, onDelete, isEditingActive }) => {
  const renderCount = useRenderCounter();

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const platformObj = platform || { name: 'Unknown', color: '#6b7280' };

  return (
    <div
      className={`post-card card render-tracker-container ${isEditingActive ? 'editing-highlight' : ''}`}
    >
      {/* Visual Render Counter Badge */}
      <span className="render-badge">Renders: {renderCount}</span>

      <div className="post-card-header">
        <span
          className="platform-badge"
          style={{
            borderColor: platformObj.color,
            color: platformObj.color,
            backgroundColor: `${platformObj.color}15`
          }}
        >
          {platformObj.name}
        </span>
        
        <span className={`status-badge status-${post.status}`}>
          {post.status.toUpperCase()}
        </span>
      </div>

      <h3 className="post-card-title">{post.title}</h3>
      <p className="post-card-body">{post.content}</p>

      <div className="post-card-footer border-top">
        <span className="post-date">
          {post.status === 'scheduled'
            ? `Scheduled: ${formatDate(post.scheduledAt)}`
            : `Created: ${formatDate(post.createdAt)}`}
        </span>

        <div className="post-card-actions">
          <button
            className="btn btn-icon btn-secondary"
            onClick={() => onEdit(post.id)}
            disabled={isEditingActive}
          >
            Edit
          </button>
          <button
            className="btn btn-icon btn-danger"
            onClick={() => onDelete(post.id)}
            disabled={isEditingActive}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Wrap in React.memo for component re-render optimization.
// Renders only when the post data, platform data, editing state, or callbacks change.
export const PostCard = React.memo(PostCardComponent);
