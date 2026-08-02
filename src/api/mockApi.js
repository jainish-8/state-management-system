const DEFAULT_PLATFORMS = [
  { id: 'twitter', name: 'X / Twitter', active: true, color: '#1da1f2', maxChars: 280 },
  { id: 'facebook', name: 'Facebook', active: true, color: '#1877f2', maxChars: 2000 },
  { id: 'instagram', name: 'Instagram', active: true, color: '#e1306c', maxChars: 2200 },
  { id: 'linkedin', name: 'LinkedIn', active: true, color: '#0077b5', maxChars: 3000 }
];

const DEFAULT_POSTS = [
  {
    id: '1',
    title: 'Announcing our new state management system',
    content: 'We are thrilled to launch our new centralized state management platform designed to make state handling scalable and predictable.',
    platformId: 'linkedin',
    status: 'published',
    scheduledAt: '',
    createdAt: '2026-08-01T10:00:00.000Z'
  },
  {
    id: '2',
    title: 'Redux Toolkit is awesome',
    content: 'Redux Toolkit makes global state management so much easier. Standardized practices, zero boilerplate, and built-in thunks.',
    platformId: 'twitter',
    status: 'scheduled',
    scheduledAt: '2026-08-03T12:00:00.000Z',
    createdAt: '2026-08-02T09:15:00.000Z'
  },
  {
    id: '3',
    title: 'Sneak peek of our dashboard design',
    content: 'Here is a quick draft of our premium dashboard interface. Clean layouts, dynamic statistics, and platform filtering.',
    platformId: 'instagram',
    status: 'draft',
    scheduledAt: '',
    createdAt: '2026-08-02T14:30:00.000Z'
  }
];

// Helper to interact with simulated DB in localStorage
const getStoredData = (key, defaults) => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaults));
    return defaults;
  }
  return JSON.parse(data);
};

const setStoredData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
  // Platforms endpoints
  getPlatforms: async () => {
    await delay();
    return getStoredData('sms_platforms', DEFAULT_PLATFORMS);
  },

  savePlatforms: async (platforms) => {
    await delay();
    setStoredData('sms_platforms', platforms);
    return platforms;
  },

  // Posts endpoints
  getPosts: async () => {
    await delay();
    return getStoredData('sms_posts', DEFAULT_POSTS);
  },

  createPost: async (postData) => {
    await delay();
    const posts = getStoredData('sms_posts', DEFAULT_POSTS);
    const newPost = {
      ...postData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    posts.push(newPost);
    setStoredData('sms_posts', posts);
    return newPost;
  },

  updatePost: async (id, updatedData) => {
    await delay();
    const posts = getStoredData('sms_posts', DEFAULT_POSTS);
    const index = posts.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Post not found');
    const updatedPost = { ...posts[index], ...updatedData };
    posts[index] = updatedPost;
    setStoredData('sms_posts', posts);
    return updatedPost;
  },

  deletePost: async (id) => {
    await delay();
    const posts = getStoredData('sms_posts', DEFAULT_POSTS);
    const filtered = posts.filter((p) => p.id !== id);
    setStoredData('sms_posts', filtered);
    return id;
  },

  // Reset database to default mock data
  resetDatabase: async () => {
    await delay();
    localStorage.setItem('sms_platforms', JSON.stringify(DEFAULT_PLATFORMS));
    localStorage.setItem('sms_posts', JSON.stringify(DEFAULT_POSTS));
    return { posts: DEFAULT_POSTS, platforms: DEFAULT_PLATFORMS };
  }
};
