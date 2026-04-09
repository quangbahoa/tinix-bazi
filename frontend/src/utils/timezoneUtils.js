import ct from 'countries-and-timezones';

export const DEFAULT_TIME_ZONE = 'Asia/Ho_Chi_Minh';

const CONTINENT_LABELS = {
    Asia: 'Châu Á',
    Europe: 'Châu Âu',
    America: 'Châu Mỹ',
    Africa: 'Châu Phi',
    Australia: 'Châu Đại Dương',
    Pacific: 'Thái Bình Dương',
    Atlantic: 'Đại Tây Dương',
    Indian: 'Ấn Độ Dương',
    Antarctica: 'Nam Cực'
};

const CONTINENT_ORDER = [
    'Asia',
    'Europe',
    'America',
    'Africa',
    'Australia',
    'Pacific',
    'Atlantic',
    'Indian',
    'Antarctica'
];

export function isValidTimeZone(timeZone) {
    if (!timeZone || typeof timeZone !== 'string') return false;
    try {
        Intl.DateTimeFormat(undefined, { timeZone });
        return true;
    } catch {
        return false;
    }
}

export function normalizeTimeZone(timeZone, fallback = DEFAULT_TIME_ZONE) {
    return isValidTimeZone(timeZone) ? timeZone : fallback;
}

function getRegionLabel(regionCode, fallbackName) {
    try {
        const displayNames = new Intl.DisplayNames(['vi'], { type: 'region' });
        return displayNames.of(regionCode) || fallbackName || regionCode;
    } catch {
        return fallbackName || regionCode;
    }
}

function getTimeZoneOffsetLabel(timeZone) {
    try {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone,
            timeZoneName: 'shortOffset'
        }).formatToParts(new Date());
        const zonePart = parts.find((part) => part.type === 'timeZoneName');
        return zonePart?.value?.replace('GMT', 'UTC') || 'UTC';
    } catch {
        return 'UTC';
    }
}

export function buildTimeZoneOptions() {
    const countries = ct.getAllCountries();
    const options = [];
    const seenTimeZones = new Set();

    Object.values(countries).forEach((country) => {
        const regionLabel = getRegionLabel(country.id, country.name);
        country.timezones.forEach((timeZone) => {
            if (seenTimeZones.has(timeZone)) return;
            seenTimeZones.add(timeZone);
            options.push({
                value: timeZone,
                label: `${regionLabel} - ${timeZone} (${getTimeZoneOffsetLabel(timeZone)})`,
                countryCode: country.id,
                countryLabel: regionLabel
            });
        });
    });

    options.sort((a, b) => a.label.localeCompare(b.label, 'vi'));

    const vnIndex = options.findIndex((item) => item.value === DEFAULT_TIME_ZONE);
    if (vnIndex > 0) {
        const [vn] = options.splice(vnIndex, 1);
        options.unshift(vn);
    }

    return options;
}

function getContinentFromTimeZone(timeZone) {
    const [raw] = String(timeZone || '').split('/');
    return CONTINENT_LABELS[raw] ? raw : 'Other';
}

export function groupTimeZonesByContinent(options) {
    const groupsMap = new Map();

    options.forEach((option) => {
        const continent = getContinentFromTimeZone(option.value);
        if (!groupsMap.has(continent)) {
            groupsMap.set(continent, []);
        }
        groupsMap.get(continent).push(option);
    });

    const sortedContinents = [
        ...CONTINENT_ORDER.filter((key) => groupsMap.has(key)),
        ...[...groupsMap.keys()].filter((key) => !CONTINENT_ORDER.includes(key)).sort()
    ];

    return sortedContinents.map((continent) => ({
        key: continent,
        label: CONTINENT_LABELS[continent] || continent,
        options: groupsMap.get(continent)
    }));
}
