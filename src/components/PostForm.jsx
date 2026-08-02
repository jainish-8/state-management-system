import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addPost, updatePost, clearErrors } from '../store/postsSlice';
import { selectAllPlatforms } from '../store/platformsSlice';
import { useRenderCounter } from '../hooks/useRenderCounter';

const PostFormComponent = ({ editPostId, onCancelEdit }) => {
  const dispatch = useDispatch();
  const renderCount = useRenderCounter();
  
  const platforms = useSelector(selectAllPlatforms);
  const activePlatforms = platforms.filter((p) => p.active);
  
  // Select post to edit if editPostId is provided
  const editingPost = useSelector((state) =>
    editPostId ? state.posts.entities[editPostId] : null
  );

  const operationStatus = useSelector((state) => state.posts.operationStatus);
  const operationError = useSelector((state) => state.posts.operationError);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [platformId, setPlatformId] = useState('');
  const [status, setStatus] = useState('draft');
  const [scheduledAt, setScheduledAt] = useState('');
  const [validationError, setValidationError] = useState('');

  // Sync editing post values into form
  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title);
      setContent(editingPost.content);
      setPlatformId(editingPost.platformId);
      setStatus(editingPost.status);
      setScheduledAt(editingPost.scheduledAt || '');
    } else {
      // Defaults for new post
      setTitle('');
      setContent('');
      if (activePlatforms.length > 0) {
        setPlatformId(activePlatforms[0].id);
      } else {
        setPlatformId('');
      }
      setStatus('draft');
      setScheduledAt('');
    }
    setValidationError('');
    dispatch(clearErrors());
  }, [editingPost, activePlatforms.length, editPostId, dispatch]);

  // Find max characters for selected platform
  const selectedPlatformObj = platforms.find((p) => p.id === platformId);
  const maxChars = selectedPlatformObj ? selectedPlatformObj.maxChars : 500;
  const currentLength = content.length;
  const isOverLimit = currentLength > maxChars;

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!title.trim()) {
      setValidationError('Post title is required.');
      return;
    }
    if (!content.trim()) {
      setValidationError('Post content is required.');
      return;
    }
    if (!platformId) {
      setValidationError('Please select an active platform channel.');
      return;
    }
    if (isOverLimit) {
      setValidationError(`Content exceeds character limit of ${maxChars} for ${selectedPlatformObj?.name}.`);
      return;
    }
    if (status === 'scheduled' && !scheduledAt) {
      setValidationError('Please specify a publish date-time for scheduled posts.');
      return;
    }

    const postPayload = {
      title: title.trim(),
      content: content.trim(),
      platformId,
      status,
      scheduledAt: status === 'scheduled' ? scheduledAt : ''
    };

    if (editingPost) {
      dispatch(updatePost({ id: editingPost.id, changes: postPayload }))
        .unwrap()
        .then(() => {
          onCancelEdit();
        })
        .catch(() => {});
    } else {
      dispatch(addPost(postPayload))
        .unwrap()
        .then(() => {
          setTitle('');
          setContent('');
          setStatus('draft');
          setScheduledAt('');
        })
        .catch(() => {});
    }
  };

  const isSaving = operationStatus === 'loading';

  if (activePlatforms.length === 0) {
    return (
      <div className="card form-card render-tracker-container">
        <span className="render-badge">Form Renders: {renderCount}</span>
        <h2 className="card-title">Compose Content</h2>
        <div className="alert-message warning">
          No active publishing channels found. Please enable at least one channel in the sidebar to compose a post.
        </div>
      </div>
    );
  }

  return (
    <div className="card form-card render-tracker-container">
      {/* Visual Render Counter Badge */}
      <span className="render-badge">Form Renders: {renderCount}</span>

      <h2 className="card-title">
        {editingPost ? 'Edit Post Configuration' : 'Compose New Post'}
      </h2>

      <form onSubmit={handleSubmit} className="post-form">
        {validationError && (
          <div className="alert-message error">{validationError}</div>
        )}
        {operationError && (
          <div className="alert-message error">Server Error: {operationError}</div>
        )}

        <div className="form-group">
          <label htmlFor="post-title">Headline / Title</label>
          <input
            id="post-title"
            type="text"
            placeholder="Enter post description header..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSaving}
            required
          />
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="post-platform">Channel</label>
            <select
              id="post-platform"
              value={platformId}
              onChange={(e) => setPlatformId(e.target.value)}
              disabled={isSaving}
              required
            >
              {activePlatforms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="post-status">Release State</label>
            <select
              id="post-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={isSaving}
            >
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        {status === 'scheduled' && (
          <div className="form-group">
            <label htmlFor="post-schedule">Release Schedule Date-Time</label>
            <input
              id="post-schedule"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              disabled={isSaving}
              required
            />
          </div>
        )}

        <div className="form-group">
          <div className="textarea-header">
            <label htmlFor="post-content">Body Content</label>
            <span className={`char-count ${isOverLimit ? 'over-limit' : ''}`}>
              {currentLength} / {maxChars}
            </span>
          </div>
          <textarea
            id="post-content"
            rows="5"
            placeholder="Write your platform-specific content copy here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSaving}
            required
          ></textarea>
        </div>

        <div className="form-actions border-top">
          {editingPost && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={onCancelEdit}
              disabled={isSaving}
            >
              Cancel Edit
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSaving}
          >
            {isSaving ? 'Processing Request...' : editingPost ? 'Apply Changes' : 'Submit Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Wrap in React.memo to isolate local edits from parent layout triggers.
export const PostForm = React.memo(PostFormComponent);
