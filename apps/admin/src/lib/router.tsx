import { createRouter } from '@tanstack/react-router';
import { ENV } from '@/config';
import { routeTree } from '../routeTree.gen';

// Create a new router instance
export const router = createRouter({
  basepath: ENV.BASE_URL === '/' ? '/' : ENV.BASE_URL.slice(0, -1),
  routeTree,
});
