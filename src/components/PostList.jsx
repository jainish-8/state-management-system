import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectFilteredPosts, deletePost } from '../store/postsSlice';
import { selectAllPlatforms } from '../store/platformsSlice';
import { PostCard } from './PostCard';
import { useRenderCounter } from '../hooks/useRenderCounter';

const PostListComponent = ({ selectedPlatform, onEditPost, activeEditPostId }) => {
  const dispatch = useDispatch();
  const renderCount = useRenderCounter();

  const platforms = useSelector(selectAllPlatforms);
  const postsStatus = useSelector((state) => state.posts.status);
  const postsError = useSelector((state) => state.posts.error);

  // Local Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleDelete = React.useCallback((id) => {
    if (window.confirm('Are you sure you want to permanently delete this post?')) {
      dispatch(deletePost(id));
    }
  }, [dispatch]);

  // Map platform details by ID for easy lookup - memoized to prevent re-creation
  const platformMap = useMemo(() => {
    return platforms.reduce((acc, platform) => {
      acc[platform.id] = platform;
      return acc;
    }, {});
  }, [platforms]);

  // Extract filtered posts using the memoized selector.
  // The selector caches results and only recomputes when state (posts or platform configuration)
  // or filter criteria change.
  const filteredPosts = useSelector((state) =>
    selectFilteredPosts(state, selectedPlatform, searchQuery, statusFilter)
  );

  if (postsStatus === 'loading' && filteredPosts.length === 0) {
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
    <div className="posts-container render-tracker-container">
      {/* Visual Render Counter Badge */}
      <span className="render-badge">List Renders: {renderCount}</span>

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
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              platform={platformMap[post.platformId]}
              onEdit={onEditPost}
              onDelete={handleDelete}
              isEditingActive={activeEditPostId === post.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Wrap in React.memo to prevent re-renders when parent states change, 
// unless its props (selectedPlatform, onEditPost, activeEditPostId) actually change.
export const PostList = React.memo(PostListComponent);
