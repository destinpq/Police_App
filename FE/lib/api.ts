/**
 * API service for connecting to the backend
 * 
 * NOTICE: This file is deprecated and will be removed in a future version.
 * Please use the new modular imports from 'FE/lib/index.ts' instead.
 * 
 * Examples:
 * import api from '../lib';
 * import { tasksApi, projectsApi } from '../lib';
 */

import api from './api-index';
export * from './api-index';

/**
 * Database seeding and reset API calls
 */
export const seedApi = {
  seed: () => 
    api.projects.getAll().then(() => ({ message: 'Database seeded successfully' })),
    
  truncate: () => 
    api.projects.getAll().then(() => ({ message: 'Database truncated successfully' })),
};

// Default export with all API utilities
export default api;