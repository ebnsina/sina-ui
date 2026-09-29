// One highlighter shared by SSR and the browser, so hydrated markup matches the server's exactly.
import { createHighlighter } from '@tanstack/highlight/core';
import { css } from '@tanstack/highlight/languages/css';
import { shell } from '@tanstack/highlight/languages/shell';
import { svelte } from '@tanstack/highlight/languages/svelte';
import { ts } from '@tanstack/highlight/languages/ts';

export const highlighter = createHighlighter({ languages: [css, shell, svelte, ts] });
