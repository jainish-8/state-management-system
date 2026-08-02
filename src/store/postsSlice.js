import { createSlice, createAsyncThunk, createEntityAdapter, createSelector } from '@reduxjs/toolkit';
import { mockApi } from '../api/mockApi';

const postsAdapter = createEntityAdapter({
  sortComparer: (a, b) => b.createdAt.localeCompare(a.createdAt)
});

export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async () => {
    return await mockApi.getPosts();
  }
);

export const addPost = createAsyncThunk(
  'posts/addPost',
  async (postData) => {
    return await mockApi.createPost(postData);
  }
);

export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ id, changes }) => {
    return await mockApi.updatePost(id, changes);
  }
);

export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (id) => {
    return await mockApi.deletePost(id);
  }
);

export const resetSystem = createAsyncThunk(
  'posts/resetSystem',
  async (_, { dispatch }) => {
    const data = await mockApi.resetDatabase();
    // Dispatch local update for platforms as well to keep them in sync
    dispatch({ type: 'platforms/fetchPlatforms/fulfilled', payload: data.platforms });
    return data.posts;
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState: postsAdapter.getInitialState({
    status: 'idle',
    error: null,
    operationStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    operationError: null
  }),
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.operationError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch posts
      .addCase(fetchPosts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        postsAdapter.setAll(state, action.payload);
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // Add post
      .addCase(addPost.pending, (state) => {
        state.operationStatus = 'loading';
      })
      .addCase(addPost.fulfilled, (state, action) => {
        state.operationStatus = 'succeeded';
        postsAdapter.addOne(state, action.payload);
      })
      .addCase(addPost.rejected, (state, action) => {
        state.operationStatus = 'failed';
        state.operationError = action.error.message;
      })
      // Update post
      .addCase(updatePost.pending, (state) => {
        state.operationStatus = 'loading';
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.operationStatus = 'succeeded';
        postsAdapter.updateOne(state, {
          id: action.payload.id,
          changes: action.payload
        });
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.operationStatus = 'failed';
        state.operationError = action.error.message;
      })
      // Delete post
      .addCase(deletePost.pending, (state) => {
        state.operationStatus = 'loading';
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.operationStatus = 'succeeded';
        postsAdapter.removeOne(state, action.payload);
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.operationStatus = 'failed';
        state.operationError = action.error.message;
      })
      // Reset database
      .addCase(resetSystem.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(resetSystem.fulfilled, (state, action) => {
        state.status = 'succeeded';
        postsAdapter.setAll(state, action.payload);
      })
      .addCase(resetSystem.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export const { clearErrors } = postsSlice.actions;

export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds
} = postsAdapter.getSelectors((state) => state.posts);

// Memoized derived selectors
export const selectFilteredPosts = createSelector(
  [
    selectAllPosts,
    (state) => state.platforms.entities,
    (state, selectedPlatform) => selectedPlatform,
    (state, selectedPlatform, searchQuery) => searchQuery,
    (state, selectedPlatform, searchQuery, statusFilter) => statusFilter
  ],
  (posts, platformEntities, selectedPlatform, searchQuery, statusFilter) => {
    return posts.filter((post) => {
      const platform = platformEntities[post.platformId];
      if (!platform || !platform.active) return false;
      if (selectedPlatform !== 'all' && post.platformId !== selectedPlatform) return false;
      
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = post.title.toLowerCase().includes(query);
        const matchContent = post.content.toLowerCase().includes(query);
        if (!matchTitle && !matchContent) return false;
      }

      if (statusFilter !== 'all' && post.status !== statusFilter) return false;
      return true;
    });
  }
);

export const selectPostStats = createSelector(
  [selectAllPosts, (state) => state.platforms.ids, (state) => state.platforms.entities],
  (posts, platformIds, platformEntities) => {
    const totalPosts = posts.length;
    const activePlatforms = platformIds.filter(id => platformEntities[id]?.active).length;
    const draftCount = posts.filter((p) => p.status === 'draft').length;
    const scheduledCount = posts.filter((p) => p.status === 'scheduled').length;
    const publishedCount = posts.filter((p) => p.status === 'published').length;

    return {
      totalPosts,
      activePlatforms,
      draftCount,
      scheduledCount,
      publishedCount
    };
  }
);

export default postsSlice.reducer;

