import type { RouteId } from '$app/types';

/** A page with no parameters, so `resolve(href)` needs nothing else. */
export type PageId = Exclude<RouteId, `${string}[${string}`>;

// Docs navigation, grouped. Only components that exist are listed: no dead links.
export const nav: {
	title: string;
	items: { title: string; href: PageId; keywords?: string[]; pro?: boolean; template?: boolean }[];
}[] = [
	{
		title: 'Getting started',
		items: [
			{ title: 'Introduction', href: '/docs', keywords: ['home', 'overview', 'start'] },
			{
				title: 'Theming',
				href: '/theming',
				keywords: ['tokens', 'colors', 'colors', 'dark mode', 'css variables', 'brand', 'radius']
			},
			{
				title: 'Changelog',
				href: '/changelog',
				keywords: ['what’s new', 'release notes', 'updates']
			}
		]
	},
	{
		title: 'Buttons',
		items: [
			{ title: 'Button', href: '/components/button', keywords: ['action', 'submit'] },
			{
				title: 'Action button',
				href: '/components/action-button',
				keywords: ['async', 'loading', 'success', 'saving', 'done', 'status']
			},
			{
				title: 'Confirm button',
				href: '/components/confirm-button',
				keywords: ['are you sure', 'delete', 'destructive', 'two step']
			},
			{
				title: 'Copy button',
				href: '/components/copy-button',
				keywords: ['clipboard', 'copy to clipboard', 'copied']
			},
			{
				title: 'Hold to confirm',
				href: '/components/hold-to-confirm',
				keywords: ['long press', 'press and hold', 'destructive', 'delete']
			},
			{
				title: 'Split button',
				href: '/components/split-button',
				keywords: ['menu button', 'dropdown button', 'more actions']
			}
		]
	},
	{
		title: 'Forms',
		items: [
			{
				title: 'Calendar',
				href: '/components/calendar',
				keywords: ['month', 'date', 'hijri', 'range', 'day']
			},
			{ title: 'Checkbox', href: '/components/checkbox', keywords: ['tick', 'check'] },
			{
				title: 'Color picker',
				href: '/components/color-picker',
				keywords: ['color', 'color', 'hex', 'swatch', 'eyedropper', 'palette']
			},
			{
				title: 'Combobox',
				href: '/components/combobox',
				keywords: ['autocomplete', 'search', 'typeahead']
			},
			{
				title: 'Date picker',
				href: '/components/date-picker',
				keywords: [
					'natural language',
					'type a date',
					'tomorrow',
					'calendar',
					'date',
					'hijri',
					'bangla',
					'day'
				]
			},
			{
				title: 'Date range picker',
				href: '/components/date-range-picker',
				keywords: ['date range', 'from to', 'booking', 'period', 'calendar']
			},
			{
				title: 'File drop',
				href: '/components/file-drop',
				keywords: ['upload', 'attach', 'dropzone', 'drag and drop']
			},
			{ title: 'Form', href: '/components/form', keywords: ['validation', 'errors', 'submit'] },
			{
				title: 'Input',
				href: '/components/input',
				keywords: ['text field', 'textbox', 'input group', 'prefix', 'suffix', 'addon', 'icon']
			},
			{
				title: 'Mention input',
				href: '/components/mention-input',
				keywords: ['@mention', 'tag people', 'autocomplete', 'comment', 'textarea']
			},
			{
				title: 'Multi select',
				href: '/components/multi-select',
				keywords: ['multiple choice', 'chips', 'checklist', 'select many', 'tags']
			},
			{
				title: 'Number field',
				href: '/components/number-field',
				keywords: ['spinbutton', 'quantity', 'counter', 'stepper']
			},
			{
				title: 'OTP input',
				href: '/components/otp-input',
				keywords: ['one-time code', 'pin', 'verification', '2fa', 'sms']
			},
			{
				title: 'Password input',
				href: '/components/password-input',
				keywords: ['password', 'show hide', 'strength', 'sign in']
			},
			{
				title: 'Phone input',
				href: '/components/phone-input',
				keywords: ['telephone', 'mobile', 'country code', 'international', 'e164', 'tel']
			},
			{
				title: 'Radio cards',
				href: '/components/radio-cards',
				keywords: ['plan picker', 'choice cards', 'tiles', 'options']
			},
			{ title: 'Radio group', href: '/components/radio', keywords: ['options', 'choice'] },
			{
				title: 'Rich text editor',
				href: '/components/rich-text-editor',
				keywords: ['wysiwyg', 'tiptap', 'editor', 'formatting', 'bold', 'markdown']
			},
			{
				title: 'Search field',
				href: '/components/search-field',
				keywords: ['search', 'find', 'filter', 'clear']
			},
			{
				title: 'Segmented control',
				href: '/components/segmented',
				keywords: ['tabs', 'switcher', 'toggle']
			},
			{ title: 'Select', href: '/components/select', keywords: ['dropdown', 'picker', 'options'] },
			{
				title: 'Signature pad',
				href: '/components/signature-pad',
				keywords: ['sign', 'draw', 'e-signature', 'canvas', 'autograph']
			},
			{ title: 'Slider', href: '/components/slider', keywords: ['range'] },
			{ title: 'Switch', href: '/components/switch', keywords: ['toggle', 'on off'] },
			{
				title: 'Tag input',
				href: '/components/tag-input',
				keywords: ['chips', 'keywords', 'tags']
			},
			{
				title: 'Upload',
				href: '/components/upload',
				keywords: ['progress', 'file', 'send', 'tray', 'queue']
			},
			{
				title: 'Wheel picker',
				href: '/components/wheel-picker',
				keywords: ['ios', 'spinner', 'drum', 'picker', 'duration']
			},
			{ title: 'Textarea', href: '/components/textarea', keywords: ['multiline', 'comment'] },
			{
				title: 'Time field',
				href: '/components/time-field',
				keywords: ['time', 'clock', 'hour', 'minute', 'am pm', 'time range', 'duration']
			},
			{
				title: 'Toggle group',
				href: '/components/toggle-group',
				keywords: ['toolbar', 'bold italic', 'formatting']
			},
			{
				title: 'Toolbar',
				href: '/components/toolbar',
				keywords: ['formatting', 'actions', 'button bar', 'editor']
			}
		]
	},
	{
		title: 'Overlays',
		items: [
			{
				title: 'Alert dialog',
				href: '/components/alert-dialog',
				keywords: ['confirm', 'are you sure', 'delete', 'destructive']
			},
			{
				title: 'Command palette',
				href: '/components/command-palette',
				keywords: ['search', 'cmdk', 'spotlight', 'quick open', '⌘k']
			},
			{
				title: 'Context menu',
				href: '/components/context-menu',
				keywords: ['right click', 'long press', 'menu', 'actions']
			},
			{
				title: 'Dialog',
				href: '/components/dialog',
				keywords: ['modal', 'sheet', 'drawer', 'overlay']
			},
			{
				title: 'Drawer',
				href: '/components/drawer',
				keywords: ['bottom sheet', 'sheet', 'swipe', 'panel', 'mobile']
			},
			{ title: 'Dropdown', href: '/components/dropdown', keywords: ['menu', 'actions', 'more'] },
			{
				title: 'Hover card',
				href: '/components/hover-card',
				keywords: ['preview', 'profile card', 'link preview']
			},
			{ title: 'Popover', href: '/components/popover', keywords: ['overlay', 'floating'] },
			{ title: 'Tooltip', href: '/components/tooltip', keywords: ['hint', 'title'] }
		]
	},
	{
		title: 'Feedback',
		items: [
			{
				title: 'Announcement bar',
				href: '/components/announcement-bar',
				keywords: ['banner', 'top bar', 'promo', 'notice', 'dismiss']
			},
			{ title: 'Alert', href: '/components/alert', keywords: ['banner', 'callout', 'message'] },
			{
				title: 'Empty state',
				href: '/components/empty-state',
				keywords: ['blank', 'no results', 'zero state', 'nothing here']
			},
			{
				title: 'Meter',
				href: '/components/meter',
				keywords: ['gauge', 'usage', 'level', 'capacity']
			},
			{ title: 'Progress', href: '/components/progress', keywords: ['loader', 'loading bar'] },
			{
				title: 'Rolling number',
				href: '/components/rolling-number',
				keywords: ['odometer', 'counter', 'number flow', 'animated number']
			},
			{
				title: 'Skeleton',
				href: '/components/skeleton',
				keywords: ['placeholder', 'loading', 'shimmer']
			},
			{ title: 'Spinner', href: '/components/spinner', keywords: ['loader', 'loading', 'busy'] },
			{
				title: 'Toast',
				href: '/components/toast',
				keywords: ['notification', 'snackbar', 'message']
			}
		]
	},
	{
		title: 'Display',
		items: [
			{ title: 'Avatar', href: '/components/avatar', keywords: ['profile', 'picture', 'user'] },
			{
				title: 'Avatar group',
				href: '/components/avatar-group',
				keywords: ['stacked avatars', 'facepile', 'people', 'members']
			},
			{ title: 'Badge', href: '/components/badge', keywords: ['chip', 'label', 'status'] },
			{ title: 'Card', href: '/components/card', keywords: ['panel', 'tile'] },
			{
				title: 'Carousel',
				href: '/components/carousel',
				keywords: ['slider', 'slideshow', 'gallery', 'swipe']
			},
			{
				title: 'Chart',
				href: '/components/chart',
				keywords: ['graph', 'bar', 'line', 'pie', 'donut', 'radar', 'area', 'plot']
			},
			{
				title: 'Chat',
				href: '/components/chat',
				keywords: ['messages', 'conversation', 'thread', 'messenger', 'inbox', 'dm']
			},
			{
				title: 'Code block',
				href: '/components/code-block',
				keywords: ['syntax highlighting', 'code', 'snippet', 'line numbers', 'diff']
			},
			{
				title: 'Data table',
				href: '/components/data-table',
				keywords: ['data grid', 'sort', 'filter', 'paging', 'tanstack']
			},
			{
				title: 'Folder',
				href: '/components/folder',
				keywords: ['directory', 'files', 'drive', 'file manager']
			},
			{
				title: 'Kbd',
				href: '/components/kbd',
				keywords: ['keyboard', 'shortcut', 'hotkey', 'key']
			},
			{
				title: 'Mind map',
				href: '/components/mind-map',
				keywords: ['mindmap', 'brainstorm', 'tree', 'outline', 'diagram', 'topics']
			},
			{
				title: 'Resizable panels',
				href: '/components/resizable',
				keywords: ['split view', 'splitter', 'panes', 'resize', 'drag']
			},
			{
				title: 'Scroll area',
				href: '/components/scroll-area',
				keywords: ['scroll', 'overflow', 'more below', 'scroll indicator', 'fade']
			},
			{
				title: 'Separator',
				href: '/components/separator',
				keywords: ['divider', 'hr', 'rule', 'line']
			},
			{
				title: 'Sortable',
				href: '/components/sortable',
				keywords: ['drag and drop', 'dnd', 'reorder', 'sort', 'kanban', 'drag']
			},
			{ title: 'Table', href: '/components/table', keywords: ['rows', 'columns', 'html table'] },
			{
				title: 'Tag group',
				href: '/components/tag-group',
				keywords: ['chips', 'filters', 'pills', 'removable tags']
			},
			{
				title: 'Virtual list',
				href: '/components/virtual-list',
				keywords: ['virtualized', 'windowing', 'infinite scroll', 'long list', 'tanstack virtual']
			}
		]
	},
	{
		title: 'Media',
		items: [
			{
				title: 'Audio player',
				href: '/components/audio',
				keywords: ['music', 'podcast', 'sound', 'player', 'mp3', 'media session']
			},
			{
				title: 'Image',
				href: '/components/image',
				keywords: ['picture', 'photo', 'lazy', 'blur up', 'lightbox', 'zoom']
			},
			{
				title: 'Image compare',
				href: '/components/image-compare',
				keywords: ['before after', 'slider', 'comparison', 'split']
			},
			{
				title: 'Video',
				href: '/components/video',
				keywords: ['player', 'hls', 'dash', 'shaka', 'stream', 'captions', 'picture in picture']
			},
			{
				title: 'Visualizer',
				href: '/components/visualizer',
				keywords: ['audio', 'spectrum', 'waveform', 'equalizer', 'microphone', 'bars']
			}
		]
	},
	{
		title: 'Navigation',
		items: [
			{ title: 'Breadcrumb', href: '/components/breadcrumb', keywords: ['path', 'trail'] },
			{
				title: 'File tree',
				href: '/components/file-tree',
				keywords: ['tree view', 'folders', 'explorer', 'hierarchy']
			},
			{
				title: 'Menubar',
				href: '/components/menubar',
				keywords: ['menu bar', 'file edit view', 'app menu', 'commands']
			},
			{
				title: 'Navigation menu',
				href: '/components/navigation-menu',
				keywords: ['mega menu', 'site header', 'nav', 'dropdown links']
			},
			{ title: 'Pagination', href: '/components/pagination', keywords: ['pages', 'paging'] },
			{
				title: 'Sidebar layout',
				href: '/components/sidebar',
				keywords: ['app shell', 'navigation', 'rail', 'collapse', 'layout']
			},
			{
				title: 'Stepper',
				href: '/components/stepper',
				keywords: ['wizard', 'steps', 'progress', 'multi-step']
			},
			{ title: 'Tabs', href: '/components/tabs', keywords: ['tab bar'] }
		]
	},
	{
		title: 'Widgets',
		items: [
			{
				title: 'Alarm clock',
				href: '/widgets/alarm-clock',
				keywords: ['alarm', 'wake', 'snooze', 'reminder']
			},
			{
				title: 'Clock',
				href: '/widgets/clock',
				keywords: ['time', 'world clock', 'analog', 'digital']
			},
			{
				title: 'Dynamic island',
				href: '/widgets/dynamic-island',
				keywords: ['live activity', 'notch', 'pill', 'ios']
			},
			{
				title: 'Fluid orb',
				href: '/widgets/orb',
				keywords: ['voice', 'assistant', 'siri', 'ai orb', 'blob', 'listening', 'speaking']
			},
			{
				title: 'Hourglass',
				href: '/widgets/hourglass',
				keywords: ['sand timer', 'sand clock', 'egg timer']
			},
			{
				title: 'Stopwatch',
				href: '/widgets/stopwatch',
				keywords: ['lap', 'chronometer', 'elapsed']
			},
			{
				title: 'Timer',
				href: '/widgets/timer',
				keywords: ['countdown', 'pomodoro', 'kitchen timer']
			}
		]
	},
	{
		title: 'Blocks',
		items: [
			{
				title: 'AI chat',
				href: '/blocks/ai-chat',
				keywords: [
					'chatbot',
					'assistant',
					'claude',
					'llm',
					'tanstack ai',
					'streaming',
					'terminal',
					'agent'
				]
			},
			{
				title: 'AI media',
				href: '/blocks/ai-media',
				keywords: [
					'image generation',
					'text to speech',
					'tts',
					'transcription',
					'video',
					'tanstack ai'
				]
			},
			{
				title: 'Auth',
				href: '/blocks/auth',
				keywords: [
					'sign in',
					'login',
					'sign up',
					'register',
					'forgot password',
					'reset password',
					'verify',
					'otp'
				]
			},
			{
				title: 'Board',
				href: '/blocks/board',
				keywords: ['kanban', 'trello', 'drag and drop', 'tasks', 'cards', 'lists']
			},
			{
				title: 'Booking',
				href: '/blocks/booking',
				keywords: ['schedule', 'reservation', 'appointment', 'hotel', 'calendly', 'slots']
			},
			{
				title: 'Dashboard',
				href: '/blocks/dashboard',
				keywords: ['analytics', 'admin', 'stats', 'kpi', 'charts', 'overview', 'reports']
			},
			{
				title: 'File explorer',
				href: '/blocks/file-explorer',
				keywords: ['file manager', 'finder', 'explorer', 'files', 'folders', 'upload', 'drive']
			},
			{
				title: 'Messaging',
				href: '/blocks/messaging',
				keywords: [
					'chat app',
					'slack',
					'whatsapp',
					'channels',
					'team chat',
					'dm',
					'threads',
					'inbox',
					'workspace'
				]
			},
			{
				title: 'Notifications',
				href: '/blocks/notifications',
				keywords: ['inbox', 'bell', 'alerts', 'activity', 'unread']
			},
			{
				title: 'Settings',
				href: '/blocks/settings',
				keywords: [
					'account',
					'profile',
					'preferences',
					'security',
					'two factor',
					'sessions',
					'delete account'
				]
			},
			{
				title: 'Team',
				href: '/blocks/team',
				keywords: ['members', 'invite', 'roles', 'permissions', 'seats', 'organization']
			}
		]
	},
	{
		title: 'Pro',
		items: [
			{ title: 'Overview', href: '/pro', keywords: ['premium', 'paid', 'templates', 'buy'] },
			{
				title: 'Pricing',
				href: '/pro/pricing',
				pro: true,
				keywords: ['plans', 'billing', 'monthly', 'yearly', 'subscription', 'pro block']
			},
			{
				title: 'Agent chat',
				href: '/pro/agent-chat',
				pro: true,
				keywords: ['ai agent', 'tool calls', 'approvals', 'artifacts', 'llm', 'assistant', 'claude']
			},
			{
				title: 'Calendar',
				href: '/pro/calendar',
				pro: true,
				keywords: ['schedule', 'events', 'week view', 'month view', 'google calendar', 'agenda']
			},
			{
				title: 'Voice agent',
				href: '/pro/voice-agent',
				pro: true,
				keywords: ['voice', 'speech', 'realtime', 'call', 'transcript', 'ai agent', 'orb']
			},
			{
				title: 'Mail inbox',
				href: '/pro/mail',
				pro: true,
				keywords: ['email', 'gmail', 'inbox', 'compose', 'threads', 'mail client']
			},
			{
				title: 'CMS',
				href: '/pro/cms',
				pro: true,
				template: true,
				keywords: ['content', 'admin', 'posts', 'editor', 'publishing', 'media library']
			},
			{
				title: 'Blog',
				href: '/pro/blog',
				pro: true,
				template: true,
				keywords: ['magazine', 'editorial', 'articles', 'publication', 'rss']
			},
			{
				title: 'Marketing site',
				href: '/pro/marketing',
				pro: true,
				template: true,
				keywords: ['agency', 'studio', 'company site', 'portfolio', 'case studies', 'careers']
			},
			{
				title: 'E-commerce',
				href: '/pro/shop',
				pro: true,
				template: true,
				keywords: ['ecommerce', 'store', 'cart', 'checkout', 'products', 'shopify']
			},
			{
				title: 'AI agents',
				href: '/pro/ai-agents',
				pro: true,
				template: true,
				keywords: [
					'ai agents',
					'customer support',
					'sales agent',
					'helpdesk',
					'handover',
					'voice agent',
					'chatbot'
				]
			},
			{
				title: 'SaaS landing page',
				href: '/pro/saas-landing',
				pro: true,
				template: true,
				keywords: ['template', 'marketing site', 'homepage', 'hero', 'features', 'faq', 'startup']
			},
			{
				title: 'SaaS app',
				href: '/pro/saas-app',
				pro: true,
				template: true,
				keywords: [
					'template',
					'admin',
					'dashboard',
					'account',
					'settings',
					'billing',
					'team',
					'full app'
				]
			}
		]
	},
	{
		title: 'Disclosure',
		items: [
			{
				title: 'Accordion',
				href: '/components/accordion',
				keywords: ['collapse', 'expand', 'disclosure', 'faq']
			}
		]
	}
];

/** How much there is, counted from the nav so it never goes stale. */
const free = (titles: string[]) =>
	nav.filter((g) => titles.includes(g.title)).flatMap((g) => g.items).length;
const pro = nav.flatMap((g) => g.items).filter((i) => i.pro);
export const counts = {
	components: free(
		nav
			.map((g) => g.title)
			.filter((t) => !['Getting started', 'Widgets', 'Blocks', 'Pro'].includes(t))
	),
	widgets: free(['Widgets']),
	blocks: free(['Blocks']),
	proBlocks: pro.filter((i) => !i.template).length,
	templates: pro.filter((i) => i.template).length
};
