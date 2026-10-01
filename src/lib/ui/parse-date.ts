import { CalendarDate, GregorianCalendar, getDayOfWeek, toCalendar } from '@internationalized/date';
import { BanglaCalendar, MONTHS_BN } from './calendars/bangla';

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const MONTHS = [
	'january',
	'february',
	'march',
	'april',
	'may',
	'june',
	'july',
	'august',
	'september',
	'october',
	'november',
	'december'
];
const WORDS: Record<string, number> = {
	a: 1,
	an: 1,
	one: 1,
	two: 2,
	three: 3,
	four: 4,
	five: 5,
	six: 6,
	seven: 7,
	eight: 8,
	nine: 9,
	ten: 10
};
type Unit = 'days' | 'weeks' | 'months' | 'years';

// "fri", "friday" → 5; three letters is enough to tell any two apart.
const find = (list: string[], word: string) =>
	word.length >= 3 ? list.findIndex((name) => name.startsWith(word)) : -1;
const count = (word: string) => (/^\d+$/.test(word) ? Number(word) : WORDS[word]);
const unit = (word: string) => `${word.replace(/s$/, '')}s` as Unit;

/** A real day in that month, or undefined ("31 february" is not quietly moved to March). */
function exact(year: number, month: number, day: number) {
	if (month < 1 || month > 12 || day < 1) return undefined;
	const d = new CalendarDate(year, month, day);
	return d.day === day && d.month === month ? d : undefined;
}

// Bangla. Text is NFC-normalized first: letters like য় can be typed or pasted in two forms.
const nfc = (list: string[]) => list.map((w) => w.normalize('NFC'));
const BN_WEEKDAYS = nfc(['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র', 'শনি']);
const BN_MONTHS = nfc([
	'জানুয়ারি',
	'ফেব্রুয়ারি',
	'মার্চ',
	'এপ্রিল',
	'মে',
	'জুন',
	'জুলাই',
	'আগস্ট',
	'সেপ্টেম্বর',
	'অক্টোবর',
	'নভেম্বর',
	'ডিসেম্বর'
]);
const BANGABDA_MONTHS = nfc(MONTHS_BN);
const BN_COUNT: Record<string, number> = Object.fromEntries(
	nfc(['এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়', 'দশ']).map((w, i) => [
		w,
		i + 1
	])
);
const BN_UNIT: Record<string, Unit> = { দিন: 'days', সপ্তাহ: 'weeks', মাস: 'months', বছর: 'years' };
const bnCount = (w: string) => (/^\d+$/.test(w) ? Number(w) : BN_COUNT[w]);
const bangabda = new BanglaCalendar();
const gregorianCal = new GregorianCalendar();

function parseBangla(s: string, today: CalendarDate): CalendarDate | undefined {
	if (s === 'আজ' || s === 'আজকে') return today;
	if (s === 'আগামীকাল' || s === 'কাল') return today.add({ days: 1 });
	if (s === 'গতকাল') return today.subtract({ days: 1 });
	if (s === 'পরশু' || s === 'আগামী পরশু') return today.add({ days: 2 });

	// "৩ দিন পরে", "দুই সপ্তাহ পর", "১ মাস আগে"
	let m = s.match(/^(\S+) (দিন|সপ্তাহ|মাস|বছর) (পরে|পর|আগে)$/);
	if (m && bnCount(m[1])) {
		const span = { [BN_UNIT[m[2]]]: bnCount(m[1]) };
		return m[3] === 'আগে' ? today.subtract(span) : today.add(span);
	}
	// "আগামী সপ্তাহ", "গত মাসে"
	m = s.match(/^(আগামী|গত) (সপ্তাহ|মাস|বছর)ে?$/);
	if (m) {
		const span = { [BN_UNIT[m[2]]]: 1 };
		return m[1] === 'গত' ? today.subtract(span) : today.add(span);
	}
	// "শুক্রবার", "আগামী শুক্রবার", "এই সোমবার", "গত রবিবারে"
	m = s.match(/^(?:(আগামী|এই|গত) )?(\S+?)(?:বার)?ে?$/);
	if (m && BN_WEEKDAYS.includes(m[2])) {
		const ahead = (BN_WEEKDAYS.indexOf(m[2]) - getDayOfWeek(today, 'en-US') + 7) % 7;
		if (m[1] === 'গত') return today.subtract({ days: 7 - ahead || 7 });
		if (m[1] === 'এই') return today.add({ days: ahead });
		return today.add({ days: ahead || 7 });
	}
	// "১৫ জুন", "১৫ জুন ২০২৭" (Gregorian) or "পহেলা বৈশাখ", "১৫ শ্রাবণ ১৪৩৪" (Bangabda)
	m = s.match(/^(\d{1,2}|পহেলা) (\S+)(?: (\d{4}))?$/);
	if (!m) return undefined;
	const day = m[1] === 'পহেলা' ? 1 : Number(m[1]);
	const gregorianMonth = BN_MONTHS.indexOf(m[2]) + 1;
	if (gregorianMonth) {
		if (m[3]) return exact(+m[3], gregorianMonth, day);
		const thisYear = exact(today.year, gregorianMonth, day);
		return thisYear && thisYear.compare(today) >= 0
			? thisYear
			: exact(today.year + 1, gregorianMonth, day);
	}
	const month = BANGABDA_MONTHS.indexOf(m[2]) + 1;
	if (!month) return undefined;
	const inBangabda = (year: number) => {
		const d = new CalendarDate(bangabda, 'BS', year, month, 1);
		return day > bangabda.getDaysInMonth(d) ? undefined : toCalendar(d.set({ day }), gregorianCal);
	};
	if (m[3]) return inBangabda(+m[3]);
	const year = toCalendar(today, bangabda).year;
	const thisYear = inBangabda(year);
	return thisYear && thisYear.compare(today) >= 0 ? thisYear : inBangabda(year + 1);
}

