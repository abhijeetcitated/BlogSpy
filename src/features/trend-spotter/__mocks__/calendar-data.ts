import type { SeasonalTrend } from "../types"

// ============================================
// SEASONAL TREND CALENDAR - 12 MONTHS DATA
// 10-15 events per month from multiple sources
// ============================================

export const seasonalCalendar: SeasonalTrend[] = [
  {
    month: "January",
    monthIndex: 0,
    year: 2025,
    season: "winter",
    events: [
      { name: "New Year Resolutions", keyword: "fitness goals 2025", predictedVolume: "125K", confidence: 92, category: "Health", yoyGrowth: 12, trafficImpact: "high", exactDate: "01-01", source: "seasonal", lastYearRank: 1, competitorCount: 45 },
      { name: "Dry January", keyword: "dry january challenge tips", predictedVolume: "89K", confidence: 88, category: "Health", yoyGrowth: 18, trafficImpact: "medium", exactDate: "01-01", source: "google_trends" },
      { name: "Winter Sales", keyword: "winter clearance deals 2025", predictedVolume: "156K", confidence: 90, category: "Shopping", yoyGrowth: 8, trafficImpact: "high", exactDate: "01-02", source: "seasonal" },
      { name: "CES Tech Show", keyword: "ces 2025 announcements", predictedVolume: "220K", confidence: 95, category: "Tech", yoyGrowth: 22, trafficImpact: "high", exactDate: "01-07", source: "industry", lastYearRank: 3 },
      { name: "Blue Monday", keyword: "beat january blues tips", predictedVolume: "67K", confidence: 82, category: "Health", yoyGrowth: 15, trafficImpact: "medium", exactDate: "01-20", source: "news" },
      { name: "Veganuary", keyword: "vegan recipes beginners 2025", predictedVolume: "145K", confidence: 89, category: "Food", yoyGrowth: 25, trafficImpact: "high", exactDate: "01-01", source: "google_trends", competitorCount: 32 },
      { name: "Diet Season", keyword: "best diet plans 2025", predictedVolume: "380K", confidence: 94, category: "Health", yoyGrowth: 10, trafficImpact: "high", exactDate: "01-05", source: "historical", lastYearRank: 2 },
      { name: "Tax Prep Start", keyword: "tax preparation 2025", predictedVolume: "95K", confidence: 85, category: "Finance", yoyGrowth: 5, trafficImpact: "medium", exactDate: "01-15", source: "seasonal" },
      { name: "Winter Skincare", keyword: "winter skincare routine dry skin", predictedVolume: "78K", confidence: 83, category: "Fashion", yoyGrowth: 12, trafficImpact: "medium", exactDate: "01-10", source: "google_trends" },
      { name: "Budget Planning", keyword: "personal budget template 2025", predictedVolume: "112K", confidence: 87, category: "Finance", yoyGrowth: 8, trafficImpact: "medium", exactDate: "01-02", source: "seasonal" },
    ]
  },
  {
    month: "February",
    monthIndex: 1,
    year: 2025,
    season: "winter",
    events: [
      { name: "Valentine's Day", keyword: "romantic gift ideas 2025", predictedVolume: "310K", confidence: 96, category: "Lifestyle", yoyGrowth: 15, trafficImpact: "high", exactDate: "02-14", source: "seasonal", lastYearRank: 1, competitorCount: 89 },
      { name: "Super Bowl", keyword: "super bowl 2025 party ideas", predictedVolume: "480K", confidence: 97, category: "Entertainment", yoyGrowth: 22, trafficImpact: "high", exactDate: "02-09", source: "seasonal", lastYearRank: 2 },
      { name: "Galentine's Day", keyword: "galentines day gifts for friends", predictedVolume: "95K", confidence: 85, category: "Lifestyle", yoyGrowth: 35, trafficImpact: "medium", exactDate: "02-13", source: "google_trends" },
      { name: "Heart Health Month", keyword: "heart healthy recipes 2025", predictedVolume: "78K", confidence: 82, category: "Health", yoyGrowth: 10, trafficImpact: "medium", exactDate: "02-01", source: "news" },
      { name: "MWC Barcelona", keyword: "mwc 2025 mobile announcements", predictedVolume: "145K", confidence: 88, category: "Tech", yoyGrowth: 18, trafficImpact: "medium", exactDate: "02-24", source: "industry" },
      { name: "Presidents Day Sales", keyword: "presidents day deals 2025", predictedVolume: "165K", confidence: 89, category: "Shopping", yoyGrowth: 12, trafficImpact: "high", exactDate: "02-17", source: "seasonal" },
      { name: "Winter Olympics Buzz", keyword: "winter sports gear 2025", predictedVolume: "89K", confidence: 80, category: "Sports", yoyGrowth: 8, trafficImpact: "low", exactDate: "02-01", source: "google_trends" },
      { name: "Tax Filing Opens", keyword: "irs tax deadline 2025", predictedVolume: "220K", confidence: 92, category: "Finance", yoyGrowth: 5, trafficImpact: "high", exactDate: "02-01", source: "seasonal" },
      { name: "Self-Love Week", keyword: "self care routine 2025", predictedVolume: "67K", confidence: 78, category: "Lifestyle", yoyGrowth: 28, trafficImpact: "medium", exactDate: "02-10", source: "google_trends" },
      { name: "Pet Valentine", keyword: "valentines day gifts for pets", predictedVolume: "45K", confidence: 75, category: "Lifestyle", yoyGrowth: 42, trafficImpact: "low", exactDate: "02-14", source: "google_trends" },
    ]
  },
  {
    month: "March",
    monthIndex: 2,
    year: 2025,
    season: "spring",
    events: [
      { name: "Spring Break", keyword: "spring break destinations 2025", predictedVolume: "420K", confidence: 93, category: "Travel", yoyGrowth: 18, trafficImpact: "high", exactDate: "03-15", source: "seasonal", lastYearRank: 1, competitorCount: 67 },
      { name: "Tax Season Peak", keyword: "tax filing tips 2025", predictedVolume: "550K", confidence: 96, category: "Finance", yoyGrowth: 5, trafficImpact: "high", exactDate: "03-01", source: "seasonal", lastYearRank: 2 },
      { name: "March Madness", keyword: "ncaa bracket predictions 2025", predictedVolume: "380K", confidence: 94, category: "Sports", yoyGrowth: 12, trafficImpact: "high", exactDate: "03-17", source: "seasonal" },
      { name: "St. Patrick's Day", keyword: "st patricks day recipes 2025", predictedVolume: "145K", confidence: 88, category: "Food", yoyGrowth: 8, trafficImpact: "medium", exactDate: "03-17", source: "seasonal" },
      { name: "SXSW", keyword: "sxsw 2025 highlights tech", predictedVolume: "125K", confidence: 86, category: "Tech", yoyGrowth: 15, trafficImpact: "medium", exactDate: "03-07", source: "industry" },
      { name: "Women's History Month", keyword: "women entrepreneurs 2025", predictedVolume: "89K", confidence: 82, category: "Education", yoyGrowth: 20, trafficImpact: "medium", exactDate: "03-01", source: "news" },
      { name: "Spring Cleaning", keyword: "spring cleaning checklist 2025", predictedVolume: "210K", confidence: 90, category: "Lifestyle", yoyGrowth: 10, trafficImpact: "high", exactDate: "03-20", source: "google_trends" },
      { name: "Daylight Saving", keyword: "daylight saving time 2025", predictedVolume: "180K", confidence: 95, category: "Lifestyle", yoyGrowth: 3, trafficImpact: "medium", exactDate: "03-09", source: "seasonal" },
      { name: "Spring Fashion", keyword: "spring fashion trends 2025", predictedVolume: "165K", confidence: 87, category: "Fashion", yoyGrowth: 15, trafficImpact: "high", exactDate: "03-01", source: "google_trends" },
      { name: "Gardening Season", keyword: "vegetable garden planting guide", predictedVolume: "135K", confidence: 85, category: "Lifestyle", yoyGrowth: 12, trafficImpact: "medium", exactDate: "03-20", source: "seasonal" },
      { name: "Real Estate Season", keyword: "best time to buy house 2025", predictedVolume: "195K", confidence: 88, category: "Finance", yoyGrowth: 8, trafficImpact: "high", exactDate: "03-01", source: "historical", lastYearRank: 5 },
    ]
  },
  {
    month: "April",
    monthIndex: 3,
    year: 2025,
    season: "spring",
    events: [
      { name: "Easter", keyword: "easter decoration ideas 2025", predictedVolume: "195K", confidence: 92, category: "Lifestyle", yoyGrowth: 7, trafficImpact: "high", exactDate: "04-20", source: "seasonal", lastYearRank: 1 },
      { name: "Tax Deadline", keyword: "last minute tax tips 2025", predictedVolume: "320K", confidence: 97, category: "Finance", yoyGrowth: 5, trafficImpact: "high", exactDate: "04-15", source: "seasonal", lastYearRank: 2 },
      { name: "Earth Day", keyword: "sustainable living tips 2025", predictedVolume: "145K", confidence: 88, category: "Environment", yoyGrowth: 25, trafficImpact: "high", exactDate: "04-22", source: "seasonal" },
      { name: "Coachella", keyword: "coachella 2025 fashion outfits", predictedVolume: "180K", confidence: 85, category: "Entertainment", yoyGrowth: 18, trafficImpact: "medium", exactDate: "04-11", source: "news" },
      { name: "Spring Allergies", keyword: "spring allergy relief natural", predictedVolume: "165K", confidence: 90, category: "Health", yoyGrowth: 12, trafficImpact: "medium", exactDate: "04-01", source: "google_trends" },
      { name: "Home Improvement", keyword: "diy home projects spring 2025", predictedVolume: "125K", confidence: 84, category: "Lifestyle", yoyGrowth: 10, trafficImpact: "medium", exactDate: "04-05", source: "google_trends" },
      { name: "Ramadan End/Eid", keyword: "eid celebration ideas 2025", predictedVolume: "95K", confidence: 87, category: "Lifestyle", yoyGrowth: 15, trafficImpact: "medium", exactDate: "04-10", source: "seasonal" },
      { name: "NAB Show", keyword: "nab show 2025 broadcast tech", predictedVolume: "67K", confidence: 78, category: "Tech", yoyGrowth: 8, trafficImpact: "low", exactDate: "04-12", source: "industry" },
      { name: "Wedding Season Start", keyword: "spring wedding ideas 2025", predictedVolume: "210K", confidence: 89, category: "Lifestyle", yoyGrowth: 10, trafficImpact: "high", exactDate: "04-01", source: "google_trends" },
      { name: "Outdoor Fitness", keyword: "outdoor workout routine spring", predictedVolume: "89K", confidence: 82, category: "Health", yoyGrowth: 15, trafficImpact: "medium", exactDate: "04-01", source: "google_trends" },
    ]
  },
  {
    month: "May",
    monthIndex: 4,
    year: 2025,
    season: "spring",
    events: [
      { name: "Mother's Day", keyword: "mothers day gift guide 2025", predictedVolume: "380K", confidence: 96, category: "Lifestyle", yoyGrowth: 10, trafficImpact: "high", exactDate: "05-11", source: "seasonal", lastYearRank: 1, competitorCount: 78 },
      { name: "Memorial Day", keyword: "memorial day sales 2025", predictedVolume: "265K", confidence: 93, category: "Shopping", yoyGrowth: 12, trafficImpact: "high", exactDate: "05-26", source: "seasonal", lastYearRank: 2 },
      { name: "Graduation Season", keyword: "graduation gift ideas 2025", predictedVolume: "220K", confidence: 91, category: "Lifestyle", yoyGrowth: 8, trafficImpact: "high", exactDate: "05-15", source: "seasonal" },
      { name: "Mental Health Month", keyword: "mental health awareness 2025", predictedVolume: "145K", confidence: 87, category: "Health", yoyGrowth: 22, trafficImpact: "medium", exactDate: "05-01", source: "news" },
      { name: "Google I/O", keyword: "google io 2025 announcements", predictedVolume: "195K", confidence: 89, category: "Tech", yoyGrowth: 15, trafficImpact: "high", exactDate: "05-14", source: "industry" },
      { name: "Cinco de Mayo", keyword: "cinco de mayo recipes authentic", predictedVolume: "125K", confidence: 85, category: "Food", yoyGrowth: 10, trafficImpact: "medium", exactDate: "05-05", source: "seasonal" },
      { name: "Spring Home Sales", keyword: "selling house spring 2025 tips", predictedVolume: "165K", confidence: 86, category: "Finance", yoyGrowth: 8, trafficImpact: "medium", exactDate: "05-01", source: "historical" },
      { name: "BBQ Season", keyword: "best bbq recipes summer 2025", predictedVolume: "180K", confidence: 88, category: "Food", yoyGrowth: 10, trafficImpact: "high", exactDate: "05-20", source: "google_trends" },
      { name: "Teacher Appreciation", keyword: "teacher appreciation gift ideas", predictedVolume: "78K", confidence: 82, category: "Lifestyle", yoyGrowth: 12, trafficImpact: "low", exactDate: "05-06", source: "seasonal" },
      { name: "Pool Opening", keyword: "pool opening checklist 2025", predictedVolume: "95K", confidence: 84, category: "Lifestyle", yoyGrowth: 8, trafficImpact: "medium", exactDate: "05-25", source: "google_trends" },
    ]
  },
  {
    month: "June",
    monthIndex: 5,
    year: 2025,
    season: "summer",
    events: [
      { name: "Father's Day", keyword: "best fathers day gifts 2025", predictedVolume: "295K", confidence: 95, category: "Lifestyle", yoyGrowth: 8, trafficImpact: "high", exactDate: "06-15", source: "seasonal", lastYearRank: 1, competitorCount: 65 },
      { name: "Summer Vacation", keyword: "summer travel deals 2025", predictedVolume: "480K", confidence: 92, category: "Travel", yoyGrowth: 20, trafficImpact: "high", exactDate: "06-01", source: "seasonal", lastYearRank: 2 },
      { name: "Pride Month", keyword: "pride month events 2025", predictedVolume: "165K", confidence: 88, category: "Lifestyle", yoyGrowth: 18, trafficImpact: "high", exactDate: "06-01", source: "news" },
      { name: "E3/Summer Game Fest", keyword: "summer game fest 2025 announcements", predictedVolume: "180K", confidence: 86, category: "Entertainment", yoyGrowth: 15, trafficImpact: "medium", exactDate: "06-08", source: "industry" },
      { name: "WWDC Apple", keyword: "wwdc 2025 ios updates", predictedVolume: "220K", confidence: 90, category: "Tech", yoyGrowth: 12, trafficImpact: "high", exactDate: "06-09", source: "industry" },
      { name: "Wedding Peak", keyword: "june wedding planning checklist", predictedVolume: "245K", confidence: 89, category: "Lifestyle", yoyGrowth: 8, trafficImpact: "high", exactDate: "06-15", source: "google_trends" },
      { name: "Summer Skincare", keyword: "summer skincare routine oily skin", predictedVolume: "145K", confidence: 85, category: "Fashion", yoyGrowth: 15, trafficImpact: "medium", exactDate: "06-01", source: "google_trends" },
      { name: "Juneteenth", keyword: "juneteenth celebration ideas", predictedVolume: "95K", confidence: 84, category: "Lifestyle", yoyGrowth: 25, trafficImpact: "medium", exactDate: "06-19", source: "news" },
      { name: "Summer Internships", keyword: "summer internship tips 2025", predictedVolume: "78K", confidence: 80, category: "Education", yoyGrowth: 10, trafficImpact: "low", exactDate: "06-01", source: "google_trends" },
      { name: "AC Buying Guide", keyword: "best air conditioner 2025", predictedVolume: "165K", confidence: 87, category: "Shopping", yoyGrowth: 10, trafficImpact: "medium", exactDate: "06-01", source: "google_trends" },
    ]
  },
  {
    month: "July",
    monthIndex: 6,
    year: 2025,
    season: "summer",
    events: [
      { name: "4th of July", keyword: "july 4th fireworks near me 2025", predictedVolume: "520K", confidence: 97, category: "Entertainment", yoyGrowth: 5, trafficImpact: "high", exactDate: "07-04", source: "seasonal", lastYearRank: 1, competitorCount: 95 },
      { name: "Amazon Prime Day", keyword: "amazon prime day deals 2025", predictedVolume: "850K", confidence: 96, category: "Shopping", yoyGrowth: 28, trafficImpact: "high", exactDate: "07-15", source: "seasonal", lastYearRank: 2, competitorCount: 120 },
      { name: "Summer Sale", keyword: "summer clothing sale 2025", predictedVolume: "320K", confidence: 90, category: "Shopping", yoyGrowth: 12, trafficImpact: "high", exactDate: "07-01", source: "seasonal" },
      { name: "Comic-Con", keyword: "san diego comic con 2025", predictedVolume: "165K", confidence: 85, category: "Entertainment", yoyGrowth: 15, trafficImpact: "medium", exactDate: "07-24", source: "industry" },
      { name: "Summer Movies", keyword: "best summer movies 2025", predictedVolume: "195K", confidence: 86, category: "Entertainment", yoyGrowth: 10, trafficImpact: "medium", exactDate: "07-01", source: "google_trends" },
      { name: "Ice Cream Day", keyword: "national ice cream day deals", predictedVolume: "78K", confidence: 82, category: "Food", yoyGrowth: 8, trafficImpact: "low", exactDate: "07-20", source: "news" },
      { name: "Summer Fitness", keyword: "summer body workout plan", predictedVolume: "145K", confidence: 84, category: "Health", yoyGrowth: 12, trafficImpact: "medium", exactDate: "07-01", source: "google_trends" },
      { name: "Road Trip Season", keyword: "summer road trip essentials 2025", predictedVolume: "180K", confidence: 87, category: "Travel", yoyGrowth: 15, trafficImpact: "high", exactDate: "07-01", source: "google_trends" },
      { name: "AWS Summit", keyword: "aws summit 2025 cloud", predictedVolume: "95K", confidence: 80, category: "Tech", yoyGrowth: 10, trafficImpact: "medium", exactDate: "07-10", source: "industry" },
      { name: "Camping Season", keyword: "best camping gear 2025", predictedVolume: "125K", confidence: 85, category: "Lifestyle", yoyGrowth: 18, trafficImpact: "medium", exactDate: "07-01", source: "google_trends" },
    ]
  },
  {
    month: "August",
    monthIndex: 7,
    year: 2025,
    season: "summer",
    events: [
      { name: "Back to School", keyword: "back to school supplies 2025", predictedVolume: "780K", confidence: 97, category: "Shopping", yoyGrowth: 15, trafficImpact: "high", exactDate: "08-01", source: "seasonal", lastYearRank: 1, competitorCount: 110 },
      { name: "College Move-In", keyword: "college dorm essentials 2025", predictedVolume: "320K", confidence: 92, category: "Shopping", yoyGrowth: 12, trafficImpact: "high", exactDate: "08-15", source: "seasonal", lastYearRank: 3 },
      { name: "Tax-Free Weekend", keyword: "tax free weekend 2025 states", predictedVolume: "245K", confidence: 90, category: "Shopping", yoyGrowth: 10, trafficImpact: "high", exactDate: "08-08", source: "seasonal" },
      { name: "Summer End Sales", keyword: "end of summer deals 2025", predictedVolume: "195K", confidence: 88, category: "Shopping", yoyGrowth: 8, trafficImpact: "medium", exactDate: "08-25", source: "seasonal" },
      { name: "Gamescom", keyword: "gamescom 2025 game reveals", predictedVolume: "145K", confidence: 84, category: "Entertainment", yoyGrowth: 12, trafficImpact: "medium", exactDate: "08-20", source: "industry" },
      { name: "National Dog Day", keyword: "national dog day activities", predictedVolume: "78K", confidence: 80, category: "Lifestyle", yoyGrowth: 20, trafficImpact: "low", exactDate: "08-26", source: "news" },
      { name: "Fall Fashion Preview", keyword: "fall fashion trends 2025 preview", predictedVolume: "165K", confidence: 85, category: "Fashion", yoyGrowth: 15, trafficImpact: "medium", exactDate: "08-15", source: "google_trends" },
      { name: "Back to Work", keyword: "return to office tips 2025", predictedVolume: "95K", confidence: 78, category: "Education", yoyGrowth: 8, trafficImpact: "low", exactDate: "08-25", source: "google_trends" },
      { name: "Pre-Fall Travel", keyword: "september travel destinations", predictedVolume: "125K", confidence: 82, category: "Travel", yoyGrowth: 10, trafficImpact: "medium", exactDate: "08-20", source: "google_trends" },
      { name: "iPhone Rumors", keyword: "iphone 17 release date rumors", predictedVolume: "280K", confidence: 86, category: "Tech", yoyGrowth: 15, trafficImpact: "high", exactDate: "08-01", source: "google_trends" },
    ]
  },
  {
    month: "September",
    monthIndex: 8,
    year: 2025,
    season: "fall",
    events: [
      { name: "Labor Day", keyword: "labor day sales 2025", predictedVolume: "380K", confidence: 94, category: "Shopping", yoyGrowth: 10, trafficImpact: "high", exactDate: "09-01", source: "seasonal", lastYearRank: 1 },
      { name: "Apple Event", keyword: "iphone 17 announcement 2025", predictedVolume: "520K", confidence: 95, category: "Tech", yoyGrowth: 18, trafficImpact: "high", exactDate: "09-09", source: "industry", lastYearRank: 2, competitorCount: 85 },
      { name: "Fall Fashion", keyword: "fall fashion trends 2025", predictedVolume: "320K", confidence: 91, category: "Fashion", yoyGrowth: 18, trafficImpact: "high", exactDate: "09-15", source: "google_trends" },
      { name: "NFL Kickoff", keyword: "nfl season 2025 predictions", predictedVolume: "280K", confidence: 93, category: "Sports", yoyGrowth: 12, trafficImpact: "high", exactDate: "09-04", source: "seasonal" },
      { name: "Oktoberfest Start", keyword: "oktoberfest 2025 munich guide", predictedVolume: "145K", confidence: 87, category: "Travel", yoyGrowth: 15, trafficImpact: "medium", exactDate: "09-20", source: "seasonal" },
      { name: "Fall Home Decor", keyword: "fall home decor ideas 2025", predictedVolume: "195K", confidence: 88, category: "Lifestyle", yoyGrowth: 12, trafficImpact: "high", exactDate: "09-01", source: "google_trends" },
      { name: "IFA Berlin", keyword: "ifa 2025 tech announcements", predictedVolume: "95K", confidence: 82, category: "Tech", yoyGrowth: 10, trafficImpact: "medium", exactDate: "09-05", source: "industry" },
      { name: "Back to Routine", keyword: "productivity tips fall 2025", predictedVolume: "78K", confidence: 80, category: "Lifestyle", yoyGrowth: 8, trafficImpact: "low", exactDate: "09-02", source: "google_trends" },
      { name: "Fall Recipes", keyword: "fall comfort food recipes", predictedVolume: "165K", confidence: 86, category: "Food", yoyGrowth: 10, trafficImpact: "medium", exactDate: "09-22", source: "google_trends" },
      { name: "College Football", keyword: "college football rankings 2025", predictedVolume: "210K", confidence: 90, category: "Sports", yoyGrowth: 8, trafficImpact: "medium", exactDate: "09-01", source: "seasonal" },
    ]
  },
  {
    month: "October",
    monthIndex: 9,
    year: 2025,
    season: "fall",
    events: [
      { name: "Halloween", keyword: "halloween costume ideas 2025", predictedVolume: "980K", confidence: 98, category: "Entertainment", yoyGrowth: 12, trafficImpact: "high", exactDate: "10-31", source: "seasonal", lastYearRank: 1, competitorCount: 145 },
      { name: "Breast Cancer Month", keyword: "breast cancer awareness 2025", predictedVolume: "165K", confidence: 93, category: "Health", yoyGrowth: 8, trafficImpact: "medium", exactDate: "10-01", source: "news" },
      { name: "Prime Fall Deal", keyword: "amazon prime fall deals 2025", predictedVolume: "420K", confidence: 90, category: "Shopping", yoyGrowth: 25, trafficImpact: "high", exactDate: "10-08", source: "seasonal" },
      { name: "Pumpkin Season", keyword: "pumpkin recipes fall 2025", predictedVolume: "195K", confidence: 89, category: "Food", yoyGrowth: 10, trafficImpact: "high", exactDate: "10-01", source: "google_trends" },
      { name: "Horror Movie Season", keyword: "best horror movies 2025", predictedVolume: "145K", confidence: 85, category: "Entertainment", yoyGrowth: 15, trafficImpact: "medium", exactDate: "10-01", source: "google_trends" },
      { name: "Fall Travel", keyword: "fall foliage destinations 2025", predictedVolume: "180K", confidence: 87, category: "Travel", yoyGrowth: 12, trafficImpact: "high", exactDate: "10-10", source: "google_trends" },
      { name: "Diwali", keyword: "diwali celebration ideas 2025", predictedVolume: "125K", confidence: 86, category: "Lifestyle", yoyGrowth: 20, trafficImpact: "medium", exactDate: "10-20", source: "seasonal" },
      { name: "World Series", keyword: "world series 2025 predictions", predictedVolume: "165K", confidence: 88, category: "Sports", yoyGrowth: 8, trafficImpact: "medium", exactDate: "10-25", source: "seasonal" },
      { name: "Early Holiday Planning", keyword: "holiday gift ideas 2025", predictedVolume: "220K", confidence: 85, category: "Shopping", yoyGrowth: 15, trafficImpact: "high", exactDate: "10-15", source: "google_trends" },
      { name: "Flu Season Start", keyword: "flu shot 2025 recommendations", predictedVolume: "145K", confidence: 88, category: "Health", yoyGrowth: 10, trafficImpact: "medium", exactDate: "10-01", source: "seasonal" },
    ]
  },
  {
    month: "November",
    monthIndex: 10,
    year: 2025,
    season: "fall",
    events: [
      { name: "Black Friday", keyword: "black friday deals 2025", predictedVolume: "1.5M", confidence: 99, category: "Shopping", yoyGrowth: 20, trafficImpact: "high", exactDate: "11-28", source: "seasonal", lastYearRank: 1, competitorCount: 200 },
      { name: "Thanksgiving", keyword: "thanksgiving recipes 2025", predictedVolume: "650K", confidence: 97, category: "Food", yoyGrowth: 8, trafficImpact: "high", exactDate: "11-27", source: "seasonal", lastYearRank: 2 },
      { name: "Cyber Monday", keyword: "cyber monday deals 2025", predictedVolume: "980K", confidence: 98, category: "Shopping", yoyGrowth: 22, trafficImpact: "high", exactDate: "12-01", source: "seasonal", lastYearRank: 3, competitorCount: 180 },
      { name: "Singles Day", keyword: "singles day sales 2025", predictedVolume: "380K", confidence: 88, category: "Shopping", yoyGrowth: 30, trafficImpact: "high", exactDate: "11-11", source: "seasonal" },
      { name: "Veterans Day", keyword: "veterans day deals 2025", predictedVolume: "165K", confidence: 85, category: "Shopping", yoyGrowth: 10, trafficImpact: "medium", exactDate: "11-11", source: "seasonal" },
      { name: "Holiday Hosting", keyword: "thanksgiving hosting tips", predictedVolume: "195K", confidence: 87, category: "Lifestyle", yoyGrowth: 8, trafficImpact: "high", exactDate: "11-20", source: "google_trends" },
      { name: "Small Business Saturday", keyword: "small business saturday 2025", predictedVolume: "145K", confidence: 86, category: "Shopping", yoyGrowth: 15, trafficImpact: "medium", exactDate: "11-29", source: "news" },
      { name: "Holiday Travel", keyword: "thanksgiving travel tips 2025", predictedVolume: "280K", confidence: 90, category: "Travel", yoyGrowth: 12, trafficImpact: "high", exactDate: "11-25", source: "google_trends" },
      { name: "Gift Guide Launch", keyword: "holiday gift guide 2025", predictedVolume: "420K", confidence: 92, category: "Shopping", yoyGrowth: 18, trafficImpact: "high", exactDate: "11-01", source: "google_trends" },
      { name: "AWS re:Invent", keyword: "aws reinvent 2025 announcements", predictedVolume: "145K", confidence: 84, category: "Tech", yoyGrowth: 12, trafficImpact: "medium", exactDate: "11-30", source: "industry" },
    ]
  },
  {
    month: "December",
    monthIndex: 11,
    year: 2025,
    season: "winter",
    events: [
      { name: "Christmas", keyword: "christmas gift ideas 2025", predictedVolume: "1.2M", confidence: 99, category: "Shopping", yoyGrowth: 15, trafficImpact: "high", exactDate: "12-25", source: "seasonal", lastYearRank: 1, competitorCount: 180 },
      { name: "New Year's Eve", keyword: "new years eve party ideas 2025", predictedVolume: "380K", confidence: 95, category: "Entertainment", yoyGrowth: 10, trafficImpact: "high", exactDate: "12-31", source: "seasonal", lastYearRank: 2 },
      { name: "Year in Review", keyword: "best of 2025 recap", predictedVolume: "420K", confidence: 92, category: "Media", yoyGrowth: 22, trafficImpact: "high", exactDate: "12-28", source: "google_trends" },
      { name: "Hanukkah", keyword: "hanukkah gift ideas 2025", predictedVolume: "125K", confidence: 88, category: "Lifestyle", yoyGrowth: 12, trafficImpact: "medium", exactDate: "12-14", source: "seasonal" },
      { name: "Winter Solstice", keyword: "winter solstice traditions 2025", predictedVolume: "78K", confidence: 80, category: "Lifestyle", yoyGrowth: 15, trafficImpact: "low", exactDate: "12-21", source: "news" },
      { name: "Last-Minute Gifts", keyword: "last minute christmas gifts 2025", predictedVolume: "520K", confidence: 94, category: "Shopping", yoyGrowth: 18, trafficImpact: "high", exactDate: "12-20", source: "google_trends", lastYearRank: 4 },
      { name: "After Christmas Sales", keyword: "after christmas sales 2025", predictedVolume: "280K", confidence: 89, category: "Shopping", yoyGrowth: 12, trafficImpact: "high", exactDate: "12-26", source: "seasonal" },
      { name: "Holiday Movies", keyword: "best christmas movies 2025", predictedVolume: "195K", confidence: 85, category: "Entertainment", yoyGrowth: 8, trafficImpact: "medium", exactDate: "12-01", source: "google_trends" },
      { name: "Year-End Finance", keyword: "year end tax planning 2025", predictedVolume: "165K", confidence: 87, category: "Finance", yoyGrowth: 8, trafficImpact: "medium", exactDate: "12-15", source: "seasonal" },
      { name: "New Year Prep", keyword: "new year resolution ideas 2026", predictedVolume: "245K", confidence: 90, category: "Health", yoyGrowth: 10, trafficImpact: "high", exactDate: "12-28", source: "google_trends" },
      { name: "Spotify Wrapped", keyword: "spotify wrapped 2025", predictedVolume: "320K", confidence: 93, category: "Media", yoyGrowth: 25, trafficImpact: "high", exactDate: "12-01", source: "news" },
    ]
  },
]
