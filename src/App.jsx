import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { fetchPosts } from './store/postsSlice';
import { fetchPlatforms } from './store/platformsSlice';
import { Header } from './components/Header';
import { StatsPanel } from './components/StatsPanel';
import { Sidebar } from './components/Sidebar';
import { PostForm } from './components/PostForm';
import { PostList } from './components/PostList';

function App() {
  const dispatch = useDispatch();
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [editPostId, setEditPostId] = useState(null);

  // Load database on application mount
  useEffect(() => {
    dispatch(fetchPosts());
    dispatch(fetchPlatforms());
  }, [dispatch]);

  // Memoize callback filters to satisfy React.memo referential comparisons in child components
  const handleSelectPlatform = useCallback((platformId) => {
    setSelectedPlatform(platformId);
  }, []);

  const handleEditPost = useCallback((id) => {
    setEditPostId(id);
    const formElement = document.getElementById('composer-section');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditPostId(null);
  }, []);

  return (
    <div className="app-container">
      <Header />
      <main className="app-main">
        <StatsPanel />
        <div className="app-layout">
          <Sidebar
            selectedPlatform={selectedPlatform}
            onSelectPlatform={handleSelectPlatform}
          />
          <div className="main-content">
            <div id="composer-section">
              <PostForm
                editPostId={editPostId}
                onCancelEdit={handleCancelEdit}
              />
            </div>
            <PostList
              selectedPlatform={selectedPlatform}
              onEditPost={handleEditPost}
              activeEditPostId={editPostId}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
