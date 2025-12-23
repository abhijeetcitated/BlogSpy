/**
 * Schema Markup Generator Types
 * 
 * Comprehensive type definitions for structured data/schema markup generation
 */

// =============================================================================
// ENUMS & CONSTANTS
// =============================================================================

export type SchemaType = 
  | 'Article'
  | 'BlogPosting'
  | 'NewsArticle'
  | 'HowTo'
  | 'FAQ'
  | 'Product'
  | 'Review'
  | 'Recipe'
  | 'Event'
  | 'LocalBusiness'
  | 'Organization'
  | 'Person'
  | 'VideoObject'
  | 'WebPage'
  | 'BreadcrumbList'
  | 'ItemList';

export type ValidationStatus = 'valid' | 'warning' | 'error';
export type SchemaFormat = 'json-ld' | 'microdata' | 'rdfa';

export const SCHEMA_TYPE_LABELS: Record<SchemaType, string> = {
  Article: 'Article',
  BlogPosting: 'Blog Post',
  NewsArticle: 'News Article',
  HowTo: 'How-To Guide',
  FAQ: 'FAQ',
  Product: 'Product',
  Review: 'Review',
  Recipe: 'Recipe',
  Event: 'Event',
  LocalBusiness: 'Local Business',
  Organization: 'Organization',
  Person: 'Person',
  VideoObject: 'Video',
  WebPage: 'Web Page',
  BreadcrumbList: 'Breadcrumbs',
  ItemList: 'List'
};

export const SCHEMA_TYPE_ICONS: Record<SchemaType, string> = {
  Article: 'FileText',
  BlogPosting: 'FileEdit',
  NewsArticle: 'Newspaper',
  HowTo: 'ListChecks',
  FAQ: 'HelpCircle',
  Product: 'Package',
  Review: 'Star',
  Recipe: 'ChefHat',
  Event: 'Calendar',
  LocalBusiness: 'Store',
  Organization: 'Building2',
  Person: 'User',
  VideoObject: 'Video',
  WebPage: 'Globe',
  BreadcrumbList: 'Navigation',
  ItemList: 'List'
};

// =============================================================================
// SCHEMA PROPERTIES
// =============================================================================

export interface SchemaProperty {
  name: string;
  value: string | number | boolean | object | null;
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'date' | 'url' | 'array' | 'object';
  description: string;
  example?: string;
  validation?: ValidationResult;
}

export interface ValidationResult {
  status: ValidationStatus;
  message: string;
  suggestions?: string[];
}

// =============================================================================
// SCHEMA DEFINITIONS
// =============================================================================

export interface ArticleSchema {
  '@type': 'Article' | 'BlogPosting' | 'NewsArticle';
  headline: string;
  description?: string;
  image?: string | string[];
  datePublished?: string;
  dateModified?: string;
  author?: PersonSchema | OrganizationSchema;
  publisher?: OrganizationSchema;
  mainEntityOfPage?: string;
  articleBody?: string;
  wordCount?: number;
  keywords?: string[];
}

export interface HowToSchema {
  '@type': 'HowTo';
  name: string;
  description?: string;
  image?: string;
  totalTime?: string;
  estimatedCost?: {
    '@type': 'MonetaryAmount';
    currency: string;
    value: string;
  };
  supply?: HowToSupply[];
  tool?: HowToTool[];
  step: HowToStep[];
}

export interface HowToStep {
  '@type': 'HowToStep';
  name?: string;
  text: string;
  image?: string;
  url?: string;
}

export interface HowToSupply {
  '@type': 'HowToSupply';
  name: string;
}

export interface HowToTool {
  '@type': 'HowToTool';
  name: string;
}

export interface FAQSchema {
  '@type': 'FAQPage';
  mainEntity: FAQItem[];
}

export interface FAQItem {
  '@type': 'Question';
  name: string;
  acceptedAnswer: {
    '@type': 'Answer';
    text: string;
  };
}

