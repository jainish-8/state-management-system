import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectAllPosts, deletePost } from '../store/postsSlice';
import { selectAllPlatforms } from '../store/platformsSlice';

export const PostList = ({ selectedPlatform, onEditPost, activeEditPostId }) => {
  const dispatch = useDispatch();
  const posts = useSelector(selectAllPosts);
  const platforms = useSelector(selectAllPlatforms);

  const postsStatus = useSelector((state) => state.posts.status);
  const postsError = useSelector((state) => state.posts.error);
  const operationStatus = useSelector((state) => state.posts.operationStatus);

  // Local Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to permanently delete this post?')) {
      dispatch(deletePost(id));
    }
  };

  // Map platform details by ID for easy lookup
  const platformMap = platforms.reduce((acc, platform) => {
    acc[platform.id] = platform;
    return acc;
  }, {});

  // Filtering Logic
  const filteredPosts = posts.filter((post) => {
    const platform = platformMap[post.platformId];
    
    // 1. Hide posts if their platform is completely deactivated in the system
    if (!platform || !platform.active) {
      return false;
    }

    // 2. Filter by sidebar platform selection
    if (selectedPlatform !== 'all' && post.platformId !== selectedPlatform) {
      return false;
    }

    // 3. Filter by search query (title or content)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchTitle = post.title.toLowerCase().includes(query);
      const matchContent = post.content.toLowerCase().includes(query);
      if (!matchTitle && !matchContent) return false;
    }

    // 4. Filter by publish status
    if (statusFilter !== 'all' && post.status !== statusFilter) {
      return false;
    }

    return true;
  });

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

  const isDeleting = operationStatus === 'loading';

  if (postsStatus === 'loading' && posts.length === 0) {
    return (
      <div className="list-loading">
        <div className="spinner"></div>
        <p>Loading publishing database...</p>
      </div>
    );
  }

  if (postsStatus === 'failed') {
    return (
      <div className="alert-message error">
        Failed to fetch posts: {postsError}
      </div>
    );
  }

  return (
    <div className="posts-container">
      <div className="posts-header-row">
        <h2 className="section-heading">Post Dashboard Feed</h2>
        
        <div className="filters-row">
          <input
            type="text"
            className="search-input"
            placeholder="Search feed content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All States</option>
            <option value="draft">Drafts Only</option>
            <option value="scheduled">Scheduled Only</option>
            <option value="published">Published Only</option>
          </select>
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="empty-state card">
          <p className="empty-title">No content matches found</p>
          <p className="empty-desc">
            Try adjusting your search filters, checking inactive channels, or compose a new post using the composer.
          </p>
        </div>
      ) : (
        <div className="posts-grid">
          {filteredPosts.map((post) => {
            const platformObj = platformMap[post.platformId] || { name: 'Unknown', color: '#6b7280' };
            const isEditing = activeEditPostId === post.id;
            
            return (
              <div
                key={post.id}
                className={`post-card card ${isEditing ? 'editing-highlight' : ''}`}
              >
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
                      onClick={() => onEditPost(post.id)}
                      disabled={isDeleting || isEditing}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-icon btn-danger"
                      onClick={() => handleDelete(post.id)}
                      disabled={isDeleting || isEditing}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
