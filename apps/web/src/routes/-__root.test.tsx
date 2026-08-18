import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { Route } from './__root';

describe('root document', () => {
  it('allows extension-injected attributes on the body during hydration', () => {
    const documentElement = Route.options.shellComponent!({ children: null }) as ReactElement<{ children: ReactElement[] }>;
    const body = documentElement.props.children[1];

    expect(body.props.suppressHydrationWarning).toBe(true);
  });
});
