import React from 'react';
import { useSelector } from 'react-redux';
import { selectAllPosts } from '../store/postsSlice';
import { selectAllPlatforms } from '../store/platformsSlice';

export const StatsPanel = () => {
  const posts = useSelector(selectAllPosts);
  const platforms = useSelector(selectAllPlatforms);

  const totalPosts = posts.length;
  const activePlatforms = platforms.filter((p) => p.active).length;
  
  const draftCount = posts.filter((p) => p.status === 'draft').length;
  const scheduledCount = posts.filter((p) => p.status === 'scheduled').length;
  const publishedCount = posts.filter((p) => p.status === 'published').length;

  return (
    <div className="stats-grid">
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