export interface ProductSchema {
  '@type': 'Product';
  name: string;
  description?: string;
  image?: string | string[];
  brand?: {
    '@type': 'Brand';
    name: string;
  };
  sku?: string;
  gtin?: string;
  offers?: OfferSchema | OfferSchema[];
  aggregateRating?: AggregateRatingSchema;
  review?: ReviewSchema[];
}

export interface OfferSchema {
  '@type': 'Offer';
  price: string | number;
  priceCurrency: string;
  availability?: string;
  url?: string;
  priceValidUntil?: string;
  seller?: OrganizationSchema;
}

export interface ReviewSchema {
  '@type': 'Review';
  author?: PersonSchema;
  datePublished?: string;
  reviewBody?: string;
  reviewRating?: RatingSchema;
}

export interface RatingSchema {
  '@type': 'Rating';
  ratingValue: number;
  bestRating?: number;
  worstRating?: number;
}

export interface AggregateRatingSchema {
  '@type': 'AggregateRating';
  ratingValue: number;
  reviewCount?: number;
  ratingCount?: number;
  bestRating?: number;
  worstRating?: number;
}

export interface RecipeSchema {
  '@type': 'Recipe';
  name: string;
  description?: string;
  image?: string | string[];
  author?: PersonSchema;
  datePublished?: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  recipeYield?: string;
  recipeCategory?: string;
  recipeCuisine?: string;
  recipeIngredient?: string[];
  recipeInstructions?: HowToStep[] | string[];
  nutrition?: NutritionSchema;
  aggregateRating?: AggregateRatingSchema;
}

export interface NutritionSchema {
  '@type': 'NutritionInformation';
  calories?: string;
  servingSize?: string;
}

export interface EventSchema {
  '@type': 'Event';
  name: string;
  description?: string;
  image?: string;
  startDate: string;
  endDate?: string;
  location?: PlaceSchema | VirtualLocationSchema;
  organizer?: OrganizationSchema | PersonSchema;
  performer?: PersonSchema | OrganizationSchema;
  offers?: OfferSchema | OfferSchema[];
  eventStatus?: string;
  eventAttendanceMode?: string;
}

export interface PlaceSchema {
  '@type': 'Place';
  name: string;
  address?: PostalAddressSchema;
}

export interface VirtualLocationSchema {
  '@type': 'VirtualLocation';
  url: string;
}

export interface PostalAddressSchema {
  '@type': 'PostalAddress';
  streetAddress?: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry?: string;
}

export interface LocalBusinessSchema {
  '@type': 'LocalBusiness' | string;
  name: string;
  description?: string;
  image?: string;
  telephone?: string;
  email?: string;
  url?: string;
  address?: PostalAddressSchema;
  geo?: GeoCoordinatesSchema;
  openingHoursSpecification?: OpeningHoursSchema[];
  priceRange?: string;
  aggregateRating?: AggregateRatingSchema;
}

export interface GeoCoordinatesSchema {
  '@type': 'GeoCoordinates';
  latitude: number;
  longitude: number;
}

export interface OpeningHoursSchema {
  '@type': 'OpeningHoursSpecification';
  dayOfWeek: string | string[];
  opens: string;
  closes: string;
}

export interface OrganizationSchema {
  '@type': 'Organization';
  name: string;
  url?: string;
  logo?: string;
  sameAs?: string[];
}

export interface PersonSchema {
  '@type': 'Person';
  name: string;
  url?: string;
  image?: string;
  sameAs?: string[];
  jobTitle?: string;
}

export interface VideoObjectSchema {
  '@type': 'VideoObject';
  name: string;
  description?: string;
  thumbnailUrl?: string | string[];
  uploadDate?: string;
  duration?: string;
  contentUrl?: string;
  embedUrl?: string;
  interactionStatistic?: InteractionCounterSchema;
}

export interface InteractionCounterSchema {
  '@type': 'InteractionCounter';
  interactionType: { '@type': string };
  userInteractionCount: number;
}

