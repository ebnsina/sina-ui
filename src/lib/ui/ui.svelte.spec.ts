import { page, userEvent } from 'vitest/browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { render as mount } from 'vitest-browser-svelte';
import type { Component } from 'svelte';
import axe from 'axe-core';
import '#lib/ui/tokens.css';
import '../../routes/docs.css';
import ButtonPage from '../../routes/components/button/+page.svelte';
import InputPage from '../../routes/components/input/+page.svelte';
import SwitchPage from '../../routes/components/switch/+page.svelte';
import DialogPage from '../../routes/components/dialog/+page.svelte';
import DropdownPage from '../../routes/components/dropdown/+page.svelte';
import TabsPage from '../../routes/components/tabs/+page.svelte';
import CheckboxPage from '../../routes/components/checkbox/+page.svelte';
import RadioPage from '../../routes/components/radio/+page.svelte';
import TextareaPage from '../../routes/components/textarea/+page.svelte';
import AccordionPage from '../../routes/components/accordion/+page.svelte';
import TooltipPage from '../../routes/components/tooltip/+page.svelte';
import PopoverPage from '../../routes/components/popover/+page.svelte';
import SelectPage from '../../routes/components/select/+page.svelte';
import ToastPage from '../../routes/components/toast/+page.svelte';
import { Toaster } from '#lib/ui/toast/index.js';
import FileExplorer from '#lib/blocks/file-explorer/FileExplorer.svelte';
import Board from '#lib/blocks/board/Board.svelte';
import BadgePage from '../../routes/components/badge/+page.svelte';
import AlertPage from '../../routes/components/alert/+page.svelte';
import CardPage from '../../routes/components/card/+page.svelte';
import ProgressPage from '../../routes/components/progress/+page.svelte';
import SkeletonPage from '../../routes/components/skeleton/+page.svelte';
import SliderPage from '../../routes/components/slider/+page.svelte';
import SegmentedPage from '../../routes/components/segmented/+page.svelte';
import ComboboxPage from '../../routes/components/combobox/+page.svelte';
import TablePage from '../../routes/components/table/+page.svelte';
import DataTablePage from '../../routes/components/data-table/+page.svelte';
import PaginationPage from '../../routes/components/pagination/+page.svelte';
import BreadcrumbPage from '../../routes/components/breadcrumb/+page.svelte';
import AvatarPage from '../../routes/components/avatar/+page.svelte';
import FormPage from '../../routes/components/form/+page.svelte';
import DatePickerPage from '../../routes/components/date-picker/+page.svelte';
import NumberFieldPage from '../../routes/components/number-field/+page.svelte';
import CommandPalettePage from '../../routes/components/command-palette/+page.svelte';
import ToggleGroupPage from '../../routes/components/toggle-group/+page.svelte';
import ChartPage from '../../routes/components/chart/+page.svelte';
import FileDropPage from '../../routes/components/file-drop/+page.svelte';
import TagInputPage from '../../routes/components/tag-input/+page.svelte';
import StepperPage from '../../routes/components/stepper/+page.svelte';
import OtpInputPage from '../../routes/components/otp-input/+page.svelte';
import UploadPage from '../../routes/components/upload/+page.svelte';
import FileTreePage from '../../routes/components/file-tree/+page.svelte';
import DrawerPage from '../../routes/components/drawer/+page.svelte';
import ContextMenuPage from '../../routes/components/context-menu/+page.svelte';
import HoverCardPage from '../../routes/components/hover-card/+page.svelte';
import CarouselPage from '../../routes/components/carousel/+page.svelte';
import SidebarPage from '../../routes/components/sidebar/+page.svelte';
import PasswordInputPage from '../../routes/components/password-input/+page.svelte';
import SearchFieldPage from '../../routes/components/search-field/+page.svelte';
import EmptyStatePage from '../../routes/components/empty-state/+page.svelte';
import SpinnerPage from '../../routes/components/spinner/+page.svelte';
import SeparatorPage from '../../routes/components/separator/+page.svelte';
import KbdPage from '../../routes/components/kbd/+page.svelte';
import DateRangePickerPage from '../../routes/components/date-range-picker/+page.svelte';
import TimeFieldPage from '../../routes/components/time-field/+page.svelte';
import ScrollAreaPage from '../../routes/components/scroll-area/+page.svelte';
import MeterPage from '../../routes/components/meter/+page.svelte';
import MenubarPage from '../../routes/components/menubar/+page.svelte';
import NavigationMenuPage from '../../routes/components/navigation-menu/+page.svelte';
import ResizablePage from '../../routes/components/resizable/+page.svelte';
import ColorPickerPage from '../../routes/components/color-picker/+page.svelte';
import ClockPage from '../../routes/widgets/clock/+page.svelte';
import StopwatchPage from '../../routes/widgets/stopwatch/+page.svelte';
import TimerPage from '../../routes/widgets/timer/+page.svelte';
import AlarmClockPage from '../../routes/widgets/alarm-clock/+page.svelte';
import HourglassPage from '../../routes/widgets/hourglass/+page.svelte';
import DynamicIslandPage from '../../routes/widgets/dynamic-island/+page.svelte';
import AiChatPage from '../../routes/blocks/ai-chat/+page.svelte';
import CalendarPage from '../../routes/blocks/calendar/+page.svelte';
import AiMediaPage from '../../routes/blocks/ai-media/+page.svelte';
import SortablePage from '../../routes/components/sortable/+page.svelte';
import BoardPage from '../../routes/blocks/board/+page.svelte';
import DashboardPage from '../../routes/blocks/dashboard/+page.svelte';
import OrbPage from '../../routes/widgets/orb/+page.svelte';
import CodeBlockPage from '../../routes/components/code-block/+page.svelte';
import FolderPage from '../../routes/components/folder/+page.svelte';
import FileExplorerPage from '../../routes/blocks/file-explorer/+page.svelte';
import CalendarCompPage from '../../routes/components/calendar/+page.svelte';
import WheelPickerPage from '../../routes/components/wheel-picker/+page.svelte';
import RollingNumberPage from '../../routes/components/rolling-number/+page.svelte';
import AlertDialogPage from '../../routes/components/alert-dialog/+page.svelte';
import VirtualListPage from '../../routes/components/virtual-list/+page.svelte';
import ToolbarPage from '../../routes/components/toolbar/+page.svelte';
import TagGroupPage from '../../routes/components/tag-group/+page.svelte';
import ThemingPage from '../../routes/theming/+page.svelte';
import ChangelogPage from '../../routes/changelog/+page.svelte';
import AlarmClock from '#lib/ui/AlarmClock.svelte';
import { colorName, hexToHsv, hsvToHex } from '#lib/ui/color.js';
import { tone } from '#lib/ui/Meter.svelte';
import { pageRange } from '#lib/ui/Pagination.svelte';
import { parseDate } from '#lib/ui/parse-date.js';
import { CalendarDate } from '@internationalized/date';

const pages = {
	ButtonPage,
	InputPage,
	SwitchPage,
	DialogPage,
	DropdownPage,
	TabsPage,
	CheckboxPage,
	RadioPage,
	TextareaPage,
	AccordionPage,
	TooltipPage,
	PopoverPage,
	SelectPage,
	ToastPage,
	BadgePage,
	AlertPage,
	CardPage,
	ProgressPage,
	SkeletonPage,
	SliderPage,
	SegmentedPage,
	ComboboxPage,
	TablePage,
	DataTablePage,
	PaginationPage,
	BreadcrumbPage,
	AvatarPage,
	FormPage,
	DatePickerPage,
	NumberFieldPage,
	CommandPalettePage,
	ToggleGroupPage,
	ChartPage,
	FileDropPage,
	TagInputPage,
	StepperPage,
	OtpInputPage,
	UploadPage,
	FileTreePage,
	DrawerPage,
	ContextMenuPage,
	HoverCardPage,
	CarouselPage,
	SidebarPage,
	PasswordInputPage,
	SearchFieldPage,
	EmptyStatePage,
	SpinnerPage,
	SeparatorPage,
	KbdPage,
	DateRangePickerPage,
	TimeFieldPage,
	ScrollAreaPage,
	MeterPage,
	MenubarPage,
	NavigationMenuPage,
	ResizablePage,
	ColorPickerPage,
	ClockPage,
	StopwatchPage,
	TimerPage,
	AlarmClockPage,
	HourglassPage,
	DynamicIslandPage,
	CalendarPage,
	AiChatPage,
	AiMediaPage,
	SortablePage,
	BoardPage,
	ChangelogPage,
	CalendarCompPage,
	WheelPickerPage,
	RollingNumberPage,
	AlertDialogPage,
	VirtualListPage,
	ToolbarPage,
	TagGroupPage,
	ThemingPage,
	DashboardPage,
	OrbPage,
	CodeBlockPage,
	FolderPage,
	FileExplorerPage
};