/**
 * Reads everyday English and Bangla dates relative to `today`: "today", "tomorrow", "yesterday", "in 3 days",
 * "2 weeks ago", "a month from now", "friday", "next friday", "last monday", "next week", "15 june",
 * "june 15 2027", "2026-10-02". A day and month without a year means the next time it comes round.
 * In Bangla: "আজ", "আগামীকাল", "৩ দিন পরে", "আগামী শুক্রবার", "১৫ জুন", "পহেলা বৈশাখ", "১৫ শ্রাবণ".
 * ponytail: a fixed set of phrases in two languages; swap in chrono-node for more languages or sentences.
 */
export function parseDate(text: string, today: CalendarDate): CalendarDate | undefined {
	const s = text
		.normalize('NFC')
		.trim()
		.toLowerCase()
		.replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d)))
		.replace(/[,।]/g, ' ')
		.replace(/\s+/g, ' ');
	if (!s) return undefined;
	if (/[\u0980-\u09FF]/.test(s)) return parseBangla(s, today);
	if (s === 'today' || s === 'now') return today;
	if (s === 'tomorrow') return today.add({ days: 1 });
	if (s === 'yesterday') return today.subtract({ days: 1 });

	let m = s.match(/^in (\w+) (day|week|month|year)s?$/);
	if (m && count(m[1])) return today.add({ [unit(m[2])]: count(m[1]) });
	m = s.match(/^(\w+) (day|week|month|year)s? (from now|later|ago)$/);
	if (m && count(m[1]))
		return m[3] === 'ago'
			? today.subtract({ [unit(m[2])]: count(m[1]) })
			: today.add({ [unit(m[2])]: count(m[1]) });

	m = s.match(/^(next|last) (week|month|year)$/);
	if (m)
		return m[1] === 'next' ? today.add({ [unit(m[2])]: 1 }) : today.subtract({ [unit(m[2])]: 1 });

	// Weekdays: "friday" and "next friday" are the coming one, "this friday" may be today, "last" goes back.
	m = s.match(/^(?:(next|this|last) )?([a-z]+)$/);
	if (m && find(WEEKDAYS, m[2]) >= 0) {
		const ahead = (find(WEEKDAYS, m[2]) - getDayOfWeek(today, 'en-US') + 7) % 7;
		if (m[1] === 'last') return today.subtract({ days: 7 - ahead || 7 });
		if (m[1] === 'this') return today.add({ days: ahead });
		return today.add({ days: ahead || 7 });
	}

	m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
	if (m) return exact(+m[1], +m[2], +m[3]);

	// "15 june", "june 15", either with a year.
	m = s.match(/^(\d{1,2}) ([a-z]+)(?: (\d{4}))?$/) ?? s.match(/^([a-z]+) (\d{1,2})(?: (\d{4}))?$/);
	if (m) {
		const [day, name] = /^\d/.test(m[1]) ? [+m[1], m[2]] : [+m[2], m[1]];
		const month = find(MONTHS, name) + 1;
		if (!month) return undefined;
		if (m[3]) return exact(+m[3], month, day);
		const thisYear = exact(today.year, month, day);
		return thisYear && thisYear.compare(today) >= 0 ? thisYear : exact(today.year + 1, month, day);
	}
	return undefined;
}