export interface WebPageSchema {
  '@type': 'WebPage';
  name: string;
  description?: string;
  url?: string;
  datePublished?: string;
  dateModified?: string;
  author?: PersonSchema | OrganizationSchema;
  breadcrumb?: BreadcrumbListSchema;
}

export interface BreadcrumbListSchema {
  '@type': 'BreadcrumbList';
  itemListElement: BreadcrumbItemSchema[];
}

export interface BreadcrumbItemSchema {
  '@type': 'ListItem';
  position: number;
  name: string;
  item?: string;
}

export interface ItemListSchema {
  '@type': 'ItemList';
  itemListElement: ListItemSchema[];
  numberOfItems?: number;
}

export interface ListItemSchema {
  '@type': 'ListItem';
  position: number;
  item?: {
    '@type': string;
    name: string;
    url?: string;
  };
  name?: string;
  url?: string;
}

// =============================================================================
// UNIFIED SCHEMA TYPE
// =============================================================================

export type Schema = 
  | ArticleSchema 
  | HowToSchema 
  | FAQSchema 
  | ProductSchema 
  | ReviewSchema
  | RecipeSchema
  | EventSchema
  | LocalBusinessSchema
  | OrganizationSchema
  | PersonSchema
  | VideoObjectSchema
  | WebPageSchema
  | BreadcrumbListSchema
  | ItemListSchema;

export interface GeneratedSchema {
  '@context': 'https://schema.org';
  '@type': SchemaType;
  [key: string]: unknown;
}

// =============================================================================
// ANALYSIS & DETECTION
// =============================================================================

export interface ContentAnalysis {
  detectedTypes: SchemaType[];
  primaryType: SchemaType | null;
  confidence: number;
  extractedData: Record<string, unknown>;
  suggestions: SchemaSuggestion[];
}

export interface SchemaSuggestion {
  type: SchemaType;
  confidence: number;
  reason: string;
  missingFields: string[];
  presentFields: string[];
}

export interface SchemaValidation {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number;
}

export interface ValidationError {
  field: string;
  message: string;
  path: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  recommendation: string;
}

// =============================================================================
// GENERATOR RESULTS
// =============================================================================

export interface SchemaGeneratorResult {
  id: string;
  timestamp: Date;
  
  content: string;
  analysis: ContentAnalysis;
  
  generatedSchemas: GeneratedSchemaItem[];
  primarySchema: GeneratedSchemaItem | null;
  
  validation: SchemaValidation;
  
  jsonLd: string;
  preview: SchemaPreview;
  
  recommendations: SchemaRecommendation[];
}

export interface GeneratedSchemaItem {
  id: string;
  type: SchemaType;
  schema: GeneratedSchema;
  jsonLd: string;
  validation: SchemaValidation;
  isSelected: boolean;
}

export interface SchemaPreview {
  googlePreview: string;
  rawJson: string;
  formattedJson: string;
}

export interface SchemaRecommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  category: 'missing_field' | 'optimization' | 'additional_schema' | 'best_practice';
  title: string;
  description: string;
  action: string;
}

// =============================================================================
// SETTINGS & CONFIG
// =============================================================================

export interface SchemaGeneratorSettings {
  autoDetect: boolean;
  includeOptionalFields: boolean;
  generateMultiple: boolean;
  format: SchemaFormat;
  validateOnGenerate: boolean;
  includeOrganization: boolean;
  defaultOrganization?: Partial<OrganizationSchema>;
  defaultAuthor?: Partial<PersonSchema>;
}

export const DEFAULT_SCHEMA_SETTINGS: SchemaGeneratorSettings = {
  autoDetect: true,
  includeOptionalFields: true,
  generateMultiple: false,
  format: 'json-ld',
  validateOnGenerate: true,
  includeOrganization: true
};

// =============================================================================
// UI STATE
// =============================================================================

export interface SchemaGeneratorPanelState {
  activeTab: string;
  selectedSchemaId: string | null;
  editMode: boolean;
  showPreview: boolean;
  filterType: SchemaType | 'all';
}

