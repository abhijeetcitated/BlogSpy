import type { CalendarEvent, ContentNiche, EventUrgency } from "../types"

// ============================================
// HELPER: Calculate days until event
// ============================================

function calculateDaysUntil(month: number, day: number, year: number): number {
  const today = new Date()
  const eventDate = new Date(year, month, day)
  const diffTime = eventDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// ============================================
// HELPER: Determine urgency based on days
// ============================================

function getUrgency(daysUntil: number): EventUrgency {
  if (daysUntil < 0) return "future" // Past events
  if (daysUntil <= 14) return "urgent"
  if (daysUntil <= 45) return "upcoming"
  if (daysUntil <= 90) return "planned"
  return "future"
}

// ============================================
// MOCK DATA: Calendar Events
// ============================================

const currentYear = new Date().getFullYear()
const nextYear = currentYear + 1

const rawEvents: Omit<CalendarEvent, "id" | "daysUntil" | "urgency" | "matchScore">[] = [
  // JANUARY
  {
    name: "New Year Resolutions",
    keyword: "fitness goals 2025",
    date: "01-01",
    month: 0,
    year: nextYear,
    predictedVolume: "125K",
    yoyGrowth: 12,
    difficulty: "medium",
    niche: "health",
    description: "People searching for fitness goals, gym memberships, and healthy lifestyle changes.",
    suggestedKeywords: ["new year fitness goals", "best gym routine 2025", "health resolutions"],
    competitorCount: 45,
  },
  {
    name: "CES Tech Show",
    keyword: "ces 2025 announcements",
    date: "01-07",
    month: 0,
    year: nextYear,
    predictedVolume: "220K",
    yoyGrowth: 22,
    difficulty: "hard",
    niche: "technology",
    description: "Consumer Electronics Show - biggest tech announcements of the year.",
    suggestedKeywords: ["ces 2025 best gadgets", "new tech ces", "ces announcements"],
    competitorCount: 89,
  },
  {
    name: "Veganuary",
    keyword: "vegan recipes beginners",
    date: "01-01",
    month: 0,
    year: nextYear,
    predictedVolume: "145K",
    yoyGrowth: 25,
    difficulty: "easy",
    niche: "food",
    description: "Month-long challenge to eat vegan. Great for recipe and meal prep content.",
    suggestedKeywords: ["easy vegan meals", "veganuary meal plan", "vegan breakfast ideas"],
    competitorCount: 32,
  },
  {
    name: "Tax Prep Season",
    keyword: "tax preparation tips",
    date: "01-15",
    month: 0,
    year: nextYear,
    predictedVolume: "180K",
    yoyGrowth: 8,
    difficulty: "medium",
    niche: "finance",
    description: "Tax season begins. People searching for deductions, software, and tips.",
    suggestedKeywords: ["tax deductions 2025", "best tax software", "how to file taxes"],
  },

  // FEBRUARY
  {
    name: "Valentine's Day",
    keyword: "romantic gift ideas",
    date: "02-14",
    month: 1,
    year: nextYear,
    predictedVolume: "310K",
    yoyGrowth: 15,
    difficulty: "hard",
    niche: "lifestyle",
    description: "Gift guides, date ideas, and romantic content. Very competitive but high volume.",
    suggestedKeywords: ["valentines gift for him", "romantic dinner ideas", "unique valentine gifts"],
    competitorCount: 120,
  },
  {
    name: "Super Bowl",
    keyword: "super bowl party ideas",
    date: "02-09",
    month: 1,
    year: nextYear,
    predictedVolume: "480K",
    yoyGrowth: 22,
    difficulty: "medium",
    niche: "entertainment",
    description: "Party food, game predictions, and watch party content.",
    suggestedKeywords: ["super bowl snacks", "football party food", "super bowl commercials"],
  },
  {
    name: "Heart Health Month",
    keyword: "heart healthy recipes",
    date: "02-01",
    month: 1,
    year: nextYear,
    predictedVolume: "78K",
    yoyGrowth: 10,
    difficulty: "easy",
    niche: "health",
    description: "February is heart health awareness month. Low competition health content.",
    suggestedKeywords: ["heart healthy diet", "cardiovascular exercises", "lower cholesterol naturally"],
  },

  // MARCH
  {
    name: "Spring Break Travel",
    keyword: "spring break destinations",
    date: "03-15",
    month: 2,
    year: nextYear,
    predictedVolume: "420K",
    yoyGrowth: 18,
    difficulty: "hard",
    niche: "travel",
    description: "Students and families planning spring break trips.",
    suggestedKeywords: ["best spring break beaches", "budget spring break", "family spring vacation"],
    competitorCount: 67,
  },
  {
    name: "March Madness",
    keyword: "ncaa bracket predictions",
    date: "03-17",
    month: 2,
    year: nextYear,
    predictedVolume: "380K",
    yoyGrowth: 12,
    difficulty: "hard",
    niche: "sports",
    description: "College basketball tournament. Great for sports content and predictions.",
    suggestedKeywords: ["march madness brackets", "ncaa tournament picks", "college basketball betting"],
  },
  {
    name: "Spring Fashion",
    keyword: "spring fashion trends",
    date: "03-01",
    month: 2,
    year: nextYear,
    predictedVolume: "165K",
    yoyGrowth: 15,
    difficulty: "medium",
    niche: "fashion",
    description: "New season fashion trends. Popular among fashion bloggers.",
    suggestedKeywords: ["spring outfit ideas", "spring color trends", "transitional wardrobe"],
  },

  // APRIL
  {
    name: "Tax Deadline",
    keyword: "last minute tax tips",
    date: "04-15",
    month: 3,
    year: nextYear,
    predictedVolume: "320K",
    yoyGrowth: 5,
    difficulty: "medium",
    niche: "finance",
    description: "Final push before tax deadline. High urgency searches.",
    suggestedKeywords: ["tax extension", "file taxes late", "tax deadline 2025"],
  },
  {
    name: "Earth Day",
    keyword: "sustainable living tips",
    date: "04-22",
    month: 3,
    year: nextYear,
    predictedVolume: "145K",
    yoyGrowth: 25,
    difficulty: "easy",
    niche: "lifestyle",
    description: "Environmental awareness content. Growing trend with younger audiences.",
    suggestedKeywords: ["eco friendly products", "reduce plastic", "sustainable lifestyle"],
  },

  // MAY
  {
    name: "Mother's Day",
    keyword: "mothers day gift guide",
    date: "05-11",
    month: 4,
    year: nextYear,
    predictedVolume: "380K",
    yoyGrowth: 10,
    difficulty: "hard",
    niche: "lifestyle",
    description: "Gift guides and appreciation content. Very high search volume.",
    suggestedKeywords: ["unique gifts for mom", "mothers day ideas", "best mom gifts 2025"],
    competitorCount: 78,
  },
  {
    name: "Google I/O",
    keyword: "google io announcements",
    date: "05-14",
    month: 4,
    year: nextYear,
    predictedVolume: "195K",
    yoyGrowth: 15,
    difficulty: "hard",
    niche: "technology",
    description: "Google's developer conference. Major Android and AI announcements.",
    suggestedKeywords: ["android updates", "google ai features", "new google products"],
  },

  // JUNE
  {
    name: "Father's Day",
    keyword: "fathers day gifts",
    date: "06-15",
    month: 5,
    year: nextYear,
    predictedVolume: "295K",
    yoyGrowth: 8,
    difficulty: "hard",
    niche: "lifestyle",
    description: "Gift guides for dads. Slightly less competitive than Mother's Day.",
    suggestedKeywords: ["best gifts for dad", "unique father gifts", "fathers day ideas"],
    competitorCount: 65,
  },
  {
    name: "WWDC Apple",
    keyword: "wwdc ios updates",
    date: "06-09",
    month: 5,
    year: nextYear,
    predictedVolume: "220K",
    yoyGrowth: 12,
    difficulty: "hard",
    niche: "technology",
    description: "Apple's developer conference. iOS, macOS, and hardware announcements.",
    suggestedKeywords: ["new iphone features", "ios 19 features", "apple wwdc recap"],
  },
  {
    name: "Summer Skincare",
    keyword: "summer skincare routine",
    date: "06-01",
    month: 5,
    year: nextYear,
    predictedVolume: "145K",
    yoyGrowth: 15,
    difficulty: "medium",
    niche: "fashion",
    description: "Sunscreen, hydration, and summer beauty tips.",
    suggestedKeywords: ["best sunscreen 2025", "summer makeup tips", "beach skincare"],
  },

  // JULY
  {
    name: "4th of July",
    keyword: "july 4th recipes",
    date: "07-04",
    month: 6,
    year: nextYear,
    predictedVolume: "520K",
    yoyGrowth: 5,
    difficulty: "hard",
    niche: "food",
    description: "BBQ recipes, party ideas, and patriotic content.",
    suggestedKeywords: ["4th of july bbq", "patriotic desserts", "independence day party"],
    competitorCount: 95,
  },
  {
    name: "Amazon Prime Day",
    keyword: "prime day deals",
    date: "07-15",
    month: 6,
    year: nextYear,
    predictedVolume: "850K",
    yoyGrowth: 28,
    difficulty: "hard",
    niche: "technology",
    description: "Massive shopping event. Great for deal roundups and buying guides.",
    suggestedKeywords: ["best prime day deals", "prime day tech", "amazon sale 2025"],
    competitorCount: 120,
  },

  // AUGUST
  {
    name: "Back to School",
    keyword: "back to school supplies",
    date: "08-01",
    month: 7,
    year: nextYear,
    predictedVolume: "780K",
    yoyGrowth: 15,
    difficulty: "hard",
    niche: "education",
    description: "School supplies, dorm essentials, and student content.",
    suggestedKeywords: ["school supply list", "college dorm essentials", "student laptop guide"],
    competitorCount: 110,
  },
  {
    name: "Fall Fashion Preview",
    keyword: "fall fashion trends",
    date: "08-15",
    month: 7,
    year: nextYear,
    predictedVolume: "165K",
    yoyGrowth: 15,
    difficulty: "medium",
    niche: "fashion",
    description: "Preview of fall fashion before the season starts.",
    suggestedKeywords: ["fall outfit ideas", "autumn color trends", "fall wardrobe staples"],
  },

  // SEPTEMBER
  {
    name: "Apple Event",
    keyword: "new iphone announcement",
    date: "09-10",
    month: 8,
    year: nextYear,
    predictedVolume: "650K",
    yoyGrowth: 18,
    difficulty: "hard",
    niche: "technology",
    description: "Annual iPhone launch event. Massive search volume.",
    suggestedKeywords: ["iphone 17 specs", "new apple watch", "iphone comparison"],
  },
  {
    name: "Fall Travel Season",
    keyword: "fall vacation ideas",
    date: "09-01",
    month: 8,
    year: nextYear,
    predictedVolume: "180K",
    yoyGrowth: 12,
    difficulty: "easy",
    niche: "travel",
    description: "Off-peak travel season. Great for budget travel content.",
    suggestedKeywords: ["fall foliage trips", "autumn getaways", "september travel deals"],
  },

  // OCTOBER
  {
    name: "Halloween",
    keyword: "halloween costume ideas",
    date: "10-31",
    month: 9,
    year: nextYear,
    predictedVolume: "890K",
    yoyGrowth: 8,
    difficulty: "hard",
    niche: "entertainment",
    description: "Costumes, decorations, recipes. Very high competition.",
    suggestedKeywords: ["diy halloween costumes", "halloween party ideas", "spooky decorations"],
    competitorCount: 150,
  },
  {
    name: "Breast Cancer Month",
    keyword: "breast cancer awareness",
    date: "10-01",
    month: 9,
    year: nextYear,
    predictedVolume: "95K",
    yoyGrowth: 10,
    difficulty: "easy",
    niche: "health",
    description: "Health awareness content. Good for health bloggers.",
    suggestedKeywords: ["breast cancer prevention", "pink ribbon", "mammogram tips"],
  },

  // NOVEMBER
  {
    name: "Black Friday",
    keyword: "black friday deals",
    date: "11-28",
    month: 10,
    year: nextYear,
    predictedVolume: "1.2M",
    yoyGrowth: 15,
    difficulty: "hard",
    niche: "technology",
    description: "Biggest shopping day. Deal roundups and buying guides.",
    suggestedKeywords: ["best black friday tech", "black friday tips", "cyber monday preview"],
    competitorCount: 200,
  },
  {
    name: "Thanksgiving",
    keyword: "thanksgiving recipes",
    date: "11-27",
    month: 10,
    year: nextYear,
    predictedVolume: "580K",
    yoyGrowth: 5,
    difficulty: "hard",
    niche: "food",
    description: "Traditional recipes and hosting tips.",
    suggestedKeywords: ["turkey recipe", "thanksgiving sides", "pumpkin pie from scratch"],
  },

  // DECEMBER
  {
    name: "Christmas Gift Guide",
    keyword: "christmas gift ideas",
    date: "12-25",
    month: 11,
    year: currentYear,
    predictedVolume: "1.5M",
    yoyGrowth: 10,
    difficulty: "hard",
    niche: "lifestyle",
    description: "Gift guides for all demographics. Highest competition.",
    suggestedKeywords: ["gifts under $50", "tech gifts 2025", "unique christmas gifts"],
    competitorCount: 250,
  },
  {
    name: "Year in Review",
    keyword: "best of 2025",
    date: "12-20",
    month: 11,
    year: currentYear,
    predictedVolume: "320K",
    yoyGrowth: 12,
    difficulty: "medium",
    niche: "entertainment",
    description: "Roundup content for the year. Works for any niche.",
    suggestedKeywords: ["top 10 2025", "best movies 2025", "year in review"],
  },
]

// ============================================
// PROCESS AND EXPORT EVENTS
// ============================================

export const calendarEvents: CalendarEvent[] = rawEvents.map((event, index) => {
  const [monthStr, dayStr] = event.date.split("-")
  const day = parseInt(dayStr)
  const daysUntil = calculateDaysUntil(event.month, day, event.year)
  const urgency = getUrgency(daysUntil)
  
  return {
    ...event,
    id: `event-${index}`,
    daysUntil,
    urgency,
    matchScore: 0, // Will be calculated based on user's niche
  }
})

// ============================================
// FILTER EVENTS BY NICHE
// ============================================

export function getEventsForNiche(niche: ContentNiche): CalendarEvent[] {
  let events = calendarEvents
  
  if (niche !== "all") {
    events = calendarEvents.filter(e => e.niche === niche)
  }
  
  // Calculate match score based on niche
  return events.map(event => ({
    ...event,
    matchScore: event.niche === niche ? 95 : niche === "all" ? 75 : 50,
  })).sort((a, b) => {
    // Sort by urgency first, then by days until
    const urgencyOrder = { urgent: 0, upcoming: 1, planned: 2, future: 3 }
    if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
    }
    return a.daysUntil - b.daysUntil
  })
}
