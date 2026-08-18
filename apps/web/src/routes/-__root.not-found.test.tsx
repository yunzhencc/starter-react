import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Route } from './__root';

describe('root route', () => {
  it('renders a 404 page for an unknown path', async () => {
    const NotFoundPage = Route.options.notFoundComponent;
    if (!NotFoundPage) {
      throw new Error('Root route must configure a notFoundComponent');
    }

    render(<NotFoundPage />);

    expect(await screen.findByRole('heading', { name: 'Page not found' })).not.toBeNull();
  });
});
