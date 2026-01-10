// types/db.types.ts

// 1. Master Keyword (Cached Global Data)
export type MasterKeyword = {
  id: number;
  keyword_text: string;
  country_code: string;
  volume: number;
  kd: number;
  cpc: number;
  intent: string[]; // Array like ['commercial', 'informational']
  labs_fetched_at: string; // ISO Date string
  serp_updated_at: string | null;
};

// 2. SERP Snapshot (Live Google Data)
export type SerpSnapshot = {
  id: string; // UUID
  keyword_text: string;
  country_code: string;
  
  // Raw JSONB structures (mapped to specific types if needed later)
  raw_data: any; 
  
  // Weak Spots (Reddit/Quora etc.)
  weak_spots: {
    domain: string;
    rank: number;
    url: string;
    type: 'reddit' | 'quora' | 'pinterest' | 'other';
  }[];
  
  // Features (Video Pack, Snippets)
  serp_features: {
    video_pack: boolean;
    featured_snippet: boolean;
    people_also_ask: boolean;
    shopping_ads: boolean;
  };
  
  fetched_at: string;
  expires_at: string;
};

// 3. Social Intelligence (Deep Dive Data)
export type SocialIntelligence = {
  id: string; // UUID
  keyword_text: string;
  country_code: string;
  
  // Metrics
  youtube_viral_score: number | null;
  youtube_fgi: number | null;
  reddit_heat_index: number | null;
  parasite_score: number | null;
  
  // Stored JSON Data
  youtube_data: any; 
  reddit_data: any;
  
  fetched_at: string;
};

// 4. User Credit Transactions (Ledger)
export type UserCreditTransaction = {
  id: string;
  user_id: string;
  amount: number; // Negative for spend, Positive for buy
  action_type: 'row_refresh' | 'social_unlock' | 'topup' | 'signup_bonus';
  keyword_text?: string;
  country_code?: string;
  created_at: string;
};