// =============================================================================
// EXPORT OPTIONS
// =============================================================================

export interface SchemaExportOptions {
  format: 'json-ld' | 'html' | 'json';
  minified: boolean;
  includeScriptTag: boolean;
  combineSchemas: boolean;
}

// =============================================================================
// HOOK TYPES
// =============================================================================

export interface UseSchemaGeneratorOptions {
  settings?: Partial<SchemaGeneratorSettings>;
  autoGenerate?: boolean;
  onComplete?: (result: SchemaGeneratorResult) => void;
  onError?: (error: Error) => void;
}

export interface UseSchemaGeneratorReturn {
  result: SchemaGeneratorResult | null;
  isGenerating: boolean;
  error: Error | null;
  
  analysis: ContentAnalysis | null;
  generatedSchemas: GeneratedSchemaItem[];
  validation: SchemaValidation | null;
  recommendations: SchemaRecommendation[];
  
  generate: (content: string) => Promise<void>;
  regenerate: () => Promise<void>;
  
  generateForType: (type: SchemaType) => GeneratedSchemaItem | null;
  validateSchema: (schema: GeneratedSchema) => SchemaValidation;
  
  selectSchema: (schemaId: string) => void;
  updateSchema: (schemaId: string, updates: Partial<GeneratedSchema>) => void;
  removeSchema: (schemaId: string) => void;
  
  getJsonLd: (schemaIds?: string[]) => string;
  getHtmlScript: (schemaIds?: string[]) => string;
  exportSchema: (options: SchemaExportOptions) => string;
  
  settings: SchemaGeneratorSettings;
  updateSettings: (settings: Partial<SchemaGeneratorSettings>) => void;
}

// =============================================================================
// REQUIRED FIELDS BY TYPE
// =============================================================================

export const REQUIRED_FIELDS: Record<SchemaType, string[]> = {
  Article: ['headline', 'author', 'datePublished', 'image'],
  BlogPosting: ['headline', 'author', 'datePublished', 'image'],
  NewsArticle: ['headline', 'author', 'datePublished', 'image', 'dateline'],
  HowTo: ['name', 'step'],
  FAQ: ['mainEntity'],
  Product: ['name', 'offers'],
  Review: ['itemReviewed', 'author', 'reviewRating'],
  Recipe: ['name', 'recipeIngredient', 'recipeInstructions'],
  Event: ['name', 'startDate', 'location'],
  LocalBusiness: ['name', 'address'],
  Organization: ['name'],
  Person: ['name'],
  VideoObject: ['name', 'description', 'thumbnailUrl', 'uploadDate'],
  WebPage: ['name'],
  BreadcrumbList: ['itemListElement'],
  ItemList: ['itemListElement']
};

export const RECOMMENDED_FIELDS: Record<SchemaType, string[]> = {
  Article: ['description', 'publisher', 'mainEntityOfPage', 'wordCount'],
  BlogPosting: ['description', 'publisher', 'mainEntityOfPage'],
  NewsArticle: ['description', 'publisher', 'articleBody'],
  HowTo: ['description', 'image', 'totalTime', 'supply', 'tool'],
  FAQ: [],
  Product: ['description', 'image', 'brand', 'sku', 'aggregateRating', 'review'],
  Review: ['reviewBody', 'datePublished'],
  Recipe: ['description', 'image', 'prepTime', 'cookTime', 'totalTime', 'recipeYield', 'nutrition'],
  Event: ['description', 'image', 'endDate', 'offers', 'organizer'],
  LocalBusiness: ['telephone', 'openingHoursSpecification', 'geo', 'priceRange'],
  Organization: ['url', 'logo', 'sameAs'],
  Person: ['url', 'jobTitle', 'sameAs'],
  VideoObject: ['contentUrl', 'embedUrl', 'duration'],
  WebPage: ['description', 'url', 'datePublished', 'dateModified'],
  BreadcrumbList: [],
  ItemList: ['numberOfItems']
};
