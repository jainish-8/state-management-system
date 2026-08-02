import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import { mockApi } from '../api/mockApi';

const platformsAdapter = createEntityAdapter();

export const fetchPlatforms = createAsyncThunk(
  'platforms/fetchPlatforms',
  async () => {
    return await mockApi.getPlatforms();
  }
);

export const togglePlatform = createAsyncThunk(
  'platforms/togglePlatform',
  async (id, { getState }) => {
    const state = getState();
    const platform = state.platforms.entities[id];
    if (!platform) throw new Error('Platform not found');
    
    // Calculate new list and update mock server
    const allPlatforms = Object.values(state.platforms.entities).map((p) =>
      p.id === id ? { ...p, active: !p.active } : p
    );
    await mockApi.savePlatforms(allPlatforms);
    return id;
  }
);

export const addPlatform = createAsyncThunk(
  'platforms/addPlatform',
  async (platformData, { getState }) => {
    const state = getState();
    const allPlatforms = [
      ...Object.values(state.platforms.entities),
      {
        ...platformData,
        id: platformData.name.toLowerCase().replace(/\s+/g, '-'),
        active: true
      }
    ];
    return await mockApi.savePlatforms(allPlatforms);
  }
);

const platformsSlice = createSlice({
  name: 'platforms',
  initialState: platformsAdapter.getInitialState({
    status: 'idle',
    error: null
  }),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlatforms.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPlatforms.fulfilled, (state, action) => {
        state.status = 'succeeded';
        platformsAdapter.setAll(state, action.payload);
      })
      .addCase(fetchPlatforms.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(togglePlatform.fulfilled, (state, action) => {
        const id = action.payload;
        const platform = state.entities[id];
        if (platform) {
          platform.active = !platform.active;
        }
      })
      .addCase(addPlatform.fulfilled, (state, action) => {
        platformsAdapter.setAll(state, action.payload);
      });
  }
});

export const {
  selectAll: selectAllPlatforms,
  selectById: selectPlatformById,
  selectIds: selectPlatformIds
} = platformsAdapter.getSelectors((state) => state.platforms);

export default platformsSlice.reducer;