async function expectNoAxeViolations() {
	// Theme flips animate colours; let transitions settle so axe measures final values.
	await Promise.allSettled(
		document
			.getAnimations()
			.filter((a) => a instanceof CSSTransition)
			.map((a) => a.finished)
	);
	const { violations } = await axe.run(document, {
		runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']
	});
	expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`)).toEqual([]);
}

const focused = () => document.activeElement;

// Pages render the way the docs layout serves them: inside <main>, with the tokens loaded.
function render(Page: Component) {
	const r = mount(Page);
	const main = document.createElement('main');
	r.container.replaceWith(main);
	main.append(r.container);
	return r;
}

describe('sinaui', () => {
	// Theme and direction live on <html> and in storage, which outlive each render.
	beforeEach(async () => {
		delete document.documentElement.dataset.theme;
		document.documentElement.dir = 'ltr';
		localStorage.removeItem('theme');
		for (const m of document.querySelectorAll('body > main')) m.remove();
		// The pointer outlives each test: park it in a corner, off whatever the next page puts under it.
		let park = document.getElementById('park');
		if (!park) {
			park = document.createElement('div');
			park.id = 'park';
			park.style.cssText = 'position:fixed;top:0;left:0;width:4px;height:4px';
			document.body.append(park);
		}
		await userEvent.hover(park);
	});

	for (const [name, Page] of Object.entries(pages)) {
		it(`${name}: passes axe in light and dark`, async () => {
			render(Page);
			await expectNoAxeViolations();
			document.documentElement.dataset.theme = 'dark';
			await expectNoAxeViolations();
		});
	}

	it('dialog: modal and side sheet pass axe while open', async () => {
		render(DialogPage);
		await page.getByRole('button', { name: 'Edit scholar' }).click();
		await expect.element(page.getByRole('dialog', { name: 'Edit scholar' })).toBeVisible();
		await expectNoAxeViolations();
		await userEvent.keyboard('{Escape}');
		await page.getByRole('button', { name: 'Open reading rooms' }).click();
		const sheet = page.getByRole('dialog', { name: 'Reading rooms' });
		await expect.element(sheet).toBeVisible();
		await expect.element(sheet).toHaveAccessibleDescription('Where the manuscripts are kept.');
		await expectNoAxeViolations();
		await userEvent.keyboard('{Escape}');
		await expect.element(sheet).not.toBeInTheDocument();
	});

	it('tabs: arrows select, skip disabled, wrap, Home/End', async () => {
		render(TabsPage);
		const tab = (name: string) => page.getByRole('tab', { name });
		await tab('Ibn Sina').click();

		await userEvent.keyboard('{ArrowRight}');
		await expect.element(tab('Al-Khwarizmi')).toHaveAttribute('aria-selected', 'true');
		await expect.element(page.getByRole('tabpanel', { name: 'Al-Khwarizmi' })).toBeVisible();
		expect(focused()).toBe(tab('Al-Khwarizmi').element());

		await userEvent.keyboard('{ArrowRight}');
		await expect.element(tab('Fatima al-Fihri')).toHaveAttribute('aria-selected', 'true');
		await userEvent.keyboard('{ArrowRight}');
		await expect.element(tab('Ibn Sina')).toHaveAttribute('aria-selected', 'true');
		await userEvent.keyboard('{End}');
		await expect.element(tab('Fatima al-Fihri')).toHaveAttribute('aria-selected', 'true');
		await userEvent.keyboard('{Home}');
		await expect.element(tab('Ibn Sina')).toHaveAttribute('aria-selected', 'true');
		await expect.element(tab('Fatima al-Fihri')).toHaveAttribute('tabindex', '-1');
	});

	it('tabs: underline lands on the selected tab; pointer slides it, keyboard snaps', async () => {
		render(TabsPage);
		const tab = (name: string) => page.getByRole('tab', { name }).element() as HTMLElement;
		const bar = tab('Ibn Sina').parentElement!.querySelector<HTMLElement>('.bar')!;
		await page.getByRole('tab', { name: 'Al-Khwarizmi' }).click();
		await expect
			.poll(() => bar.style.transform)
			.toBe(`translateX(${tab('Al-Khwarizmi').offsetLeft}px)`);
		expect(bar.style.width).toBe(`${tab('Al-Khwarizmi').offsetWidth}px`);
		expect(bar.getAnimations().length).toBe(1);

		await userEvent.keyboard('{End}');
		await expect.poll(() => bar.style.width).toBe(`${tab('Fatima al-Fihri').offsetWidth}px`);
		expect(bar.getAnimations().length).toBe(0);
	});

	it('tabs: unset value selects first; manual mode moves focus without selecting', async () => {
		render(TabsPage);
		const tab = (name: string) => page.getByRole('tab', { name });
		await expect.element(tab('Light')).toHaveAttribute('aria-selected', 'true');

		(tab('Light').element() as HTMLElement).focus();
		await userEvent.keyboard('{ArrowDown}');
		expect(focused()).toBe(tab('Vision').element());
		await expect.element(tab('Vision')).toHaveAttribute('aria-selected', 'false');
		await userEvent.keyboard('{Enter}');
		await expect.element(tab('Vision')).toHaveAttribute('aria-selected', 'true');
	});

	it('tabs: arrow keys follow reading direction in RTL', async () => {
		document.documentElement.dir = 'rtl';
		render(TabsPage);
		await page.getByRole('tab', { name: 'Ibn Sina' }).click();
		await userEvent.keyboard('{ArrowLeft}');
		await expect
			.element(page.getByRole('tab', { name: 'Al-Khwarizmi' }))
			.toHaveAttribute('aria-selected', 'true');
	});

	it('dialog: Escape closes and focus returns to the trigger', async () => {
		render(DialogPage);
		const trigger = page.getByRole('button', { name: 'Edit scholar' });
		// Safari doesn't focus buttons on mouse click, so focus-return is a keyboard-user guarantee.
		(trigger.element() as HTMLElement).focus();
		await userEvent.keyboard('{Enter}');
		const dialog = page.getByRole('dialog', { name: 'Edit scholar' });
		await expect.element(dialog).toBeVisible();
		expect(dialog.element().contains(focused())).toBe(true);
		await expect
			.element(dialog)
			.toHaveAccessibleDescription('Changes appear in the House of Wisdom catalogue right away.');

		await userEvent.keyboard('{Escape}');
		await expect.element(dialog).not.toBeInTheDocument();
		expect(focused()).toBe(trigger.element());

		await trigger.click();
		await page.getByRole('button', { name: 'Close' }).click();
		await expect.element(dialog).not.toBeInTheDocument();
	});

	it('switch: label click and Space toggle; value submits with the form', async () => {
		render(SwitchPage);
		const sw = page.getByRole('switch', { name: 'Notify me of new translations' });
		await expect.element(sw).toBeChecked();
		await page.getByText('Notify me of new translations', { exact: true }).first().click();
		await expect.element(sw).not.toBeChecked();
		(sw.element() as HTMLElement).focus();
		await userEvent.keyboard(' ');
		await expect.element(sw).toBeChecked();
		const form = (sw.element() as HTMLInputElement).form!;
		expect(new FormData(form).get('notify')).toBe('on');
	});

	it('input: label, hint and error are wired for screen readers; focus follows the spec', async () => {
		render(InputPage);
		const name = page.getByRole('textbox', { name: 'Full name' });
		await expect
			.element(name)
			.toHaveAccessibleDescription('As it appears in the House of Wisdom register.');
		await expect.element(name).not.toHaveAttribute('aria-invalid');

		const email = page.getByRole('textbox', { name: 'Email' });
		await expect.element(email).toHaveAttribute('aria-invalid', 'true');
		await expect
			.element(email)
			.toHaveAccessibleDescription('Enter an email like khwarizmi@baytalhikma.org.');
		await email.fill('khwarizmi@baytalhikma.org');
		await expect.element(email).not.toHaveAttribute('aria-invalid');

		const el = name.element() as HTMLInputElement;
		expect(parseFloat(getComputedStyle(el).fontSize)).toBeGreaterThanOrEqual(16);
		// The border and ring belong to the box around the input (it holds start/end add-ons too).
		const box = el.parentElement!;
		const resting = getComputedStyle(box).borderBottomColor;
		// Chrome ignores modifier keys when deciding keyboard vs mouse; Escape (nothing is open) counts.
		await userEvent.keyboard('{Escape}');
		el.focus();
		await expect.poll(() => getComputedStyle(box).outlineWidth).toBe('2px');
		expect(getComputedStyle(box).outlineOffset).toBe('2px');
		// Same border at rest and on focus; only the ring changes.
		await expect.poll(() => getComputedStyle(box).borderBottomColor).toBe(resting);
	});

	it('button: loading shows only a spinner, keeps its name and width, blocks activation', async () => {
		render(ButtonPage);
		const btn = page.getByRole('button', { name: 'Transcribe' });
		const el = btn.element() as HTMLElement;
		const width = el.offsetWidth;
		el.focus();
		await userEvent.keyboard('{Enter}');
		await expect.element(btn).toHaveAttribute('aria-disabled', 'true');
		expect(el.querySelector('.spinner')).not.toBeNull();
		expect(el.offsetWidth).toBe(width);
		expect(focused()).toBe(el);
		await expect.element(page.getByRole('button', { name: 'Archived' })).toBeDisabled();
		await expect.element(page.getByRole('button', { name: 'Share manuscript' })).toBeVisible();
	});

	it('dropdown: menu button keyboard contract, selection and dismissal', async () => {
		render(DropdownPage);
		const trigger = page.getByRole('button', { name: 'Canon of Medicine' });
		const item = (name: string) => page.getByRole('menuitem', { name });
		await expect.element(trigger).toHaveAttribute('aria-haspopup', 'menu');
		await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');

		// Enter opens and focuses the first item; arrows wrap; letters jump.
		(trigger.element() as HTMLElement).focus();
		await userEvent.keyboard('{Enter}');
		await expect.element(page.getByRole('menu', { name: 'Canon of Medicine' })).toBeVisible();
		await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
		expect(focused()).toBe(item('Open').element());
		await userEvent.keyboard('{ArrowUp}');
		expect(focused()).toBe(item('Withdraw loan').element());
		await userEvent.keyboard('t');
		expect(focused()).toBe(item('Transcribe a copy').element());
		await expectNoAxeViolations();

		// Escape closes and hands focus back to the trigger.
		await userEvent.keyboard('{Escape}');
		await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
		expect(focused()).toBe(trigger.element());

		// ArrowUp on the trigger opens at the last item; choosing runs the action and closes.
		await userEvent.keyboard('{ArrowUp}');
		expect(focused()).toBe(item('Withdraw loan').element());
		await userEvent.keyboard('{Enter}');
		await expect
			.element(page.getByRole('status').filter({ hasText: 'Loan withdrawn.' }))
			.toBeVisible();
		await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
		expect(focused()).toBe(trigger.element());

		// Disabled items are announced but can't be chosen; an outside click dismisses.
		await trigger.click();
		// Clipped parts of the menu don't take clicks until the opening morph ends.
		const menu = page.getByRole('menu', { name: 'Canon of Medicine' }).element();
		await Promise.all(menu.getAnimations().map((a) => a.finished));
		// force: Playwright won't click aria-disabled elements; the point is that the menu ignores it.
		await item('Send to Córdoba').click({ force: true });
		await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
		await page.getByRole('heading', { name: 'Dropdown', exact: true }).click();
		await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
	});

	it('icons are real SVG in the markup, hidden from screen readers unless labelled', async () => {
		render(ButtonPage);
		const svg = page
			.getByRole('button', { name: 'Share manuscript' })
			.element()
			.querySelector('svg')!;
		expect(svg.getAttribute('aria-hidden')).toBe('true');
		expect(svg.querySelector('path')?.getAttribute('stroke-width')).toBe('1.5');
	});

	it('checkbox: select-all reflects its children as checked, mixed or unchecked', async () => {
		render(CheckboxPage);
		const all = page.getByRole('checkbox', { name: /Borrow all works/ });
		const canon = page.getByRole('checkbox', { name: 'The Canon of Medicine' });
		await expect.element(all).toBePartiallyChecked();
		await all.click();
		await expect.element(all).toBeChecked();
		await expect.element(page.getByRole('checkbox', { name: 'Al-Jabr' })).toBeChecked();
		await canon.click();
		await expect.element(all).toBePartiallyChecked();
		await all.click();
		await expect.element(canon).toBeChecked();
		await all.click();
		await expect.element(canon).not.toBeChecked();
		await expect.element(all).not.toBeChecked();
	});

	it('radio: one tab stop, arrows select, disabled skipped, groups never merge', async () => {
		render(RadioPage);
		const baghdad = page.getByRole('radio', { name: 'Bayt al-Hikma, Baghdad' });
		await expect.element(page.getByRole('group', { name: 'Reading room' })).toBeVisible();
		(baghdad.element() as HTMLElement).focus();
		await userEvent.keyboard('{ArrowDown}');
		await expect.element(page.getByRole('radio', { name: 'Library of Córdoba' })).toBeChecked();
		await expect.element(baghdad).not.toBeChecked();
		// Other groups keep their own selection: names are unique per group.
		await expect.element(page.getByRole('radio', { name: 'Naskh' })).toBeChecked();
		await expect
			.element(page.getByRole('radio', { name: 'Scribe' }))
			.toHaveAccessibleDescription('Hand-copied on paper from the Samarkand mills.');
		await expect.element(page.getByRole('radio', { name: 'Summary' })).toBeDisabled();
		// Group hint and error are read with the group; choosing clears the error.
		const copy = page.getByRole('group', { name: 'Script for the copy' });
		await expect
			.element(copy)
			.toHaveAccessibleDescription(
				'The copyist can write in one script per manuscript. Choose a script for the copy.'
			);
		await copy.getByText('Rayhani').click();
		await expect
			.element(copy)
			.toHaveAccessibleDescription('The copyist can write in one script per manuscript.');
	});

	it('textarea: error is announced until there is enough text', async () => {
		render(TextareaPage);
		const box = page.getByRole('textbox', { name: 'Summary of the work' });
		await expect.element(box).toHaveAttribute('aria-invalid', 'true');
		await box.fill('The Canon, book one: general principles.');
		await expect.element(box).not.toHaveAttribute('aria-invalid');
		const note = page.getByRole('textbox', { name: 'Marginal note' });
		await expect.element(note).toHaveAccessibleDescription('It grows as you write.');
		expect(parseFloat(getComputedStyle(note.element()).fontSize)).toBeGreaterThanOrEqual(16);
	});

	it('accordion: summaries toggle; exclusive keeps one open', async () => {
		render(AccordionPage);
		// .first(): titles also appear in the code sample below each preview.
		const who = page.getByText('Who worked there?').first();
		await who.click();
		await expect
			.element(page.getByText('Banu Musa brothers', { exact: false }).first())
			.toBeVisible();
		const algebra = page.getByText('Algebra', { exact: true }).first();
		const algorithm = page.getByText('Algorithm', { exact: true }).first();
		expect(algebra.element().closest('details')!.open).toBe(true);
		await algorithm.click();
		await expect.poll(() => algorithm.element().closest('details')!.open).toBe(true);
		expect(algebra.element().closest('details')!.open).toBe(false);
	});

	it('tooltip: names icon buttons; keyboard focus shows, Escape hides, hover waits', async () => {
		render(TooltipPage);
		const annotate = page.getByRole('button', { name: 'Annotate' });
		await expect.element(annotate).toBeVisible();
		const tip = () => document.querySelector<HTMLElement>('[role="tooltip"]:popover-open');

		// Keyboard focus shows it immediately; Escape dismisses without moving focus.
		// A keypress first, so the focus counts as keyboard focus (:focus-visible) in every engine;
		// Safari's Tab key skips buttons by default, so tabbing can't be relied on here.
		// Chrome ignores modifier keys when deciding keyboard vs mouse; Escape (nothing is open) counts.
		await userEvent.keyboard('{Escape}');
		(annotate.element() as HTMLElement).focus();
		await expect.poll(() => tip()?.textContent?.trim()).toBe('Annotate');
		await userEvent.keyboard('{Escape}');
		await expect.poll(() => tip()).toBeNull();
		expect(focused()).toBe(annotate.element());

		// Description mode: read after the button's own name.
		await expect
			.element(page.getByRole('button', { name: 'Borrow manuscript' }))
			.toHaveAccessibleDescription('Loans last forty days. Renew from your reading list.');

		// Hover waits a moment before showing.
		await page.getByRole('button', { name: 'Borrow manuscript' }).hover();
		expect(tip()).toBeNull();
		await expect
			.poll(() => tip()?.textContent?.trim())
			.toBe('Loans last forty days. Renew from your reading list.');
	});

	it('tooltip: opens on the requested side, arrow pointing at the trigger', async () => {
		render(TooltipPage);
		for (const side of ['top', 'right', 'bottom', 'left']) {
			const trigger = page
				.getByRole('button', { name: side, exact: true })
				.element() as HTMLElement;
			// Follow the trigger's own link to its tooltip; "any open tooltip" can match a stray one.
			const tip = document.getElementById(trigger.getAttribute('aria-describedby')!)!;
			// Chrome ignores modifier keys when deciding keyboard vs mouse; Escape (nothing is open) counts.
			await userEvent.keyboard('{Escape}');
			trigger.focus();
			await expect.poll(() => tip.matches(':popover-open')).toBe(true);
			expect(tip.dataset.side).toBe(side);
			const t = trigger.getBoundingClientRect();
			const r = tip.getBoundingClientRect();
			if (side === 'top') expect(r.bottom).toBeLessThanOrEqual(t.top);
			if (side === 'bottom') expect(r.top).toBeGreaterThanOrEqual(t.bottom);
			if (side === 'left') expect(r.right).toBeLessThanOrEqual(t.left);
			if (side === 'right') expect(r.left).toBeGreaterThanOrEqual(t.right);
			trigger.blur();
			await expect.poll(() => tip.matches(':popover-open')).toBe(false);
		}
	});

	it('radio: the dot pours for pointer choices and snaps for keyboard ones', async () => {
		render(RadioPage);
		const group = page.getByRole('group', { name: 'Reading room' }).element();
		// The drop: a head and five trailing droplets.
		const dotAnimations = () =>
			[...group.querySelectorAll('.drop > span')].flatMap((d) => d.getAnimations()).length;

		(page.getByRole('radio', { name: 'Bayt al-Hikma, Baghdad' }).element() as HTMLElement).focus();
		await userEvent.keyboard('{ArrowDown}');
		await expect.element(page.getByRole('radio', { name: 'Library of Córdoba' })).toBeChecked();
		expect(dotAnimations()).toBe(0);

		await page.getByRole('radio', { name: 'Al-Qarawiyyin, Fez' }).click();
		await expect.element(page.getByRole('radio', { name: 'Al-Qarawiyyin, Fez' })).toBeChecked();
		expect(dotAnimations()).toBe(6);
	});

	it('popover: focus moves in; Escape returns it; tabbing out closes', async () => {
		render(PopoverPage);
		const trigger = page.getByRole('button', { name: 'al-Khwarizmi' });
		await trigger.click();
		const panel = page.getByRole('dialog', { name: 'Muhammad ibn Musa al-Khwarizmi' });
		await expect.element(panel).toBeVisible();
		await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
		expect(panel.element().contains(focused())).toBe(true);
		await expectNoAxeViolations();
		await userEvent.keyboard('{Escape}');
		await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
		expect(focused()).toBe(trigger.element());

		const loan = page.getByRole('button', { name: /Loan:/ });
		await loan.click();
		const form = page.getByRole('dialog', { name: 'Extend the loan' });
		await expect.element(form).toBeVisible();
		await userEvent.keyboard('{Tab}{Tab}');
		await expect.element(loan).toHaveAttribute('aria-expanded', 'false');
	});

	it('select: labelled native select; the error clears once something is chosen', async () => {
		render(SelectPage);
		const room = page.getByRole('combobox', { name: 'Reading room' });
		await expect.element(room).toHaveAttribute('aria-invalid', 'true');
		await expect.element(room).toHaveAccessibleDescription('Choose where to read the manuscript.');
		await room.selectOptions('fez');
		await expect.element(room).not.toHaveAttribute('aria-invalid');
		const work = page.getByRole('combobox', { name: 'Work' });
		await expect.element(work).toHaveValue('canon');
		expect(parseFloat(getComputedStyle(work.element()).fontSize)).toBeGreaterThanOrEqual(16);
	});

	it('toast: announced in a live region; close and Undo work', async () => {
		render(ToastPage);
		render(Toaster);
		const region = page.getByRole('region', { name: 'Notifications' });
		await expect.element(region).toBeInTheDocument();
		expect(region.element().querySelector('[aria-live="polite"]')).not.toBeNull();

		await page.getByRole('button', { name: 'Error' }).click();
		await expect
			.element(region)
			.toHaveTextContent('Error: The Córdoba library is closed for the night.');
		await page.getByRole('button', { name: 'Dismiss notification' }).click();
		await expect.element(region).not.toHaveTextContent('Córdoba');
		// Let it finish leaving before the next toast arrives in its spot.
		await expect.poll(() => document.querySelectorAll('.toaster li').length).toBe(0);

		await page.getByRole('button', { name: 'Withdraw a loan' }).click();
		await expect.element(page.getByText('2 loans active')).toBeVisible();
		// Wait out the toast's slide-up: a transition starting from @starting-style can look still to the
		// click's stability check on its first frame, sending the click where the toast is about to be.
		await Promise.all(
			[...document.querySelectorAll('.toaster li')].flatMap((li) =>
				li.getAnimations().map((a) => a.finished)
			)
		);
		await page.getByRole('button', { name: 'Undo' }).last().click();
		await expect.element(page.getByText('3 loans active')).toBeVisible();
		await expect.element(region).not.toHaveTextContent('Loan withdrawn.');
	});

	it('custom select: combobox keyboard contract, typeahead, cancel, hidden input', async () => {
		render(SelectPage);
		const box = page.getByRole('combobox', { name: 'City to visit', exact: true });
		const el = box.element() as HTMLButtonElement;
		const active = () =>
			document.getElementById(el.getAttribute('aria-activedescendant') ?? '')?.textContent?.trim();

		el.focus();
		await userEvent.keyboard('{ArrowDown}');
		await expect.element(box).toHaveAttribute('aria-expanded', 'true');
		expect(focused()).toBe(el); // focus stays on the combobox
		expect(active()).toBe('Baghdad');
		await userEvent.keyboard('{ArrowDown}{ArrowDown}');
		expect(active()).toBe('Cairo');
		await userEvent.keyboard('{Escape}');
		await expect.element(box).toHaveAttribute('aria-expanded', 'false');
		await expect.element(box).toHaveTextContent('Choose a city'); // Escape changes nothing

		// Typeahead across letters: "sam" reaches Samarkand; Enter chooses.
		await userEvent.keyboard('sam');
		await expect.poll(active).toBe('Samarkand');
		await userEvent.keyboard('{Enter}');
		await expect.element(box).toHaveTextContent('Samarkand');
		expect(document.querySelector<HTMLSelectElement>('select[name="city"]')?.value).toBe(
			'samarkand'
		);

		// Disabled options are skipped; Tab chooses and moves on.
		const script = page.getByRole('combobox', { name: 'Script' });
		(script.element() as HTMLElement).focus();
		await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
		await expect.element(page.getByRole('option', { name: /Thuluth/ })).toHaveClass('active');
		await userEvent.keyboard('{Tab}');
		await expect.element(script).toHaveTextContent('Thuluth');
		await expect.element(script).toHaveAttribute('aria-expanded', 'false');

		// Pointer: click opens, clicking an option chooses it.
		await page.getByRole('combobox', { name: 'Ink' }).click();
		await page.getByRole('option', { name: 'Vermilion' }).click();
		await expect
			.element(page.getByRole('combobox', { name: 'Ink' }))
			.toHaveTextContent('Vermilion');
	});

	it('combobox: opened above, the list stays against the field as it shrinks', async () => {
		render(ComboboxPage);
		const box = page.getByRole('combobox', { name: 'City of study', exact: true });
		const el = box.element() as HTMLElement;
		// Field near the bottom of the screen: no room below, so the list opens above.
		scrollBy(0, el.getBoundingClientRect().bottom - innerHeight + 16);
		await box.click();
		await userEvent.keyboard('{ArrowDown}');
		const list = document
			.getElementById(el.getAttribute('aria-controls')!)!
			.closest<HTMLElement>('[popover]')!;
		await expect.poll(() => list.dataset.side).toBe('top');
		await userEvent.keyboard('dam');
		await expect
			.poll(() => el.getBoundingClientRect().top - list.getBoundingClientRect().bottom)
			.toBeLessThan(16);
	});

	it('combobox: filters as you type, ignores accents, undoes on Escape', async () => {
		render(ComboboxPage);
		const box = page.getByRole('combobox', { name: 'City of study', exact: true });
		const el = box.element() as HTMLInputElement;
		const active = () =>
			document.getElementById(el.getAttribute('aria-activedescendant') ?? '')?.textContent?.trim();
		const hidden = () => document.querySelector<HTMLSelectElement>('select[name="city"]')?.value;

		await box.click();
		await userEvent.keyboard('cordo');
		await expect.element(box).toHaveAttribute('aria-expanded', 'true');
		expect(focused()).toBe(el);
		await expect.poll(active).toBe('Córdoba');
		await expect.element(page.getByRole('status').first()).toHaveTextContent('1 result');
		await userEvent.keyboard('{Enter}');
		await expect.element(box).toHaveValue('Córdoba');
		expect(hidden()).toBe('cordoba');

		// Typing then Escape puts the last choice back; Escape again clears.
		await userEvent.fill(box, 'zzz');
		await expect.element(page.getByText('No matches', { exact: true })).toBeVisible();
		await userEvent.keyboard('{Escape}');
		await expect.element(box).toHaveValue('Córdoba');
		await expect.element(box).toHaveAttribute('aria-expanded', 'false');
		await userEvent.keyboard('{Escape}');
		await expect.element(box).toHaveValue('');
		expect(hidden()).toBe('');

		// Disabled options are skipped.
		const scholar = page.getByRole('combobox', { name: 'Scholar' });
		await scholar.click();
		await userEvent.fill(scholar, 'ibn');
		// Ibn Sīnā, Ibn al-Haytham, then Ibn Baṭṭūṭa (disabled): the highlight stops at al-Haytham.
		await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{Tab}');
		await expect.element(scholar).toHaveValue('Ibn al-Haytham');
	});

	it('data table: sorts with aria-sort, searches ignoring accents, pages', async () => {
		render(DataTablePage);
		const loans = page.getByRole('button', { name: 'Loans' });
		const header = () => loans.element().closest('th')!;
		const firstTitle = () =>
			loans.element().closest('table')!.querySelector('tbody tr td')!.textContent!.trim();

		// Numbers sort largest first on the first click.
		await loans.click();
		expect(header().getAttribute('aria-sort')).toBe('descending');
		expect(firstTitle()).toBe('The Canon of Medicine');
		await expect
			.element(page.getByRole('status').first())
			.toHaveTextContent('sorted by Loans, descending');
		await loans.click();
		expect(header().getAttribute('aria-sort')).toBe('ascending');
		expect(firstTitle()).toBe('Tabula Rogeriana');
		await loans.click();
		expect(header().hasAttribute('aria-sort')).toBe(false);

		// Search ignores accents; paging resets and hides when one page is left.
		const scholars = page.getByRole('region', { name: 'Scholars of the Golden Age' });
		const next = page.getByRole('button', { name: 'Next page' });
		await expect.element(page.getByText('1–8 of 16')).toBeVisible();
		await next.click();
		await expect.element(page.getByText('9–16 of 16')).toBeVisible();
		await userEvent.fill(page.getByRole('searchbox', { name: 'Search scholars' }), 'cordoba');
		await expect.element(scholars.getByRole('cell', { name: 'Ibn Rushd' })).toBeVisible();
		await expect.element(scholars.getByRole('cell', { name: 'Al-Zahrāwī' })).toBeVisible();
		await expect.element(next).not.toBeInTheDocument();
		await userEvent.fill(page.getByRole('searchbox', { name: 'Search scholars' }), 'zzz');
		await expect.element(scholars.getByRole('cell', { name: 'No matching rows' })).toBeVisible();
	});

	it('pagination: same number of items on every page, glides, bounds', async () => {
		// 24 pages, 1 sibling: always 7 items, gaps where pages are skipped.
		for (let p = 1; p <= 24; p++) expect(pageRange(p, 24).length).toBe(7);
		expect(pageRange(1, 24)).toEqual([1, 2, 3, 4, 5, 'gap', 24]);
		expect(pageRange(12, 24)).toEqual([1, 'gap', 11, 12, 13, 'gap', 24]);
		expect(pageRange(24, 24)).toEqual([1, 'gap', 20, 21, 22, 23, 24]);
		expect(pageRange(2, 5)).toEqual([1, 2, 3, 4, 5]);

		render(PaginationPage);
		const nav = page.getByRole('navigation', { name: 'Catalogue pages' });
		await expect
			.element(nav.getByRole('button', { name: 'Previous page' }))
			.toHaveAttribute('aria-disabled', 'true');
		await nav.getByRole('button', { name: 'Page 5' }).click();
		await expect
			.element(nav.getByRole('button', { name: 'Page 5' }))
			.toHaveAttribute('aria-current', 'page');
		await expect.element(page.getByText('Showing page 5 of')).toBeVisible();
		const marker = nav.element().querySelector<HTMLElement>('.highlight')!;
		expect(marker.getAnimations().filter((a) => !(a instanceof CSSTransition)).length).toBe(1);
		await nav.getByRole('button', { name: 'Next page' }).click();
		await expect
			.element(nav.getByRole('button', { name: 'Page 6' }))
			.toHaveAttribute('aria-current', 'page');

		// Link mode: real hrefs.
		const links = page.getByRole('navigation', { name: 'Manuscript pages' });
		await expect
			.element(links.getByRole('link', { name: 'Page 5' }))
			.toHaveAttribute('href', '?page=5#links');
	});

	it('breadcrumb and avatar: current page, initials and image fallback', async () => {
		render(BreadcrumbPage);
		const crumbs = page.getByRole('navigation', { name: 'Breadcrumb' }).first();
		await expect
			.element(crumbs.getByText('The Canon of Medicine'))
			.toHaveAttribute('aria-current', 'page');
		expect(crumbs.getByRole('link').elements().length).toBe(2);

		// Six levels: first, "…", parent, current. The menu holds the three hidden levels as links.
		const long = page.getByRole('navigation', { name: 'Breadcrumb, collapsed example' });
		expect(long.getByRole('link').elements().length).toBe(2);
		await long.getByRole('button', { name: 'Show 3 more levels' }).click();
		const hiddenLevels = page.getByRole('menuitem');
		await expect.element(hiddenLevels.first()).toHaveTextContent('Sciences');
		expect(hiddenLevels.elements().map((e) => e.getAttribute('href'))).toEqual([
			'#collapsed',
			'#collapsed',
			'#collapsed'
		]);
		await userEvent.keyboard('{Escape}');

		// A name cut short gets its full text as a tooltip; one that fits doesn't.
		const names = page.getByRole('navigation', { name: 'Breadcrumb, long names example' });
		const cut = names.getByRole('link', { name: 'Al-Bīrūnī: collected works and letters' });
		await expect.element(cut).toHaveAttribute('aria-labelledby');
		await expect
			.element(names.getByRole('link', { name: 'Astronomy' }))
			.not.toHaveAttribute('aria-labelledby');

		render(AvatarPage);
		await expect.element(page.getByRole('img', { name: 'Ibn Sīnā' })).toHaveTextContent('IS');
		// The broken picture is dropped and the initials stay.
		const broken = page.getByRole('img', { name: 'Fāṭima al-Fihrī' });
		await expect.poll(() => broken.element().querySelector('img')).toBeNull();
		await expect.element(broken).toHaveTextContent('FA');
		// The photo comes over the network, so only its presence is checked here, not its loading.
		await expect.element(page.getByRole('img', { name: 'Ebn Sina' })).toBeInTheDocument();
	});

	it('forms: errors on submit, focus the first, clear when fixed, server errors', async () => {
		render(FormPage);
		for (const id of ['simple-example', 'tanstack-example']) {
			const scope = page.elementLocator(
				document.getElementById(id)!.parentElement!.querySelector('form')!
			);
			const name = scope.getByRole('textbox', { name: 'Name' });
			const email = scope.getByRole('textbox', { name: 'Email' });

			// Tabbing past an empty field doesn't complain.
			(name.element() as HTMLElement).focus();
			await userEvent.tab();
			await expect.element(name).not.toHaveAttribute('aria-invalid');

			await scope.getByRole('button', { name: 'Send request' }).click();
			await expect.element(name).toHaveAttribute('aria-invalid', 'true');
			await expect.element(name).toHaveAccessibleDescription('Enter your name.');
			await expect.poll(() => document.activeElement).toBe(name.element());

			// Fixed: the error clears while typing.
			await userEvent.type(name, 'Maryam');
			await expect.element(name).not.toHaveAttribute('aria-invalid');

			await userEvent.fill(email, 'maryam');
			(name.element() as HTMLElement).focus();
			await expect
				.element(email)
				.toHaveAccessibleDescription('Enter an email address like ali@baytalhikma.org.');
			await userEvent.fill(email, 'maryam@aleppo.org');

			// The server's answer lands on the right field.
			await scope.getByRole('combobox', { name: 'Manuscript' }).selectOptions('canon');
			await scope.getByRole('checkbox', { name: /reading-room rules/ }).click();
			await scope.getByRole('button', { name: 'Send request' }).click();
			await expect
				.element(scope.getByRole('combobox', { name: 'Manuscript' }), { timeout: 3000 })
				.toHaveAccessibleDescription(/Every copy of the Canon is out/);

			await scope.getByRole('combobox', { name: 'Manuscript' }).selectOptions('optics');
			await scope.getByRole('button', { name: 'Send request' }).click();
			await expect
				.element(scope.getByRole('status').filter({ hasText: 'Request sent' }), {
					timeout: 3000
				})
				.toBeVisible();
		}
	});

	it('date picker: opens on today, arrows and pages move, Enter chooses, focus returns', async () => {
		render(DatePickerPage);
		const trigger = page.getByRole('button', { name: /Return date/ });
		await trigger.click();
		await expect.poll(() => document.activeElement?.getAttribute('aria-label')).toMatch(/, today$/);
		const start = document.activeElement!.getAttribute('data-date')!;
		await userEvent.keyboard('{ArrowDown}');
		await expect.poll(() => document.activeElement?.getAttribute('data-date')).not.toBe(start);
		const chosen = document.activeElement!.getAttribute('aria-label')!;
		await userEvent.keyboard('{Enter}');
		await expect.poll(() => document.activeElement).toBe(trigger.element());
		// The trigger reads the date in the locale's own format, e.g. "Oct 5, 2026".
		const [, month, day] = chosen.match(/, (\w+) (\d+),/)!;
		await expect.element(trigger).toHaveTextContent(`${month.slice(0, 3)} ${day},`);
		expect(document.querySelector<HTMLInputElement>('input[name="due"]')!.value).toMatch(
			/^\d{4}-\d{2}-\d{2}$/
		);

		// Hijri calendar in Arabic: Hijri year (هـ), Arabic digits, arrows follow right to left.
		await page.getByRole('button', { name: /موعد الزيارة/ }).click();
		const hijri = page.getByRole('grid', { name: /موعد الزيارة/ });
		await expect.element(hijri).toHaveAccessibleName(/هـ/);
		await expect.poll(() => document.activeElement?.textContent).toMatch(/^[٠-٩]+$/);
		const from = document.activeElement!.getAttribute('data-date')!;
		await userEvent.keyboard('{ArrowLeft}');
		await expect
			.poll(() => document.activeElement?.getAttribute('data-date'))
			.toBe(new Date(Date.parse(from) + 86400000).toISOString().slice(0, 10));
		await userEvent.keyboard('{Escape}');

		// Bangla calendar: a Bangabda month (বৈশাখ … চৈত্র) and Bangla digits.
		await page.getByRole('button', { name: /পরিদর্শনের তারিখ/ }).click();
		const bn = page.getByRole('grid', { name: /পরিদর্শনের তারিখ/ });
		await expect
			.element(bn)
			.toHaveAccessibleName(
				/(বৈশাখ|জ্যৈষ্ঠ|আষাঢ়|শ্রাবণ|ভাদ্র|আশ্বিন|কার্তিক|অগ্রহায়ণ|পৌষ|মাঘ|ফাল্গুন|চৈত্র) [০-৯]+$/
			);
		await expect.poll(() => document.activeElement?.textContent).toMatch(/^[০-৯]+$/);
		await expect.poll(() => document.activeElement?.getAttribute('aria-label')).toMatch(/বঙ্গাব্দ/);
		await userEvent.keyboard('{Escape}');

		// Six rows every month: paging never changes the calendar's height (no layout shift).
		const booking = page.getByRole('grid', { name: /Reading room visit/ }).element();
		const heights = new Set<number>();
		for (let i = 0; i < 12; i++) {
			heights.add(booking.getBoundingClientRect().height);
			await booking
				.closest<HTMLElement>('.calendar')!
				.querySelector<HTMLElement>('[aria-label="Next month"]')!
				.click();
		}
		expect(heights.size).toBe(1);
	});

	it('natural dates: phrases read relative to today', () => {
		const today = new CalendarDate(2026, 9, 28); // a Monday
		const read = (t: string) => parseDate(t, today)?.toString();
		expect(read('today')).toBe('2026-09-28');
		expect(read('Tomorrow')).toBe('2026-09-29');
		expect(read('in 3 days')).toBe('2026-10-01');
		expect(read('in a week')).toBe('2026-10-05');
		expect(read('2 weeks ago')).toBe('2026-09-14');
		expect(read('friday')).toBe('2026-10-02');
		expect(read('next fri')).toBe('2026-10-02');
		expect(read('monday')).toBe('2026-10-05');
		expect(read('this monday')).toBe('2026-09-28');
		expect(read('last friday')).toBe('2026-09-25');
		expect(read('next month')).toBe('2026-10-28');
		expect(read('15 june')).toBe('2027-06-15');
		expect(read('October 2')).toBe('2026-10-02');
		expect(read('2 oct 2030')).toBe('2030-10-02');
		expect(read('2026-10-02')).toBe('2026-10-02');
		expect(read('31 february')).toBeUndefined();
		expect(read('2026-13-01')).toBeUndefined();
		expect(read('someday')).toBeUndefined();

		// Bangla: words, Bangla or Latin digits, Gregorian and Bangabda months.
		expect(read('আগামীকাল')).toBe('2026-09-29');
		expect(read('পরশু')).toBe('2026-09-30');
		expect(read('৩ দিন পরে')).toBe('2026-10-01');
		expect(read('দুই সপ্তাহ আগে')).toBe('2026-09-14');
		expect(read('আগামী শুক্রবার')).toBe('2026-10-02');
		expect(read('গত রবিবার')).toBe('2026-09-27');
		expect(read('১৬ ডিসেম্বর')).toBe('2026-12-16');
		expect(read('পহেলা বৈশাখ')).toBe('2027-04-14');
		expect(read('১৫ শ্রাবণ')).toBe('2027-07-30');
		expect(read('৩১ কার্তিক')).toBeUndefined();
	});

	it('natural date field: shows the reading while typing, commits on Enter', async () => {
		render(DatePickerPage);
		const box = page.getByRole('textbox', { name: 'Return date' });
		await box.fill('in 3 days');
		const expected = new Intl.DateTimeFormat('en', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		}).format(Date.now() + 3 * 86400000);
		// Fridays are closed in this example, so either reading is right.
		await expect.element(box).toHaveAccessibleDescription(new RegExp(expected));
		await box.fill('someday');
		await expect.element(box).toHaveAccessibleDescription(/Not a date we can read yet/);
		await box.fill('tomorrow');
		await userEvent.keyboard('{Enter}');
		const hidden = () =>
			document.querySelector<HTMLInputElement>('input[name="natural-due"]')!.value;
		const tomorrow = new Date(Date.now() + 86400000);
		const isFriday = tomorrow.getDay() === 5;
		await expect.poll(hidden).toBe(isFriday ? '' : tomorrow.toLocaleDateString('en-CA'));

		// Clicking an example is the same as typing it: filled in, read, taken on Enter.
		await page.getByRole('button', { name: 'in 2 weeks' }).click();
		await expect.element(box).toHaveFocus();
		await expect.element(box).toHaveValue('in 2 weeks');
		await userEvent.keyboard('{Enter}');
		const inTwoWeeks = new Date(Date.now() + 14 * 86400000);
		if (inTwoWeeks.getDay() !== 5)
			await expect.poll(hidden).toBe(inTwoWeeks.toLocaleDateString('en-CA'));
	});

	it('number field: keys step and clamp, typing snaps, percent parses, holding repeats', async () => {
		render(NumberFieldPage);
		const copies = page.getByRole('textbox', { name: 'Copies to make' });
		const hidden = () => document.querySelector<HTMLInputElement>('input[name="copies"]')!.value;
		(copies.element() as HTMLElement).focus();
		await userEvent.keyboard('{ArrowUp}');
		expect(hidden()).toBe('4');
		await userEvent.keyboard('{PageUp}');
		expect(hidden()).toBe('14');
		await userEvent.keyboard('{End}');
		expect(hidden()).toBe('20');
		await expect
			.element(page.getByRole('button', { name: 'Increase Copies to make' }))
			.toHaveAttribute('aria-disabled', 'true');
		await userEvent.fill(copies, '99');
		await userEvent.keyboard('{Enter}');
		await expect.element(copies).toHaveValue('20');

		// Snaps to the step, keeps the unit.
		const ink = page.getByRole('textbox', { name: 'Ink per page' });
		await userEvent.fill(ink, '3.3');
		await userEvent.keyboard('{Enter}');
		await expect.poll(() => (ink.element() as HTMLInputElement).value).toMatch(/^3\.5 ?mL$/);

		// Percent: typing 15 means 15%.
		const discount = page.getByRole('textbox', { name: "Scholar's discount" });
		await userEvent.fill(discount, '15');
		await userEvent.keyboard('{Enter}');
		await expect.element(discount).toHaveValue('15%');

		// Holding + steps repeatedly, stopping at the max.
		(copies.element() as HTMLElement).focus();
		await userEvent.keyboard('{Home}');
		const plus = page.getByRole('button', { name: 'Increase Copies to make' }).element();
		plus.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
		await new Promise((ok) => setTimeout(ok, 1100));
		plus.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
		expect(Number(hidden())).toBeGreaterThan(4);
	});

	it('command palette: shortcut opens, ranks matches, wraps, runs and returns focus', async () => {
		render(CommandPalettePage);
		const trigger = page.getByRole('button', { name: /Open command palette/ });
		const box = page.getByRole('combobox', { name: 'Command palette' });
		const active = () =>
			document
				.getElementById(box.element().getAttribute('aria-activedescendant') ?? '')
				?.textContent?.trim();

		await trigger.click();
		await expect.element(page.getByRole('dialog', { name: 'Command palette' })).toBeVisible();
		await expect.poll(() => document.activeElement).toBe(box.element());
		const dialog = box.element().closest('dialog')!;
		const results = dialog.querySelector<HTMLElement>('.results')!;
		// Layout height, not the on-screen box: that one is still scaling in.
		const height = results.offsetHeight;

		await userEvent.type(box, 'qara');
		await expect.poll(active).toBe('Al-Qarawiyyīn, Fez');
		await expect
			.element(page.getByRole('status').filter({ hasText: /result/ }))
			.toHaveTextContent('1 result');
		expect(results.offsetHeight).toBe(height);
		await userEvent.fill(box, 'cordoba');
		await expect.poll(active).toBe('Library of Córdoba');
		await userEvent.fill(box, 'share');
		await expect.poll(active).toMatch(/^Copy link to this page/);
		await userEvent.fill(box, 'zzz');
		await expect.element(page.getByText('Nothing matches')).toBeVisible();

		// Empty query: all commands; ArrowUp from the first wraps to the last.
		await userEvent.fill(box, '');
		await userEvent.keyboard('{ArrowUp}');
		await expect.poll(active).toBe('Light theme');
		await userEvent.keyboard('{Escape}');
		await expect.poll(() => dialog.open).toBe(false);

		// Opened from the button by keyboard (Safari doesn't focus buttons on click), Enter runs the
		// command and focus returns to the button.
		(trigger.element() as HTMLElement).focus();
		await userEvent.keyboard('{Enter}');
		await userEvent.type(box, 'borrow');
		await userEvent.keyboard('{Enter}');
		await expect.element(page.getByText('Last command: Borrow a manuscript')).toBeVisible();
		await expect.poll(() => document.activeElement).toBe(trigger.element());
	});

	it('toggle group: one tab stop, arrows wrap and skip disabled, pressed state', async () => {
		render(ToggleGroupPage);
		const bold = page.getByRole('button', { name: 'Bold' });
		await expect.element(bold).toHaveAttribute('aria-pressed', 'true');
		const bar = page.getByRole('toolbar', { name: 'Text style' }).element();
		expect(bar.querySelectorAll('[tabindex="0"]').length).toBe(1);
		(bold.element() as HTMLElement).focus();
		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(() => document.activeElement?.getAttribute('aria-labelledby')).toBeTruthy();
		await userEvent.keyboard('{Enter}');
		await expect
			.element(page.getByRole('button', { name: 'Italic' }))
			.toHaveAttribute('aria-pressed', 'true');
		await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
		await expect.element(page.getByRole('button', { name: 'Strikethrough' })).toHaveFocus();

		// Text labels: the disabled button is skipped, and the group keeps its place.
		const latin = page.getByRole('button', { name: 'Latin' });
		(latin.element() as HTMLElement).focus();
		await userEvent.keyboard('{ArrowRight}{ArrowRight}');
		await expect.element(page.getByRole('button', { name: 'Arabic' })).toHaveFocus();
		await userEvent.keyboard(' ');
		await expect.element(page.getByText('Showing: latin')).toBeVisible();
	});

	it('chart: named and described by its visible title and takeaway', async () => {
		render(ChartPage);
		await expect
			.poll(() => document.querySelector('figure svg[aria-label="Loans per month"]'))
			.not.toBeNull();
		const svg = document.querySelector<SVGElement>('figure svg[aria-label="Loans per month"]')!;
		expect(svg.closest('figure')!.textContent).toContain('Loans dipped in April');
	});

	it('focus details: dialog opens on itself, mouse-opened menu highlights nothing, panels', async () => {
		render(DialogPage);
		await page.getByRole('button', { name: 'Edit scholar' }).click();
		const dialog = page.getByRole('dialog', { name: 'Edit scholar' });
		await expect.poll(() => document.activeElement).toBe(dialog.element());
		await userEvent.keyboard('{Escape}');

		render(DropdownPage);
		await page.getByRole('button', { name: 'More actions' }).click();
		await expect.poll(() => document.activeElement?.getAttribute('role')).toBe('menu');
		await userEvent.keyboard('{ArrowDown}');
		await expect.poll(() => document.activeElement?.getAttribute('role')).toBe('menuitem');
		await userEvent.keyboard('{Escape}');

		// A panel with a control inside stops being a Tab stop of its own.
		render(TabsPage);
		const tabs = page.getByRole('tablist', { name: 'Scholars' }).element().parentElement!;
		const panel = tabs.querySelector<HTMLElement>('[role="tabpanel"]:not([hidden])')!;
		expect(panel.getAttribute('tabindex')).toBe('0');
		panel.append(Object.assign(document.createElement('button'), { textContent: 'Borrow' }));
		await expect.poll(() => panel.hasAttribute('tabindex')).toBe(false);
	});

	it('file drop: choose and drop, checks type, size and count, removes', async () => {
		render(FileDropPage);
		const png = (name: string, bytes = 1200) =>
			new File([new Uint8Array(bytes)], name, { type: 'image/png' });
		const input = document.querySelector<HTMLInputElement>('input[name="scans"]')!;

		await userEvent.upload(input, [png('folio-1.png'), png('folio-2.png')]);
		await expect.element(page.getByRole('button', { name: 'Remove folio-1.png' })).toBeVisible();
		expect(input.files?.length).toBe(2);

		// Dropped files: wrong type and too big are turned away with the reason; the rest join.
		const dt = new DataTransfer();
		dt.items.add(png('folio-3.png'));
		dt.items.add(new File(['x'], 'notes.txt', { type: 'text/plain' }));
		dt.items.add(png('huge.png', 6_000_000));
		const zone = input.closest<HTMLElement>('.zone')!;
		zone.dispatchEvent(
			new DragEvent('dragenter', { bubbles: true, cancelable: true, dataTransfer: dt })
		);
		await expect.poll(() => zone.classList.contains('over')).toBe(true);
		zone.dispatchEvent(
			new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt })
		);
		await expect.element(page.getByText("notes.txt isn't a file type this takes.")).toBeVisible();
		await expect.element(page.getByText(/huge\.png is 6 MB; the limit is 5 MB/)).toBeVisible();
		expect(input.files?.length).toBe(3);

		// Removing keeps the real input in step.
		await page.getByRole('button', { name: 'Remove folio-2.png' }).click();
		await expect.poll(() => input.files?.length).toBe(2);
	});

	it('tag input: adds, dedupes, pastes lists, keyboard removal keeps focus', async () => {
		render(TagInputPage);
		const box = page.getByRole('textbox', { name: 'Subjects' });
		const tags = () =>
			[...document.querySelectorAll<HTMLInputElement>('input[name="subjects"]')].map(
				(i) => i.value
			);
		await userEvent.type(box, 'Medicine{Enter}');
		expect(tags()).toEqual(['Algebra', 'Optics', 'Medicine']);
		await userEvent.type(box, 'optics,');
		expect(tags()).toEqual(['Algebra', 'Optics', 'Medicine']);
		await expect.element(box).toHaveValue('');

		// Backspace in the empty box goes to the last tag; Backspace there removes it and focus moves on.
		await userEvent.keyboard('{Backspace}');
		await expect.element(page.getByRole('button', { name: 'Remove Medicine' })).toHaveFocus();
		await userEvent.keyboard('{Backspace}');
		expect(tags()).toEqual(['Algebra', 'Optics']);
		await expect.element(page.getByRole('button', { name: 'Remove Optics' })).toHaveFocus();
		await userEvent.keyboard('{ArrowLeft}');
		await expect.element(page.getByRole('button', { name: 'Remove Algebra' })).toHaveFocus();
		await userEvent.keyboard('{ArrowRight}{ArrowRight}');
		await expect.element(box).toHaveFocus();

		// The limit: three at most, then the box steps aside.
		const cite = page.getByRole('textbox', { name: 'Cite up to three scholars' });
		await userEvent.type(cite, 'Ibn Sīnā{Enter}Al-Kindī{Enter}Al-Rāzī{Enter}');
		await expect.element(cite).toBeDisabled();
	});

	it('stepper: progress, current step, going back, focus on the new step', async () => {
		render(StepperPage);
		const nav = page.getByRole('navigation', { name: 'Borrowing request' });
		const current = () => nav.element().querySelector('[aria-current="step"]')?.textContent;
		expect(current()).toMatch(/Step 1 of 4: Reader, current/);
		expect(nav.element().querySelectorAll('button').length).toBe(0);

		await page.getByRole('button', { name: 'Continue' }).click();
		await page.getByRole('button', { name: 'Continue' }).click();
		expect(current()).toMatch(/Step 3 of 4: Collection, current/);
		await expect.poll(() => document.activeElement?.textContent).toBe('Collection');

		// Finished steps are buttons back; upcoming ones are not.
		const back = nav.getByRole('button', { name: /Step 1 of 4: Reader, completed/ });
		await back.click();
		expect(current()).toMatch(/Step 1 of 4: Reader, current/);
		await expect.poll(() => document.activeElement?.textContent).toBe('Reader');
	});

	it('otp input: one field, filters, paste, complete, wrong code clears', async () => {
		render(OtpInputPage);
		const box = page.getByRole('textbox', { name: 'Verification code' });
		await expect.element(box).toHaveAttribute('autocomplete', 'one-time-code');
		await userEvent.type(box, '31a4');
		await expect.element(box).toHaveValue('314');
		await userEvent.fill(box, '99999');
		await userEvent.type(box, '9');
		await expect.element(box).toHaveAccessibleDescription(/That code isn't right/);
		await expect.element(box).toHaveValue('');
		await userEvent.fill(box, '314159');
		await expect.element(page.getByRole('status').filter({ hasText: 'Verified.' })).toBeVisible();

		const pickup = page.getByRole('textbox', { name: 'Pickup code' });
		await userEvent.type(pickup, 'b7-x2q');
		await expect.element(pickup).toHaveValue('B7X2');
	});

	it('upload: progress to done, failure with retry, cancel, tray summary', async () => {
		render(UploadPage);
		const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
		const png = (name: string) => new File([new Uint8Array(4000)], name, { type: 'image/png' });
		await userEvent.upload(input, [
			png('folio-1r.png'),
			png('folio-2-damaged.png'),
			png('binding.png')
		]);

		const bar = page.getByRole('progressbar', { name: 'folio-1r.png upload' });
		await expect.element(bar).toBeVisible();
		await page.getByRole('button', { name: 'Cancel binding.png' }).click();
		await expect
			.element(page.getByRole('listitem').filter({ hasText: 'binding.png' }))
			.toHaveTextContent(/Canceled/);
		await expect.element(bar, { timeout: 6000 }).toHaveAttribute('aria-valuenow', '100');
		await expect
			.element(page.getByText('The server couldn’t read this file. Try another copy.'), {
				timeout: 6000
			})
			.toBeVisible();
		await expect
			.element(page.getByRole('button', { name: 'Retry folio-2-damaged.png' }))
			.toBeVisible();

		// The tray: sample files, a summary heading, hide and show, close when settled.
		await page.getByRole('button', { name: 'Try with sample files' }).click();
		const tray = page.getByRole('region', { name: /Uploading 4 files/ });
		await expect.element(tray).toBeVisible();
		const toggle = page.getByRole('button', { name: 'Hide uploads' });
		await toggle.click();
		await expect
			.element(page.getByRole('button', { name: 'Show uploads' }))
			.toHaveAttribute('aria-expanded', 'false');
		await expect
			.element(page.getByRole('region', { name: '1 upload failed' }), { timeout: 8000 })
			.toBeVisible();
		await page.getByRole('button', { name: 'Close uploads' }).click();
		await expect.poll(() => document.querySelector('.tray')).toBeNull();
	});

	it('file tree: one tab stop, arrows walk, right opens, left closes and climbs, typeahead', async () => {
		render(FileTreePage);
		const tree = page.getByRole('tree', { name: 'Archive' });
		const item = (name: string | RegExp) =>
			tree.getByRole('treeitem', { name, exact: typeof name === 'string' });
		// Focus stays on the tree; the active row is named by aria-activedescendant.
		const active = (name: RegExp) =>
			expect
				.poll(() => tree.element().getAttribute('aria-activedescendant'))
				.toBe(item(name).element().id);
		expect(tree.element().getAttribute('tabindex')).toBe('0');
		expect(tree.element().querySelectorAll('[role="treeitem"][tabindex="0"]').length).toBe(0);
		await expect.element(item(/^Book one/)).toHaveAttribute('aria-selected', 'true');

		(tree.element() as HTMLElement).focus();
		await active(/^Book one/);
		await userEvent.keyboard('{ArrowDown}');
		await active(/^Book two/);
		// Left goes up to the folder; Left again closes it.
		await userEvent.keyboard('{ArrowLeft}');
		await active(/^The Canon of Medicine/);
		await userEvent.keyboard('{ArrowLeft}');
		await expect.element(item(/^The Canon of Medicine/)).toHaveAttribute('aria-expanded', 'false');
		// Typeahead reaches Optics; Right opens it, Right again steps in; Enter chooses.
		await userEvent.keyboard('opt');
		await active(/^Optics/);
		await userEvent.keyboard('{ArrowRight}');
		await expect.element(item(/^Optics/)).toHaveAttribute('aria-expanded', 'true');
		await userEvent.keyboard('{ArrowRight}{Enter}');
		await expect.element(item(/^Kitāb al-Manāẓir/)).toHaveAttribute('aria-selected', 'true');
		await expect.element(page.getByText('Selected: manazir')).toBeVisible();
	});

	it('drawer: opens on itself, short drag springs back, long drag closes, focus returns', async () => {
		render(DrawerPage);
		const trigger = page.getByRole('button', { name: 'Reading room hours' });
		(trigger.element() as HTMLElement).focus();
		await userEvent.keyboard('{Enter}');
		const sheet = page.getByRole('dialog', { name: 'Bayt al-Ḥikma, Baghdad' });
		await expect.poll(() => document.activeElement).toBe(sheet.element());
		const dialog = sheet.element() as HTMLDialogElement;
		const header = dialog.querySelector('header')!;
		const drag = (to: number) => {
			const at = (type: string, y: number) =>
				header.dispatchEvent(
					new PointerEvent(type, { bubbles: true, pointerId: 7, button: 0, clientY: y })
				);
			at('pointerdown', 100);
			for (let y = 110; y <= 100 + to; y += 20) at('pointermove', y);
			at('pointerup', 100 + to);
		};
		// A small nudge (under a flick): springs back. Synthetic moves are instant, so any real
		// distance would count as a flick, which closes on purpose.
		drag(10);
		await new Promise((ok) => setTimeout(ok, 50));
		expect(dialog.open).toBe(true);
		// Past 30% of its height: closes, and focus returns to the trigger.
		drag(dialog.offsetHeight);
		await expect.poll(() => dialog.open).toBe(false);
		await expect.poll(() => document.activeElement).toBe(trigger.element());
	});

	it('context menu: opens at the pointer, from the keyboard, returns focus, runs items', async () => {
		render(ContextMenuPage);
		const card = document.querySelector<HTMLElement>('.area')!;
		card.dispatchEvent(
			new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 40, clientY: 150 })
		);
		const menu = page.getByRole('menu', { name: 'Options for Book of Optics' });
		await expect.element(menu).toBeVisible();
		// Opens at the pointer (its inline position, not the scaling-in box). The test frame is
		// narrow; further right, the menu would rightly flip to fit.
		await expect.poll(() => parseFloat((menu.element() as HTMLElement).style.left)).toBe(40);
		await userEvent.keyboard('{Escape}');
		await expect.poll(() => document.activeElement).toBe(card);

		// Shift+F10 from the focused card; the first item is highlighted; Enter runs it.
		await userEvent.keyboard('{Shift>}{F10}{/Shift}');
		await expect.poll(() => document.activeElement?.textContent?.trim()).toBe('Open');
		await userEvent.keyboard('{ArrowDown}{Enter}');
		await expect.element(page.getByText('Last action: Copy link')).toBeVisible();
		await expect.poll(() => document.activeElement).toBe(card);
	});

	it('hover card: keyboard focus opens after a delay, Tab enters, Escape returns', async () => {
		render(HoverCardPage);
		const link = page.getByRole('link', { name: 'Ibn al-Haytham' });
		const card = document.querySelector<HTMLElement>('.card')!;
		// Keyboard focus (focus-visible). Not by Tab: Safari's Tab skips links by default.
		// Chrome ignores modifier keys when deciding keyboard vs mouse; Escape (nothing is open) counts.
		await userEvent.keyboard('{Escape}');
		(link.element() as HTMLElement).focus();
		expect(card.matches(':popover-open')).toBe(false);
		await expect.poll(() => card.matches(':popover-open'), { timeout: 2000 }).toBe(true);
		// Tab moves into the card, and it stays open. (Safari's Tab skips links by default, so
		// there focus moves in directly; staying open is what's checked.)
		const safari = /AppleWebKit/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
		if (safari) card.querySelector<HTMLElement>('a')!.focus();
		else await userEvent.keyboard('{Tab}');
		await expect.poll(() => card.contains(document.activeElement)).toBe(true);
		expect(card.matches(':popover-open')).toBe(true);
		await userEvent.keyboard('{Escape}');
		await expect.poll(() => card.matches(':popover-open')).toBe(false);
		await expect.poll(() => document.activeElement).toBe(link.element());

		// Pointer hover opens it too.
		link.element().dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse' }));
		await expect.poll(() => card.matches(':popover-open'), { timeout: 2000 }).toBe(true);
	});

	it('carousel: buttons and indicators move it, out-of-view slides are inert, pause toggles', async () => {
		render(CarouselPage);
		const c = page.getByRole('region', { name: 'Treasures of the House of Wisdom', exact: true });
		const slides = [...c.element().querySelectorAll<HTMLElement>('[aria-roledescription="slide"]')];
		const currentDot = () =>
			c.element().querySelector('[aria-current="true"]')?.getAttribute('aria-label');
		await expect
			.element(c.getByRole('button', { name: 'Previous slide' }))
			.toHaveAttribute('aria-disabled', 'true');
		expect(slides[1].inert).toBe(true);
		await c.getByRole('button', { name: 'Next slide' }).click();
		await expect.poll(currentDot, { timeout: 3000 }).toBe('Go to slide 2');
		await expect.poll(() => slides[1].inert).toBe(false);
		await c.getByRole('button', { name: 'Go to slide 5' }).click();
		await expect.poll(currentDot, { timeout: 3000 }).toBe('Go to slide 5');
		await expect
			.element(c.getByRole('button', { name: 'Next slide' }))
			.toHaveAttribute('aria-disabled', 'true');

		// Playing: a pause button that toggles.
		const pause = page.getByRole('button', { name: 'Pause slides' });
		await pause.click();
		await expect.element(page.getByRole('button', { name: 'Play slides' })).toBeVisible();
	});

	it('sidebar layout: current page, collapse to a named icon rail, shortcut', async () => {
		// Desktop width: narrower, the layout rightly switches to its menu.
		await page.viewport(1280, 900);
		render(SidebarPage);
		const nav = page.getByRole('navigation', { name: 'Library' });
		await expect
			.element(nav.getByRole('link', { name: 'Catalogue' }))
			.toHaveAttribute('aria-current', 'page');
		await nav.getByRole('link', { name: 'My loans' }).click();
		await expect
			.element(nav.getByRole('link', { name: 'My loans' }))
			.toHaveAttribute('aria-current', 'page');

		const toggle = page.getByRole('button', { name: /Collapse sidebar/ });
		await toggle.click();
		await expect
			.element(page.getByRole('button', { name: /Expand sidebar/ }))
			.toHaveAttribute('aria-expanded', 'false');
		// Collapsed: icons are still named, by their tooltips.
		await expect.element(nav.getByRole('link', { name: 'Bookings' })).toBeVisible();
		await userEvent.keyboard('{Control>}b{/Control}');
		await expect
			.element(page.getByRole('button', { name: /Collapse sidebar/ }))
			.toHaveAttribute('aria-expanded', 'true');
		await page.viewport(414, 896);
	});

	it('sidebar layout, narrow: a menu opens the links in a sheet, choosing closes it', async () => {
		await page.viewport(414, 896);
		render(SidebarPage);
		await page.getByRole('button', { name: 'Open Library' }).click();
		const sheet = page.getByRole('dialog', { name: 'Library' });
		await expect.element(sheet).toBeVisible();
		// Held while open: once closed, it's out of the accessibility tree.
		const dialog = sheet.element() as HTMLDialogElement;
		// Let it finish sliding in: a link still moving can be missed by the click.
		await expect.poll(() => dialog.getAnimations({ subtree: true }).length).toBe(0);
		await sheet.getByRole('link', { name: 'Fez' }).click();
		await expect.poll(() => dialog.open).toBe(false);
	});

	it('password input: show keeps the caret, strength rises', async () => {
		render(PasswordInputPage);
		const field = page.getByLabelText('Password', { exact: true });
		await userEvent.type(field, 'optics1021');
		const el = field.element() as HTMLInputElement;
		el.setSelectionRange(3, 3);
		const show = page.getByRole('button', { name: 'Show password' }).first();
		await show.click();
		await expect.element(show).toHaveAttribute('aria-pressed', 'true');
		expect(el.type).toBe('text');
		expect([el.selectionStart, el.selectionEnd]).toEqual([3, 3]);

		const fresh = page.getByLabelText('New password', { exact: true }).first();
		await userEvent.type(fresh, 'short');
		await expect.element(page.getByText('Strength: Too short')).toBeVisible();
		await userEvent.fill(fresh, 'houseofwis');
		await expect.element(page.getByText('Strength: Weak')).toBeVisible();
		await userEvent.fill(fresh, 'House-of-Wisdom-830');
		await expect.element(page.getByText('Strength: Strong')).toBeVisible();
	});

	it('password rules: tick off as met, name rejected, confirm must match', async () => {
		render(PasswordInputPage);
		const pw = page.getByLabelText('New password', { exact: true }).last();
		const list = page.getByRole('list', { name: 'Password requirements' });
		const unmet = () =>
			[...list.element().querySelectorAll('li:not(.met)')].map((li) =>
				li.textContent!.replace(', not yet met', '').trim()
			);
		await userEvent.fill(pw, 'maryam');
		await expect.poll(() => unmet().length).toBe(5);
		await userEvent.fill(pw, 'Maryam-Astrolabe-9');
		await expect.poll(unmet).toEqual(['Not your name']);
		await userEvent.fill(pw, 'Brasss-Astrolabe-9');
		await expect.poll(unmet).toEqual(['No character 3 times in a row']);
		await userEvent.fill(pw, 'Brass-Astrolabe-9');
		await expect.poll(unmet).toEqual([]);
		await expect.element(page.getByText('All requirements met.')).toBeInTheDocument();
		// The list is the field's description, so it's read with it.
		expect(pw.element().getAttribute('aria-describedby')).toContain(list.element().id);

		const confirm = page.getByLabelText('Confirm password', { exact: true });
		await userEvent.fill(confirm, 'Brass-Astrolabe');
		await userEvent.tab();
		await expect.element(confirm).toHaveAttribute('aria-invalid', 'true');
		await expect.element(confirm).toHaveAccessibleDescription("The passwords don't match.");
		await userEvent.fill(confirm, 'Brass-Astrolabe-9');
		await expect.element(confirm).not.toHaveAttribute('aria-invalid');
	});

	it('empty state: heading at its level; clearing returns results and focus', async () => {
		render(EmptyStatePage);
		const title = page.getByRole('heading', { name: 'No matches for “astrolabe”', level: 3 });
		await expect.element(title).toBeVisible();
		await page.getByRole('button', { name: 'Clear search' }).first().click();
		await expect.element(title).not.toBeInTheDocument();
		await expect
			.element(page.getByRole('searchbox', { name: 'Search the catalogue' }))
			.toHaveFocus();
		await expect.element(page.getByText('Book of Optics', { exact: true }).first()).toBeVisible();
	});

	it('spinner: named progress when labelled, hidden beside text; delay skips quick loads', async () => {
		render(SpinnerPage);
		expect(
			document.querySelectorAll('.spinner[role="progressbar"][aria-label="Loading"]').length
		).toBeGreaterThanOrEqual(4);
		expect(document.querySelector('.status .spinner')!.getAttribute('aria-hidden')).toBe('true');
		await page.getByRole('button', { name: 'Slow load' }).click();
		const spin = document.querySelector('.out .spinner') as HTMLElement;
		expect(getComputedStyle(spin).animationDelay).toContain('0.3s');
		await expect.element(page.getByText(/Loaded in 2,000/), { timeout: 4000 }).toBeVisible();
	});

	it('separator: horizontal and vertical roles; labelled one reads its words', async () => {
		render(SeparatorPage);
		const seps = page.getByRole('separator').all();
		expect(seps.length).toBe(3);
		expect(
			seps.filter((s) => s.element().getAttribute('aria-orientation') === 'vertical').length
		).toBe(2);
		await expect.element(page.getByText('or', { exact: true })).toBeVisible();
	});

	it('kbd: read by name, lights up while held', async () => {
		render(KbdPage);
		const redo = [...document.querySelectorAll('kbd.combo')][6] as HTMLElement;
		const spoken = redo.querySelector('.sr-only')!.textContent;
		expect(['Command+Shift+Z', 'Control+Shift+Z']).toContain(spoken);
		const shift = redo.querySelectorAll('kbd.key')[1];
		await userEvent.keyboard('{Shift>}');
		await expect.poll(() => shift.classList.contains('held')).toBe(true);
		await userEvent.keyboard('{/Shift}');
		await expect.poll(() => shift.classList.contains('held')).toBe(false);
	});

	it('date range: two clicks choose a span, Escape drops a half-chosen one, presets apply', async () => {
		render(DateRangePickerPage);
		const trigger = page.getByRole('button', { name: /Study leave/ });
		await trigger.click();
		const pop = () => document.querySelector<HTMLElement>('[popover]:popover-open')!;
		await expect.poll(() => pop()?.querySelectorAll('[role="grid"]').length).toBe(2);
		const days = () => [...pop().querySelectorAll<HTMLButtonElement>('.day:not([aria-disabled])')];
		// Keyboard: Enter on the start, Escape drops it (popover stays open), then choose again.
		await expect.poll(() => document.activeElement?.classList.contains('day')).toBe(true);
		await userEvent.keyboard('{Enter}');
		await userEvent.keyboard('{ArrowRight}{ArrowRight}');
		await expect.poll(() => pop().querySelectorAll('[aria-selected="true"]').length).toBe(3);
		await userEvent.keyboard('{Escape}');
		await expect.poll(() => pop().querySelectorAll('[aria-selected="true"]').length).toBe(0);
		expect(pop()).toBeTruthy();
		days()[2].click();
		days()[6].click();
		await expect.poll(() => document.querySelector('[popover]:popover-open')).toBeNull();
		await expect.element(page.getByText('4 nights away', { exact: false })).toBeVisible();

		await trigger.click();
		await page.getByRole('button', { name: 'Next 7 days' }).click();
		await expect.element(page.getByText('6 nights away', { exact: false })).toBeVisible();
	});

	it('date range: cannot span a closed day', async () => {
		render(DateRangePickerPage);
		await page.getByRole('button', { name: /Reading room booking/ }).click();
		const pop = () => document.querySelector<HTMLElement>('[popover]:popover-open')!;
		await expect.poll(() => pop()?.querySelector('.day')).toBeTruthy();
		// Friday columns are closed; after choosing a Saturday, the following Saturday is out of reach.
		const open = [...pop().querySelectorAll<HTMLButtonElement>('.day')].filter(
			(d) =>
				d.getAttribute('aria-disabled') !== 'true' && new Date(d.dataset.date!).getUTCDay() === 6
		);
		open[0].click();
		const nextSat = pop().querySelector<HTMLButtonElement>(
			`[data-date="${new Date(Date.parse(open[0].dataset.date!) + 7 * 864e5).toISOString().slice(0, 10)}"]`
		)!;
		await expect.poll(() => nextSat.getAttribute('aria-disabled')).toBe('true');
	});

	it('time field: typed digits fill and advance; arrows wrap; value follows', async () => {
		render(TimeFieldPage);
		const hour = page.getByRole('spinbutton', { name: 'Lecture starts hour' });
		const minute = page.getByRole('spinbutton', { name: 'Lecture starts minute' });
		const period = page.getByRole('spinbutton', { name: /Lecture starts AM\/PM/ });
		await expect.element(hour).toHaveAttribute('aria-valuetext', '9');
		await hour.click();
		await userEvent.keyboard('1045p');
		await expect.element(page.getByText('Stored as 22:45')).toBeVisible();
		await expect.element(period).toHaveFocus();
		// Up wraps 59 → 0 on minutes.
		minute.element().focus();
		await userEvent.keyboard('{End}{ArrowUp}');
		await expect.element(minute).toHaveAttribute('aria-valuetext', '0');
		// Backspace empties the part; the whole value is then unset.
		await userEvent.keyboard('{Backspace}');
		await expect.element(minute).toHaveAttribute('aria-valuetext', 'Empty');
		await expect.element(page.getByText('Not set', { exact: true })).toBeVisible();

		// Range: moving the start carries the end; an end before the start is an error, read with it.
		const start = page.getByRole('spinbutton', { name: 'Start hour' });
		const end = page.getByRole('spinbutton', { name: 'End hour' });
		start.element().focus();
		await userEvent.keyboard('{ArrowUp}');
		await expect.element(page.getByText('Stored as 09:00–18:30')).toBeVisible();
		end.element().focus();
		await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
		// The end's list starts after the start and says how long each option runs.
		await expect
			.element(page.getByRole('option', { name: /^6:30 PM \(9 hr, 30 min\)/ }))
			.toHaveAttribute('aria-selected', 'true');
		await expect.element(page.getByRole('option').first()).toHaveTextContent('9:15 AM(15 min)');
		await userEvent.keyboard('{Escape}');
		await expect.element(end).toHaveFocus();
		await userEvent.keyboard('8');
		await page.getByRole('spinbutton', { name: 'End AM/PM' }).click();
		await userEvent.keyboard('a');
		await expect.element(end).toHaveAttribute('aria-invalid', 'true');
		await expect.element(end).toHaveAccessibleDescription('The end has to be after the start.');
		await expect.element(page.getByText('Not set', { exact: true }).last()).toBeVisible();
	});

	it('scroll area: a named, focusable region; the arrow shows while there is more and scrolls on', async () => {
		render(ScrollAreaPage);
		const region = page.getByRole('region', { name: 'Reading room rules' });
		const el = region.element() as HTMLElement;
		expect(el.tabIndex).toBe(0);
		const more = el.parentElement!.querySelector<HTMLButtonElement>('.more')!;
		expect(more.getAttribute('aria-hidden')).toBe('true');
		await expect.poll(() => more.classList.contains('shown')).toBe(true);
		more.click();
		await expect.poll(() => el.scrollTop).toBeGreaterThan(100);
		el.scrollTo(0, el.scrollHeight);
		await expect.poll(() => more.classList.contains('shown')).toBe(false);
		// The edges fade only where there's more: the bottom is done, the top is not.
		await expect.poll(() => el.style.getPropertyValue('--scroll-end')).toBe('0');
		expect(el.style.getPropertyValue('--scroll-start')).toBe('1');
	});

	it('table: captioned, row headers, numbers right-aligned, scrolls as a region', async () => {
		render(TablePage);
		const table = page.getByRole('table', { name: 'Scholars of the Golden Age' });
		await expect.element(table).toBeVisible();
		await expect.element(table.getByRole('rowheader', { name: 'Al-Biruni' })).toBeVisible();
		const cell = table.getByRole('cell', { name: '1048' }).element();
		expect(getComputedStyle(cell).textAlign).toBe('end');
		expect(
			page.getByRole('region', { name: 'Scholars of the Golden Age' }).element().tabIndex
		).toBe(0);
	});

	it('select with search: focus moves into the box, names and descriptions match, Escape returns', async () => {
		render(ComboboxPage);
		const button = page.getByRole('combobox', { name: 'Mentor' });
		await button.click();
		const box = page.getByRole('combobox', { name: 'Search scholars' });
		await expect.element(box).toHaveFocus();
		await userEvent.keyboard('cordoba');
		const listbox = document.getElementById(box.element().getAttribute('aria-controls')!)!;
		const names = () =>
			[...listbox.querySelectorAll('[role="option"] .label')].map((o) => o.textContent);
		await expect.poll(names).toEqual(['Abbas ibn Firnas', 'Al-Zahrawi', 'Ibn Rushd']);
		await userEvent.keyboard('{ArrowDown}{Enter}');
		await expect.element(button).toHaveTextContent('Al-Zahrawi');
		await expect.element(button).toHaveFocus();
		// Nothing matching: a message, no empty list, and Enter does nothing.
		await button.click();
		await userEvent.keyboard('zzz');
		await expect.element(page.getByText('No scholar by that name', { exact: true })).toBeVisible();
		await userEvent.keyboard('{Enter}{Escape}');
		await expect.element(button).toHaveTextContent('Al-Zahrawi');
		await expect.element(button).toHaveFocus();
	});

	it('combobox with a server: pages load on scroll, the search is sent, the choice keeps its label', async () => {
		render(ComboboxPage);
		const box = page.getByRole('combobox', { name: 'Manuscript' });
		await box.click();
		const listbox = document.getElementById(box.element().getAttribute('aria-controls')!)!;
		const count = () => listbox.querySelectorAll('[role="option"]').length;
		await expect.poll(count, { timeout: 3000 }).toBe(40);
		const popup = listbox.closest<HTMLElement>('[popover]')!;
		popup.scrollTo(0, popup.scrollHeight);
		await expect.poll(count, { timeout: 3000 }).toBe(80);
		await userEvent.fill(box, 'cordoba copy 3');
		await expect
			.poll(() => listbox.querySelector('[role="option"]')?.textContent, { timeout: 3000 })
			.toContain('Córdoba copy 3');
		await userEvent.keyboard('{Enter}');
		await expect.element(box).toHaveValue('Optics, Córdoba copy 3');
	});

	it('meter: ranges follow HTML meter; value read with its label; colour follows the range', async () => {
		// Lower is better (optimum 0): under low good, between fair, over high poor.
		expect([45, 72, 93].map((v) => tone(v, 0, 100, 60, 85, 0))).toEqual(['good', 'fair', 'poor']);
		// Higher is better, and no ranges at all.
		expect(tone(3.5, 0, 20, 5, 12, 20)).toBe('poor');
		expect(tone(50, 0, 100)).toBe('good');

		render(MeterPage);
		const shelves = page.getByRole('meter', { name: 'Reading room shelves' });
		await expect.element(shelves).toHaveAttribute('aria-valuetext', '45%');
		const root = shelves.element().closest('.meter')!;
		expect(root.classList.contains('good')).toBe(true);
		await page.getByRole('button', { name: 'Shelve a delivery' }).click();
		await page.getByRole('button', { name: 'Shelve a delivery' }).click();
		await expect.element(shelves).toHaveAttribute('aria-valuetext', '75%');
		expect(root.classList.contains('fair')).toBe(true);
		await expect
			.element(page.getByRole('meter', { name: 'Ink in the copyists’ room' }))
			.toHaveAttribute('aria-valuetext', '3.5 L of 20 L');
	});

	it('menubar: one tab stop; arrows move along and carry an open menu; hover switches menus', async () => {
		render(MenubarPage);
		const bar = page.getByRole('menubar', { name: 'Manuscript editor' }).element();
		const names = [
			...bar.querySelectorAll<HTMLButtonElement>(':scope > button, button.name')
		].slice(0, 4);
		expect(names.map((b) => b.tabIndex)).toEqual([0, -1, -1, -1]);
		const expanded = () =>
			names.filter((b) => b.getAttribute('aria-expanded') === 'true').map((b) => b.textContent);
		names[0].focus();
		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(names[1]);
		expect(names.map((b) => b.tabIndex)).toEqual([-1, 0, -1, -1]);
		await userEvent.keyboard('{ArrowDown}');
		await expect.poll(expanded).toEqual(['Edit']);
		await expect.poll(() => document.activeElement?.textContent).toContain('Undo');
		// From inside a menu, Right opens the next one on its first item.
		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(expanded).toEqual(['View']);
		await expect.poll(() => document.activeElement?.textContent).toContain('Zoom in');
		await userEvent.keyboard('{Escape}');
		await expect.poll(expanded).toEqual([]);
		expect(document.activeElement).toBe(names[2]);
		// With one open, pointing at another name opens it instead.
		await userEvent.click(names[2]);
		await expect.poll(expanded).toEqual(['View']);
		await userEvent.hover(names[3]);
		await expect.poll(expanded).toEqual(['Help']);
	});

	it('navigation menu: disclosure buttons, Tab into the panel, Escape back, hover switches, outside closes', async () => {
		render(NavigationMenuPage);
		const nav = page.getByRole('navigation', { name: 'Main' });
		const collections = nav.getByRole('button', { name: 'Collections' });
		const scholars = nav.getByRole('button', { name: 'Scholars' });
		const panelOf = (b: typeof collections) =>
			document.getElementById(b.element().getAttribute('aria-controls')!)!;
		// Closed panels are out of reach: not focusable, not read.
		expect(panelOf(collections).inert).toBe(true);
		(collections.element() as HTMLElement).focus();
		await userEvent.keyboard('{Enter}');
		await expect.element(collections).toHaveAttribute('aria-expanded', 'true');
		// The panel's links are reachable (Safari's Tab skips links by default, so focus one directly).
		expect(panelOf(collections).inert).toBe(false);
		panelOf(collections).querySelector('a')!.focus();
		await expect.poll(() => panelOf(collections).contains(document.activeElement)).toBe(true);
		await userEvent.keyboard('{Escape}');
		await expect.element(collections).toHaveAttribute('aria-expanded', 'false');
		await expect.element(collections).toHaveFocus();
		// Hover: once one is open, the next opens straight away and the first closes.
		await userEvent.click(collections);
		await userEvent.hover(scholars);
		await expect.element(scholars).toHaveAttribute('aria-expanded', 'true');
		await expect.element(collections).toHaveAttribute('aria-expanded', 'false');
		await userEvent.click(page.getByRole('heading', { level: 1 }));
		await expect.element(scholars).toHaveAttribute('aria-expanded', 'false');
		await expect
			.element(nav.getByRole('link', { name: 'About' }))
			.toHaveAttribute('aria-current', 'page');
	});

	it('resizable: separator reports size; arrows, limits, collapse and reset; collapsed panel is inert', async () => {
		localStorage.removeItem('sinaui-reading-room');
		render(ResizablePage);
		const handle = page.getByRole('separator', { name: 'Resize the catalogue' });
		const el = handle.element() as HTMLElement;
		const value = () => Number(el.getAttribute('aria-valuenow'));
		await expect.poll(value).toBe(24);
		el.focus();
		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(value).toBe(29);
		await userEvent.keyboard('{Home}');
		await expect.poll(value).toBe(16);
		// Enter collapses the catalogue: out of reach while closed, and back where it was after.
		await userEvent.keyboard('{Enter}');
		await expect.poll(value).toBe(0);
		const catalogue = document.getElementById(el.getAttribute('aria-controls')!)!;
		expect(catalogue.inert).toBe(true);
		await userEvent.keyboard('{Enter}');
		await expect.poll(value).toBe(16);
		// The middle panel's 30% minimum stops the line.
		await userEvent.keyboard('{End}');
		await expect.poll(value).toBe(44);
		await userEvent.dblClick(el);
		await expect.poll(value).toBe(24);
		expect(JSON.parse(localStorage.getItem('sinaui-reading-room')!)[0]).toBe(24);
	});

	it('color: hex round trips, names in words', () => {
		for (const h of ['#047857', '#ffffff', '#000000', '#d9381e', '#1f4e9c'])
			expect(hsvToHex(hexToHsv(h)!)).toBe(h);
		expect(hsvToHex(hexToHsv('#abc')!)).toBe('#aabbcc');
		expect(hexToHsv('nope')).toBeUndefined();
		expect(
			['#047857', '#d9381e', '#1f4e9c', '#292d33', '#ffffff'].map((h) => colorName(hexToHsv(h)!))
		).toEqual(['green', 'red', 'blue', 'dark grey', 'white']);
	});

	it('color picker: 2D slider and hue by keyboard, named swatches, typed hex, hidden input', async () => {
		render(ColorPickerPage);
		const trigger = page.getByRole('button', { name: /Label colour/ });
		await expect.element(trigger).toHaveAccessibleName(/#1F4E9C ?, blue/i);
		await trigger.click();
		const area = page.getByRole('slider', { name: 'Colour' });
		await expect.element(area).toHaveAttribute('aria-roledescription', '2D slider');
		(area.element() as HTMLElement).focus();
		await userEvent.keyboard('{Shift>}{ArrowUp}{ArrowUp}{/Shift}');
		await expect
			.poll(() => area.element().getAttribute('aria-valuetext'))
			.toMatch(/brightness 81%/);
		const hue = page.getByRole('slider', { name: 'Hue' });
		(hue.element() as HTMLElement).focus();
		await userEvent.keyboard('{Home}');
		await expect.element(hue).toHaveAttribute('aria-valuetext', '0°, red');
		const hidden = () => (document.querySelector('input[name="color"]') as HTMLInputElement).value;
		await page.getByRole('button', { name: 'Vermilion' }).click();
		expect(hidden()).toBe('#d9381e');
		await expect
			.element(page.getByRole('button', { name: 'Vermilion' }))
			.toHaveAttribute('aria-pressed', 'true');
		const field = page.getByRole('textbox', { name: 'Hex' });
		await userEvent.fill(field, '3f8');
		expect(hidden()).toBe('#33ff88');
		await userEvent.fill(field, '3f8f7');
		await expect.element(field).toHaveAttribute('aria-invalid', 'true');
		await userEvent.fill(field, '3f8f7f');
		expect(hidden()).toBe('#3f8f7f');
		await expect
			.element(page.getByRole('button', { name: 'Verdigris' }))
			.toHaveAttribute('aria-pressed', 'true');
	});

	it('clock: shows the time once in the browser, read to the minute with its place', async () => {
		render(ClockPage);
		const baghdad = page.getByRole('img', { name: /^Baghdad, \d{1,2}:\d{2}\s?[AP]M$/ });
		await expect.element(baghdad).toBeVisible();
		await expect.element(page.getByText(/(ahead|behind|Same time)/).first()).toBeVisible();
	});

	it('stopwatch: start, laps newest first with fastest and slowest, stop, reset', async () => {
		render(StopwatchPage);
		const region = page.getByRole('region', { name: 'Experiment timer' });
		await region.getByRole('button', { name: 'Start' }).click();
		for (const wait of [120, 260, 60]) {
			await new Promise((r) => setTimeout(r, wait));
			await region.getByRole('button', { name: 'Lap' }).click();
		}
		const laps = region.getByRole('list', { name: 'Laps' });
		await expect.element(laps.getByText('fastest')).toBeVisible();
		await expect.element(laps.getByText('slowest')).toBeVisible();
		await region.getByRole('button', { name: 'Stop' }).click();
		const shown = region.getByRole('timer').element().textContent;
		await new Promise((r) => setTimeout(r, 150));
		expect(region.getByRole('timer').element().textContent).toBe(shown);
		await region.getByRole('button', { name: 'Reset' }).click();
		await expect.element(region.getByRole('timer')).toHaveTextContent('00:00.00');
		await expect.element(laps).not.toBeInTheDocument();
	});

	it('timer: the ruler is a slider in minutes; start, pause, resume, cancel', async () => {
		render(TimerPage);
		const region = page.getByRole('region', { name: 'Study timer' });
		const ruler = region.getByRole('slider', { name: 'Length' });
		await expect.element(ruler).toHaveAttribute('aria-valuetext', '15 minutes');
		(ruler.element() as HTMLElement).focus();
		await userEvent.keyboard('{ArrowRight}{ArrowRight}{PageDown}');
		await expect.element(ruler).toHaveAttribute('aria-valuetext', '12 minutes');
		const readout = region.getByRole('timer');
		await expect.element(readout).toHaveAccessibleName('12:00 set');
		await region.getByRole('button', { name: 'Start Timer' }).click();
		await expect.element(readout, { timeout: 3000 }).toHaveAccessibleName('11:59 left');
		// Locked while running.
		await expect.element(ruler).toHaveAttribute('aria-disabled', 'true');
		await region.getByRole('button', { name: 'Pause' }).click();
		await region.getByRole('button', { name: 'Resume' }).click();
		await region.getByRole('button', { name: 'Cancel timer' }).click();
		await expect.element(readout).toHaveAccessibleName('12:00 set');
	});

	it('hourglass: flip starts it, the sand runs, flipping again turns what fell into time left', async () => {
		render(HourglassPage);
		const region = page.getByRole('region', { name: 'Sand timer' });
		const readout = region.getByRole('timer');
		await expect.element(readout).toHaveAccessibleName('1:00 left');
		await region.getByRole('button', { name: 'Flip' }).click();
		await expect
			.element(region.getByRole('button', { name: 'Pause' }), { timeout: 3000 })
			.toBeVisible();
		await expect.element(readout, { timeout: 4000 }).toHaveAccessibleName('0:58 left');
		// Two seconds had fallen: turned over, those two seconds are what's left.
		await region.getByRole('button', { name: 'Flip' }).click();
		await expect.element(readout, { timeout: 3000 }).toHaveAccessibleName(/^0:0[1-3] left$/);
	});

	it('alarm clock: rings in its minute, snooze adds a one-off, stop closes', async () => {
		const n = new Date();
		const hhmm = `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`;
		mount(AlarmClock, { alarms: [{ id: 'a', time: hhmm, label: 'Test alarm', on: true }] });
		const dialog = page.getByRole('dialog', { name: 'Test alarm' });
		await expect.element(dialog, { timeout: 3000 }).toBeVisible();
		await dialog.getByRole('button', { name: /Snooze/ }).click();
		await expect.element(page.getByText('Test alarm (snoozed)')).toBeVisible();
		await expect.element(page.getByRole('switch', { name: /Test alarm at/ }).first()).toBeChecked();
	});

	it('dynamic island: activities spring in, open for details, Escape closes, nothing below moves', async () => {
		render(DynamicIslandPage);
		const island = page.getByRole('region', { name: 'Live activity' });
		await expect.element(island).toHaveAttribute('aria-live', 'polite');
		const width = () => island.element().getBoundingClientRect().width;
		const resting = width();
		const buttons = page.getByRole('group', { name: 'Start an activity' });
		// Measured from the island's zone, so content above settling late doesn't count as a move.
		const zone = island.element().parentElement!;
		const gap = () =>
			buttons.element().getBoundingClientRect().top - zone.getBoundingClientRect().top;
		const buttonsAt = gap();

		await page.getByRole('button', { name: 'Join reading circle' }).click();
		await expect.element(island.getByText('12 listening')).toBeVisible();
		await expect.poll(width, { timeout: 2000 }).toBeGreaterThan(resting + 60);
		// Tapping the island opens the details; its buttons work; Escape closes it.
		await island.getByRole('button', { name: 'Show details' }).click();
		const mute = island.getByRole('button', { name: 'Mute' });
		await expect.element(mute).toBeVisible();
		await mute.click();
		await expect
			.element(island.getByRole('button', { name: 'Unmute' }))
			.toHaveAttribute('aria-pressed', 'true');
		await userEvent.keyboard('{Escape}');
		await expect.element(island.getByRole('button', { name: 'Show details' })).toBeVisible();

		await page.getByRole('button', { name: 'Next prayer' }).click();
		await expect.element(island.getByText(/^in /)).toBeVisible();
		// The previous activity fades out (inert meanwhile) before it leaves the page.
		await expect.poll(() => island.element().querySelectorAll('.open').length).toBe(1);
		await island.getByRole('button', { name: 'Show details' }).click();
		await expect.element(island.getByText('Prayer times · Baghdad')).toBeVisible();
		// The switcher never moves as the island changes size.
		expect(gap()).toBe(buttonsAt);
		await page.getByRole('button', { name: 'Clear' }).click();
		await expect.element(island.getByText('Prayer times · Baghdad')).not.toBeInTheDocument();
	});

	it('calendar: New event adds one, it opens for editing, month view shows it, Delete removes it', async () => {
		localStorage.removeItem('sinaui-calendar');
		render(CalendarPage);
		const app = page.getByRole('region', { name: 'Calendar', exact: true });
		await app.getByRole('button', { name: 'New event' }).first().click();
		const dialog = page.getByRole('dialog', { name: 'New event' });
		// Saving without a name asks for one.
		await dialog.getByRole('button', { name: 'Save' }).click();
		await expect.element(dialog.getByText('Give the event a name.')).toBeVisible();
		await userEvent.fill(dialog.getByRole('textbox', { name: 'Title' }), 'Lecture on algebra');
		await dialog.getByRole('button', { name: 'Save' }).click();
		const event = app.getByRole('button', { name: /^Lecture on algebra,/ });
		await expect.element(event).toBeVisible();
		await app.getByRole('radio', { name: 'Month' }).click();
		await expect.element(app.getByRole('button', { name: /Lecture on algebra/ })).toBeVisible();
		await app.getByRole('button', { name: /Lecture on algebra/ }).click();
		await page
			.getByRole('dialog', { name: 'Edit event' })
			.getByRole('button', { name: 'Delete' })
			.click();
		await expect
			.element(app.getByRole('button', { name: /Lecture on algebra/ }))
			.not.toBeInTheDocument();
		localStorage.removeItem('sinaui-calendar');
	});

	it('sortable: Space picks up, arrows move, Space drops; Escape puts it back; focus stays', async () => {
		render(SortablePage);
		const list = page.getByRole('list', { name: 'Reading list' });
		const titles = () => [...list.element().querySelectorAll('strong')].map((s) => s.textContent);
		const handle = list.getByRole('button', { name: 'Move Book of Optics' });
		(handle.element() as HTMLElement).focus();
		await userEvent.keyboard(' ');
		await expect.element(handle).toHaveAttribute('aria-pressed', 'true');
		await userEvent.keyboard('{ArrowDown}{ArrowDown}');
		await expect
			.poll(titles)
			.toEqual([
				'The Compendious Book on Calculation',
				'The Canon of Medicine',
				'Book of Optics',
				'Book of Fixed Stars',
				'Book of Ingenious Devices'
			]);
		expect(focused()).toBe(handle.element());
		await userEvent.keyboard(' ');
		await expect.element(handle).toHaveAttribute('aria-pressed', 'false');
		// Picked up again and moved, Escape restores the dropped order.
		await userEvent.keyboard(' {ArrowUp}{Escape}');
		await expect.poll(() => titles()[2]).toBe('Book of Optics');
	});

	it('terminal agent: thinks, runs tools with results, answers; /help lists commands', async () => {
		render(AiChatPage);
		const term = page.getByRole('region', { name: 'Librarian terminal' });
		const box = term.getByRole('textbox', { name: 'Message' });
		await userEvent.fill(box, 'How did Ibn al-Haytham explain sight?');
		await userEvent.keyboard('{Enter}');
		await expect.element(term.getByText('search_catalogue("Ibn al-Haytham optics")')).toBeVisible();
		await expect.element(term.getByText('Found 3 manuscripts'), { timeout: 5000 }).toBeVisible();
		await expect
			.element(term.getByText(/Kitab al-Manazir \(MS-1021\)/), { timeout: 8000 })
			.toBeVisible();
		await expect.element(term.getByRole('log')).toHaveAttribute('aria-busy', 'false');
		await userEvent.fill(box, '/help');
		await userEvent.keyboard('{Enter}');
		await expect.element(term.getByText('Start a fresh conversation')).toBeVisible();
	});

	it('ai media: an image prompt makes two images; an empty prompt asks for one', async () => {
		render(AiMediaPage);
		const studio = page.getByRole('region', { name: 'Image generator' });
		await studio.getByRole('button', { name: 'Generate' }).click();
		await expect.element(studio.getByText('Describe what to draw.')).toBeVisible();
		await userEvent.fill(
			studio.getByRole('textbox', { name: 'Describe the image' }),
			'Courtyard tiles'
		);
		await studio.getByRole('button', { name: 'Generate' }).click();
		await expect
			.poll(() => studio.element().querySelectorAll('img').length, { timeout: 5000 })
			.toBe(2);
	});

	it('board: Space picks a card up, arrows move it across lists, Space drops; focus follows', async () => {
		localStorage.removeItem('sinaui-board');
		render(BoardPage);
		const board = page.getByRole('region', { name: 'Translation board' });
		const titles = (list: string) =>
			[
				...board
					.getByRole('list', { name: new RegExp(`^${list},`) })
					.element()
					.querySelectorAll('li:not([inert]) .title')
			].map((t) => t.textContent);
		const card = board.getByRole('button', { name: /Kalila and Dimna/ });
		(card.element() as HTMLElement).focus();
		await userEvent.keyboard(' ');
		await expect.element(card).toHaveAttribute('aria-pressed', 'true');
		await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowUp}');
		await expect
			.poll(() => titles('Checking'))
			.toEqual(['Kalila and Dimna', 'Aristotle, On the Soul']);
		expect((focused() as HTMLElement).dataset.card).toBe('kalila');
		await userEvent.keyboard(' ');
		await expect.element(card).toHaveAttribute('aria-pressed', 'false');
		localStorage.removeItem('sinaui-board');
	});

	it('board: a drop that fails to save goes back where it was picked up', async () => {
		const columns = [
			{ id: 'todo', title: 'To do', cards: [{ id: 'optics', title: 'Book of Optics' }] },
			{ id: 'done', title: 'Done', cards: [] }
		];
		let saved: unknown;
		mount(Board, {
			columns,
			onmove: (card, to) => {
				saved = { card: card.id, ...to };
				return Promise.reject(new Error('offline'));
			}
		});
		render(Toaster);
		const card = page.getByRole('button', { name: /Book of Optics/ });
		(card.element() as HTMLElement).focus();
		await userEvent.keyboard(' {ArrowRight} ');
		await expect.element(page.getByText('“Book of Optics” couldn’t be moved')).toBeVisible();
		expect(saved).toEqual({ card: 'optics', column: 'done', index: 0 });
		await expect.poll(() => columns[0].cards.map((c) => c.id)).toEqual(['optics']);
	});

	it('dropdown submenu: Right opens it on its first item; Escape comes back and keeps the menu open', async () => {
		render(DropdownPage);
		const trigger = page.getByRole('button', { name: /Book of Optics/ });
		(trigger.element() as HTMLElement).focus();
		await userEvent.keyboard('{ArrowDown}');
		await expect.poll(() => (focused() as HTMLElement).textContent?.trim()).toBe('Open');
		await userEvent.keyboard('{ArrowDown}{ArrowRight}');
		await expect.poll(() => (focused() as HTMLElement).textContent?.trim()).toBe('PDF');
		await userEvent.keyboard('{Escape}');
		await expect.poll(() => (focused() as HTMLElement).textContent?.trim()).toBe('Download as');
		await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
		await userEvent.keyboard('{Escape}');
		await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
	});

	it('dropdown submenu: a tap opens it and it stays open when the finger lifts', async () => {
		render(DropdownPage);
		await page.getByRole('button', { name: /Book of Optics/ }).click();
		const sub = page.getByRole('menuitem', { name: 'Download as' }).element() as HTMLElement;
		// What iOS sends for a tap: touch enter, click, then touch leave as the finger lifts.
		const touch = (type: string) =>
			sub.dispatchEvent(new PointerEvent(type, { pointerType: 'touch', bubbles: true }));
		touch('pointerenter');
		sub.click();
		touch('pointerleave');
		await new Promise((r) => setTimeout(r, 400));
		expect(sub.getAttribute('aria-expanded')).toBe('true');
	});

	it('dashboard: switching the period changes the numbers; overdue going up reads as bad news', async () => {
		render(DashboardPage);
		const stats = page.getByRole('list', { name: 'Key numbers' });
		const loans = () => stats.element().querySelector('li .value .sr-only')?.textContent;
		await expect.poll(loans).toBe('1,806');
		await page.getByRole('radio', { name: '7 days' }).click();
		await expect.poll(loans).toBe('420');
		// Overdue rose, and falling is its good direction: its badge is the danger tone.
		const overdue = [...stats.element().querySelectorAll('li')].find((li) =>
			li.textContent?.includes('Overdue')
		)!;
		expect(overdue.querySelector('.badge')?.classList.contains('danger')).toBe(true);
		// The loans table searches.
		await userEvent.fill(page.getByRole('searchbox', { name: 'Search loans' }), 'optics');
		await expect.element(page.getByRole('cell', { name: 'Book of Optics' })).toBeVisible();
		await expect
			.element(page.getByRole('cell', { name: 'Tabula Rogeriana' }))
			.not.toBeInTheDocument();
	});

	it('file explorer: Enter opens a folder, the menu moves a file, the path goes back', async () => {
		render(FileExplorerPage);
		const drive = page.elementLocator(document.querySelector('.explorer')!);
		const translations = drive.getByRole('button', { name: /^Translations/ });
		(translations.element() as HTMLElement).focus();
		await userEvent.keyboard('{Enter}');
		const path = drive.getByRole('navigation', { name: 'Folder path' });
		await expect.element(path).toHaveTextContent(/Translations/);
		await expect.element(drive.getByRole('button', { name: /^From Greek/ })).toBeVisible();
		// Back to the top by the path, then move the reading list into Letters from its menu.
		await path.getByRole('link', { name: 'Home' }).click();
		await drive.getByRole('button', { name: 'More for Reading list.docx' }).click();
		await page.getByRole('menuitem', { name: 'Move to', exact: true }).click();
		await page.getByRole('menuitem', { name: 'Letters' }).click();
		await expect.element(drive.getByText('Reading list.docx')).not.toBeInTheDocument();
		expect(drive.getByRole('button', { name: /^Letters/ }).element().textContent).toContain(
			'2 items'
		);
	});

	it('file explorer: shift-click chooses a run; the bar trashes them; undo brings them back', async () => {
		render(FileExplorerPage);
		render(Toaster);
		const drive = page.elementLocator(document.querySelector('.explorer')!);
		await drive.getByRole('button', { name: /^Observatory night/ }).click();
		await drive.getByRole('button', { name: /^Recitation/ }).click({ modifiers: ['Shift'] });
		const bar = drive.getByRole('toolbar', { name: 'Selection' });
		await expect.element(bar).toHaveTextContent('3 selected');
		await bar.getByRole('button', { name: 'Move to Trash' }).click();
		await expect.element(drive.getByText('Reading list.docx')).not.toBeInTheDocument();
		await page.getByRole('button', { name: 'Undo' }).last().click();
		await expect.element(drive.getByRole('button', { name: /^Reading list/ })).toBeVisible();
		// Delete from the keyboard, then restore it from the Trash.
		(drive.getByRole('button', { name: /^Reading list/ }).element() as HTMLElement).focus();
		await userEvent.keyboard('{Delete}');
		await expect.element(drive.getByText('Reading list.docx')).not.toBeInTheDocument();
		// The test frame is narrow, so the sidebar sits behind the menu button.
		await drive.getByRole('button', { name: 'Open Files' }).click();
		await page.getByRole('link', { name: 'Trash' }).click();
		await drive.getByRole('button', { name: 'More for Reading list.docx' }).click();
		await page.getByRole('menuitem', { name: 'Restore' }).click();
		await expect.element(drive.getByText('Reading list.docx')).not.toBeInTheDocument();
		await expect.element(drive.getByText('The Trash is empty')).toBeVisible();
	});

	it('file explorer: arrows move between items; a failed save is put back', async () => {
		const items = [
			{ id: 'a', name: 'Algebra.pdf', parent: null, modified: '2026-09-01' },
			{ id: 'b', name: 'Botany.pdf', parent: null, modified: '2026-09-02' }
		];
		mount(FileExplorer, {
			items,
			onchange: () => Promise.reject(new Error('offline'))
		});
		render(Toaster);
		const first = page.getByRole('button', { name: /^Algebra/ });
		await first.click();
		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(() => focused()?.textContent).toMatch(/Botany/);
		await userEvent.keyboard('{F2}');
		const dialog = page.getByRole('dialog', { name: 'Rename' });
		await dialog.getByRole('textbox', { name: 'Name' }).fill('Zoology.pdf');
		await dialog.getByRole('button', { name: 'Save' }).click();
		await expect.element(page.getByText('That change couldn’t be saved')).toBeVisible();
		expect(items[1].name).toBe('Botany.pdf');
	});

	it('code block: copies the code without its line numbers', async () => {
		// A stand-in clipboard: the test browser doesn't grant the real one.
		let copied = '';
		const real = Object.getOwnPropertyDescriptor(Navigator.prototype, 'clipboard');
		Object.defineProperty(navigator, 'clipboard', {
			configurable: true,
			value: { writeText: async (t: string) => void (copied = t) }
		});
		try {
			render(CodeBlockPage);
			const block = page
				.getByRole('region', { name: 'src/lib/astrolabe.ts' })
				.element()
				.closest('.codeblock')!;
			await page.elementLocator(block).getByRole('button', { name: 'Copy code' }).click();
			await expect
				.element(page.elementLocator(block).getByRole('button', { name: 'Copied' }))
				.toBeVisible();
			expect(copied.startsWith('// The angle of a star')).toBe(true);
			expect(copied).not.toMatch(/^1\n2\n/);
		} finally {
			delete (navigator as { clipboard?: unknown }).clipboard;
			if (real) Object.defineProperty(Navigator.prototype, 'clipboard', real);
		}
	});

	it('alert dialog: focus starts on Cancel; a failed confirm stays open with the reason; retry closes', async () => {
		render(AlertDialogPage);
		await page.getByRole('button', { name: 'Delete manuscript' }).click();
		const dialog = page.getByRole('alertdialog', { name: 'Delete this manuscript?' });
		await expect.element(dialog).toBeVisible();
		await expect.poll(() => (focused() as HTMLElement).textContent?.trim()).toBe('Cancel');
		await dialog.getByRole('button', { name: 'Delete' }).click();
		await expect
			.element(dialog.getByRole('alert'), { timeout: 3000 })
			.toHaveTextContent(/couldn't be reached/);
		await dialog.getByRole('button', { name: 'Delete' }).click();
		await expect.element(dialog, { timeout: 3000 }).not.toBeInTheDocument();
	});

	it('toolbar: one tab stop; arrows move along it and skip disabled controls', async () => {
		render(ToolbarPage);
		const bar = page.getByRole('toolbar', { name: 'Formatting' });
		const bold = bar.getByRole('button', { name: 'Bold' });
		(bold.element() as HTMLElement).focus();
		await userEvent.keyboard('{ArrowRight}');
		expect((focused() as HTMLElement).getAttribute('aria-label')).toBe('Italic');
		await userEvent.keyboard('{End}');
		expect((focused() as HTMLElement).textContent).toContain('Insert');
		// Undo, then Redo is disabled: Left from Insert skips it.
		await userEvent.keyboard('{ArrowLeft}');
		expect((focused() as HTMLElement).getAttribute('aria-label')).toBe('Undo');
		expect(bar.element().querySelectorAll('[tabindex="0"]').length).toBe(1);
	});

	it('tag group: Backspace removes the focused tag, focus moves to the next', async () => {
		render(TagGroupPage);
		const group = page.getByRole('list', { name: 'Filters' });
		const first = group.getByRole('button', { name: 'Remove Optics' });
		(first.element() as HTMLElement).focus();
		await userEvent.keyboard('{Backspace}');
		await expect
			.element(group.getByRole('button', { name: 'Remove Optics' }))
			.not.toBeInTheDocument();
		await expect
			.poll(() => (focused() as HTMLElement).getAttribute('aria-label'))
			.toBe('Remove Baghdad');
	});

	it('virtual list: ten thousand entries, only a few dozen in the page, each told its place', async () => {
		render(VirtualListPage);
		const list = page.getByRole('group', { name: 'Catalogue' });
		await expect
			.poll(() => list.element().querySelectorAll('[role="listitem"]').length)
			.toBeGreaterThan(5);
		expect(list.element().querySelectorAll('[role="listitem"]').length).toBeLessThan(60);
		const firstRow = list.element().querySelector('[role="listitem"]')!;
		expect(firstRow.getAttribute('aria-setsize')).toBe('10000');
		list.element().scrollTop = 200_000;
		await expect.poll(() => list.element().textContent).toContain('MS-04');
	});

	it('ai chat: suggestion sends, reply streams into a busy log, Stop keeps what came, New chat clears', async () => {
		render(AiChatPage);
		const chat = page.getByRole('region', { name: 'Ask the librarian', exact: true });
		const log = chat.getByRole('log', { name: 'Conversation' });
		await chat.getByRole('button', { name: 'What was the House of Wisdom?' }).click();
		// Busy while streaming, so screen readers wait for the whole reply.
		await expect.element(log).toHaveAttribute('aria-busy', 'true');
		await expect
			.element(chat.getByText(/translation centre of Abbasid Baghdad/), { timeout: 8000 })
			.toBeVisible();
		await expect.element(log, { timeout: 8000 }).toHaveAttribute('aria-busy', 'false');
		await expect.element(chat.getByRole('button', { name: 'Copy reply' })).toBeVisible();
		// Enter sends; Stop part way keeps the partial reply and gives Send back.
		const box = chat.getByRole('textbox', { name: 'Message' });
		await userEvent.fill(box, 'Tell me about optics');
		await userEvent.keyboard('{Enter}');
		await expect.element(chat.getByText(/Ibn al-Haytham/), { timeout: 5000 }).toBeVisible();
		await chat.getByRole('button', { name: 'Stop the reply' }).click();
		await expect.element(chat.getByRole('button', { name: 'Send' })).toBeVisible();
		expect(chat.getByRole('article').all().length).toBe(4);
		await chat.getByRole('button', { name: 'New chat' }).click();
		await expect.element(chat.getByText('How can I help you today?')).toBeVisible();
	});

	it('search field: clear appears with text, clears and refocuses; Escape clears', async () => {
		render(SearchFieldPage);
		const box = page.getByRole('searchbox', { name: 'Search the catalogue' });
		// Hidden (and out of the accessibility tree) until there's text to clear.
		const clearEl = document.querySelector<HTMLButtonElement>('button[aria-label="Clear search"]')!;
		expect(clearEl.tabIndex).toBe(-1);
		const clear = page.getByRole('button', { name: 'Clear search' });
		await userEvent.type(box, 'optics');
		const results = () =>
			[...box.element().closest('.stack')!.querySelectorAll('li')].map((li) => li.textContent);
		await expect.poll(results).toEqual(['Book of Optics']);
		await clear.click();
		await expect.element(box).toHaveValue('');
		await expect.element(box).toHaveFocus();
		await userEvent.type(box, 'jabr{Escape}');
		await expect.element(box).toHaveValue('');

		render(InputPage);
		const site = page.getByRole('textbox', { name: 'Library website' });
		const control = site.element().parentElement!;
		expect(control.textContent).toContain('https://');
		expect(control.textContent).toContain('.org');
	});

	it('segmented: arrows choose and snap; a click glides the thumb', async () => {
		render(SegmentedPage);
		const both = page.getByRole('radio', { name: 'Side by side' });
		await expect.element(both).toBeChecked();
		await expect.element(page.getByRole('group', { name: 'Text shown' })).toBeVisible();
		(both.element() as HTMLElement).focus();
		await userEvent.keyboard('{ArrowLeft}');
		await expect.element(page.getByRole('radio', { name: 'Latin' })).toBeChecked();
		await expect.element(page.getByText('Showing: Latin')).toBeVisible();
		const thumb = both.element().closest('.track')!.querySelector<HTMLElement>('.thumb')!;
		expect(thumb.getAnimations().filter((a) => !(a instanceof CSSTransition)).length).toBe(0);
		// The invisible radio covers its segment, so a click lands on the real control.
		await page.getByRole('radio', { name: 'Arabic' }).click();
		await expect.element(page.getByRole('radio', { name: 'Arabic' })).toBeChecked();
		expect(thumb.getAnimations().filter((a) => !(a instanceof CSSTransition)).length).toBe(1);
	});

	it('slider: keyboard changes the value and screen readers hear the units', async () => {
		render(SliderPage);
		const loan = page.getByRole('slider', { name: 'Loan length' });
		await expect.element(loan).toHaveAttribute('aria-valuetext', '40 days');
		(loan.element() as HTMLElement).focus();
		await userEvent.keyboard('{ArrowRight}');
		await expect.element(loan).toHaveAttribute('aria-valuetext', '41 days');
		await expect.element(loan).toHaveAccessibleDescription(/Arrow keys move one day/);
	});

	it('progress: labelled, with value and custom value text; indeterminate has no value', async () => {
		render(ProgressPage);
		const t = page.getByRole('progressbar', { name: 'Transcription' });
		await expect.element(t).toHaveAttribute('aria-valuenow', '42');
		await expect.element(t).toHaveAttribute('aria-valuetext', '42%');
		const folios = page.getByRole('progressbar', { name: 'Folios copied' });
		await expect.element(folios).toHaveAttribute('aria-valuetext', '12 of 40 folios');
		await page.getByRole('button', { name: 'Copy seven more' }).click();
		await expect.element(folios).toHaveAttribute('aria-valuetext', '19 of 40 folios');
		await expect
			.element(page.getByRole('progressbar', { name: 'Searching the Córdoba catalogue' }))
			.not.toHaveAttribute('aria-valuenow');
	});

	it('alert: static by default; live ones get status/alert roles; dismiss works', async () => {
		render(AlertPage);
		expect(document.querySelectorAll('main [role="alert"], main [role="status"]').length).toBe(0);
		await page.getByRole('button', { name: 'Save the note' }).click();
		await expect.element(page.getByRole('status')).toHaveTextContent('Note saved to the margin.');
		await page.getByRole('button', { name: 'Save offline' }).click();
		await expect.element(page.getByRole('alert')).toHaveTextContent("Couldn't save");
		await page.getByRole('button', { name: 'Dismiss' }).click();
		await expect.element(page.getByRole('button', { name: 'Show the alert again' })).toBeVisible();
	});

	it('card: a linked card is one link named by its title', async () => {
		render(CardPage);
		const link = page.getByRole('link', { name: 'Al-Khwarizmi' });
		await expect.element(link).toHaveAttribute('href', '#linked');
		await expect.element(page.getByRole('heading', { name: 'Al-Khwarizmi' })).toBeVisible();
		expect(document.querySelectorAll('main article a').length).toBe(3);
	});

	it('skeleton: hidden from screen readers while its region reports busy', async () => {
		render(SkeletonPage);
		const region = document.querySelector<HTMLElement>('[aria-busy]')!;
		expect(region.getAttribute('aria-busy')).toBe('true');
		expect(region.querySelectorAll('.skeleton[aria-hidden="true"]').length).toBe(4);
		await page.getByRole('button', { name: 'Finish loading' }).click();
		await expect.element(page.getByText('Ibn Sina', { exact: true }).first()).toBeVisible();
		expect(region.getAttribute('aria-busy')).toBe('false');
	});
});
