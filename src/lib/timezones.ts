export const TIMEZONES = [
    { value: "UTC", label: "(UTC+00:00) Coordinated Universal Time" },
    { value: "Asia/Kolkata", label: "(UTC+05:30) India Standard Time (IST) - Kolkata, New Delhi" },
    { value: "America/New_York", label: "(UTC-05:00) Eastern Time (US & Canada)" },
    { value: "America/Los_Angeles", label: "(UTC-08:00) Pacific Time (US & Canada)" },
    { value: "America/Chicago", label: "(UTC-06:00) Central Time (US & Canada)" },
    { value: "Europe/London", label: "(UTC+00:00) London, Edinburgh, Dublin" },
    { value: "Europe/Paris", label: "(UTC+01:00) Paris, Berlin, Rome, Madrid" },
    { value: "Asia/Dubai", label: "(UTC+04:00) Dubai, Abu Dhabi" },
    { value: "Asia/Singapore", label: "(UTC+08:00) Singapore, Kuala Lumpur" },
    { value: "Asia/Tokyo", label: "(UTC+09:00) Tokyo, Osaka, Sapporo" },
    { value: "Australia/Sydney", label: "(UTC+11:00) Sydney, Melbourne, Canberra" },
    { value: "Pacific/Auckland", label: "(UTC+13:00) Auckland, Wellington" },
    { value: "America/Toronto", label: "(UTC-05:00) Toronto, Montreal" },
    { value: "America/Vancouver", label: "(UTC-08:00) Vancouver" },
    { value: "America/Sao_Paulo", label: "(UTC-03:00) Brasilia, Sao Paulo" },
    { value: "Europe/Moscow", label: "(UTC+03:00) Moscow, St. Petersburg" },
    { value: "Asia/Hong_Kong", label: "(UTC+08:00) Hong Kong" },
    { value: "Asia/Shanghai", label: "(UTC+08:00) Beijing, Shanghai" },
    { value: "Asia/Seoul", label: "(UTC+09:00) Seoul" },
    { value: "Asia/Bangkok", label: "(UTC+07:00) Bangkok, Hanoi, Jakarta" },
] as const

// Helper to find label for a given timezone value
export function getTimezoneLabel(value: string) {
    return TIMEZONES.find((tz) => tz.value === value)?.label || value
}
