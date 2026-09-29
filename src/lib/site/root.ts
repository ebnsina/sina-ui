import { resolve } from '$app/paths';
import type { PageId } from './nav';

/** The site's full address, base path included (on GitHub Pages, https://<user>.github.io/<repo>). */
export const root = (url: { origin: string }) => url.origin + resolve('/').slice(0, -1);

/** A nav page's address with the base path; one cast, since `resolve` can't take a union of routes. */
export const link = (href: PageId) => resolve(href as '/');
