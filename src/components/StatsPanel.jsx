import React from 'react';
import { useSelector } from 'react-redux';
import { selectPostStats } from '../store/postsSlice';
import { useRenderCounter } from '../hooks/useRenderCounter';

const StatsPanelComponent = () => {
  const renderCount = useRenderCounter();
  
  // Extract pre-computed and memoized statistics from store
  const {
    totalPosts,
    activePlatforms,
    draftCount,
    scheduledCount,
    publishedCount
  } = useSelector(selectPostStats);

  return (
    <div className="stats-grid render-tracker-container">
      {/* Visual Render Counter Badge */}
      <span className="render-badge">Stats Renders: {renderCount}</span>

      <div className="stat-card">
        <span className="stat-label">Total Posts</span>
        <span className="stat-value">{totalPosts}</span>
        <span className="stat-desc">across all configurations</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Active Channels</span>
        <span className="stat-value">{activePlatforms}</span>
        <span className="stat-desc">enabled in sidebar</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Published</span>
        <span className="stat-value text-success">{publishedCount}</span>
        <span className="stat-desc">live content pieces</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Scheduled / Drafts</span>
        <span className="stat-value text-warning">
          {scheduledCount} <span className="stat-sub-value">/ {draftCount}</span>
        </span>
        <span className="stat-desc">pending release schedule</span>
      </div>
    </div>
  );
};

// Wrap in React.memo to prevent re-renders unless store stats reference changes.
export const StatsPanel = React.memo(StatsPanelComponent);
