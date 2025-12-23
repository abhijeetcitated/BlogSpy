/**
 * Schema Markup Generator Utilities
 * 
 * Production-grade utilities for generating, validating, and managing
 * structured data / schema markup
 */

import {
  SchemaType,
  Schema,
  GeneratedSchema,
  ContentAnalysis,
  SchemaSuggestion,
  SchemaValidation,
  ValidationError,
  ValidationWarning,
  SchemaGeneratorResult,
  GeneratedSchemaItem,
  SchemaPreview,
  SchemaRecommendation,
  SchemaGeneratorSettings,
  SchemaExportOptions,
  REQUIRED_FIELDS,
  RECOMMENDED_FIELDS,
  ArticleSchema,
  HowToSchema,
  FAQSchema,
  ProductSchema,
  RecipeSchema,
  EventSchema,
  LocalBusinessSchema,
  VideoObjectSchema,
  BreadcrumbListSchema,
  HowToStep,
  FAQItem,
  BreadcrumbItemSchema,
  PersonSchema,
  OrganizationSchema
} from '@/src/features/ai-writer/types/tools/schema-markup.types';

// =============================================================================
// CONTENT ANALYSIS & TYPE DETECTION
// =============================================================================

const TYPE_PATTERNS: Record<SchemaType, RegExp[]> = {
  Article: [
    /\b(article|post|blog|news|story|editorial)\b/i,
    /published|written by|author/i,
    /reading time|min read/i
  ],
  BlogPosting: [
    /\b(blog|post|personal)\b/i,
    /opinion|thoughts|experience/i
  ],
  NewsArticle: [
    /\b(news|breaking|report|latest)\b/i,
    /dateline|correspondent|press/i
  ],
  HowTo: [
    /\b(how to|guide|tutorial|steps?|instructions?)\b/i,
    /step\s*\d+|first.*then|follow these/i,
    /learn how|easy steps|beginner/i
  ],
  FAQ: [
    /\b(faq|frequently asked|questions?|q&a|q\s*:\s*|a\s*:\s*)\b/i,
    /what is|how do|why does|can i|should i/i
  ],
  Product: [
    /\b(product|buy|purchase|price|shop|order)\b/i,
    /\$[\d,]+|\d+\s*(?:usd|eur|gbp)/i,
    /add to cart|in stock|out of stock/i
  ],
  Review: [
    /\b(review|rating|stars?|recommend|verdict)\b/i,
    /pros and cons|overall score|we tested/i,
    /\d+\/\d+|â˜…+/
  ],
  Recipe: [
    /\b(recipe|ingredients?|cook|bake|prep time)\b/i,
    /cups?|tablespoons?|teaspoons?|minutes?|hours?/i,
    /preheat|simmer|whisk|mix|stir/i
  ],
  Event: [
    /\b(event|conference|workshop|webinar|meetup)\b/i,
    /when|date|time|location|register|tickets/i,
    /join us|attend|rsvp/i
  ],
  LocalBusiness: [
    /\b(business|store|shop|restaurant|salon)\b/i,
    /address|phone|hours|location|visit us/i,
    /open|closed|monday|tuesday/i
  ],
  Organization: [
    /\b(company|organization|corporation|inc|llc)\b/i,
    /about us|our mission|founded/i
  ],
  Person: [
    /\b(about|bio|profile|author)\b/i,
    /experience|education|skills/i
  ],
  VideoObject: [
    /\b(video|watch|play|stream)\b/i,
    /youtube|vimeo|embed/i,
    /duration|views|subscribe/i
  ],
  WebPage: [
    /\b(page|website|site|home)\b/i
  ],
  BreadcrumbList: [
    /home\s*[>Â»â€º]\s*/i,
    /breadcrumb|navigation path/i
  ],
  ItemList: [
    /\b(list|top\s*\d+|best\s*\d+|ranking)\b/i,
    /\d+\.\s+/m
  ]
};

export function analyzeContent(content: string): ContentAnalysis {
  const detectedTypes: SchemaType[] = [];
  const suggestions: SchemaSuggestion[] = [];
  const extractedData: Record<string, unknown> = {};

  // Score each schema type
  const typeScores: Map<SchemaType, number> = new Map();

  for (const [type, patterns] of Object.entries(TYPE_PATTERNS) as [SchemaType, RegExp[]][]) {
    let score = 0;
    const matchedPatterns: string[] = [];

    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches) {
        score += 1;
        matchedPatterns.push(pattern.source);
      }
    }

    if (score > 0) {
      typeScores.set(type, score);
      detectedTypes.push(type);
      
      const requiredFields = REQUIRED_FIELDS[type];
      const presentFields = detectPresentFields(content, type);
      const missingFields = requiredFields.filter(f => !presentFields.includes(f));
      
      suggestions.push({
        type,
        confidence: Math.min(score / patterns.length, 1),
        reason: `Matched ${score} pattern(s): ${matchedPatterns.slice(0, 2).join(', ')}`,
        missingFields,
        presentFields
      });
    }
  }

  // Sort by score
  detectedTypes.sort((a, b) => (typeScores.get(b) || 0) - (typeScores.get(a) || 0));
  suggestions.sort((a, b) => b.confidence - a.confidence);

  const primaryType = detectedTypes.length > 0 ? detectedTypes[0] : null;
  const confidence = primaryType ? (typeScores.get(primaryType) || 0) / TYPE_PATTERNS[primaryType].length : 0;

  // Extract common data
  extractedData.title = extractTitle(content);
  extractedData.description = extractDescription(content);
  extractedData.dates = extractDates(content);
  extractedData.prices = extractPrices(content);
  extractedData.steps = extractSteps(content);
  extractedData.questions = extractQuestions(content);
  extractedData.ingredients = extractIngredients(content);

  return {
    detectedTypes,
    primaryType,
    confidence,
    extractedData,
    suggestions
  };
}

function detectPresentFields(content: string, type: SchemaType): string[] {
  const fields: string[] = [];
  const contentLower = content.toLowerCase();

  // Common field detection
  if (/title|headline/i.test(content) || content.length > 0) fields.push('headline', 'name');
  if (/description|summary|overview/i.test(contentLower)) fields.push('description');
  if (/\d{4}[-/]\d{2}[-/]\d{2}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i.test(content)) {
    fields.push('datePublished', 'startDate');
  }
  if (/author|by\s+\w+|written by/i.test(content)) fields.push('author');
  if (/\.(jpg|jpeg|png|gif|webp)/i.test(content) || /image|photo|picture/i.test(contentLower)) {
    fields.push('image', 'thumbnailUrl');
  }

  // Type-specific detection
  if (type === 'HowTo' || type === 'Recipe') {
    if (/step\s*\d+|^\d+\.\s+/mi.test(content)) fields.push('step', 'recipeInstructions');
  }
  if (type === 'FAQ') {
    if (/\?/g.test(content)) fields.push('mainEntity');
  }
  if (type === 'Product') {
    if (/\$[\d,]+|\d+\.\d{2}/i.test(content)) fields.push('offers');
  }

  return [...new Set(fields)];
}

// =============================================================================
// DATA EXTRACTION
// =============================================================================

function extractTitle(content: string): string | null {
  // Try to find title/headline patterns
  const titleMatch = content.match(/^#\s+(.+)$/m) || 
                     content.match(/^(.{10,100}?)[\n.]/);
  return titleMatch ? titleMatch[1].trim() : content.slice(0, 60).trim();
}

function extractDescription(content: string): string | null {
  // Get first paragraph or summary
  const paragraphs = content.split(/\n\n+/);
  for (const p of paragraphs) {
    const cleaned = p.replace(/^#+\s*/, '').trim();
    if (cleaned.length >= 50 && cleaned.length <= 300) {
      return cleaned;
    }
  }
  return content.slice(0, 160).replace(/\s+/g, ' ').trim();
}

function extractDates(content: string): string[] {
  const datePatterns = [
    /\d{4}[-/]\d{2}[-/]\d{2}/g,
    /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2},?\s+\d{4}/gi,
    /\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}/gi
  ];

  const dates: string[] = [];
  for (const pattern of datePatterns) {
    const matches = content.match(pattern);
    if (matches) dates.push(...matches);
  }
  return dates;
}

function extractPrices(content: string): { value: string; currency: string }[] {
  const pricePatterns = [
    /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g,
    /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:USD|EUR|GBP)/gi
  ];

  const prices: { value: string; currency: string }[] = [];
  for (const pattern of pricePatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      prices.push({
        value: match[1].replace(/,/g, ''),
        currency: match[0].includes('EUR') ? 'EUR' : match[0].includes('GBP') ? 'GBP' : 'USD'
      });
    }
  }
  return prices;
}

function extractSteps(content: string): { text: string; number: number }[] {
  const steps: { text: string; number: number }[] = [];
  
  // Numbered steps - split by newlines and match patterns
  const lines = content.split('\n');
  const numberedRegex = /^(\d+)[.):]\s*(.+)$/;
  const stepRegex = /^step\s*(\d+)[:\s-]*(.+)$/i;
  
  for (const line of lines) {
    const trimmed = line.trim();
    const numMatch = trimmed.match(numberedRegex);
    if (numMatch) {
      steps.push({
        number: parseInt(numMatch[1]),
        text: numMatch[2].trim()
      });
      continue;
    }
    
    const stepMatch = trimmed.match(stepRegex);
    if (stepMatch) {
      steps.push({
        number: parseInt(stepMatch[1]),
        text: stepMatch[2].trim()
      });
    }
  }

  return steps.sort((a, b) => a.number - b.number);
}

function extractQuestions(content: string): { question: string; answer: string }[] {
  const questions: { question: string; answer: string }[] = [];
  
  // Process content in blocks separated by double newlines
  const blocks = content.split(/\n{2,}/);
  
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i].trim();
    
    // Q: A: format
    const qaMatch = block.match(/(?:q|question)[:\s]*(.+)/i);
    if (qaMatch && i + 1 < blocks.length) {
      const nextBlock = blocks[i + 1].trim();
      const answerMatch = nextBlock.match(/(?:a|answer)[:\s]*([\s\S]+)/i);
      if (answerMatch) {
        questions.push({
          question: qaMatch[1].trim(),
          answer: answerMatch[1].trim()
        });
        i++; // Skip the answer block
        continue;
      }
    }
    
    // Question ending with ?
    if (block.endsWith('?') && i + 1 < blocks.length) {
      const nextBlock = blocks[i + 1].trim();
      if (!nextBlock.endsWith('?')) {
        questions.push({
          question: block,
          answer: nextBlock
        });
        i++;
      }
    }
  }

  return questions;
}

function extractIngredients(content: string): string[] {
  const ingredients: string[] = [];
  
  // Common ingredient patterns
  const ingredientSection = content.match(/ingredients?[:\s]*\n([\s\S]+?)(?=\n(?:instructions?|directions?|steps?|method)|$)/i);
  if (ingredientSection) {
    const lines = ingredientSection[1].split('\n');
    for (const line of lines) {
      const cleaned = line.replace(/^[-â€¢*]\s*/, '').trim();
      if (cleaned && cleaned.length > 2 && cleaned.length < 100) {
        ingredients.push(cleaned);
      }
    }
  }

  return ingredients;
}

// =============================================================================
// SCHEMA GENERATION
// =============================================================================

export function generateSchema(
  type: SchemaType,
  content: string,
  settings: SchemaGeneratorSettings
): GeneratedSchema {
  const analysis = analyzeContent(content);
  const { extractedData } = analysis;

  const baseSchema: GeneratedSchema = {
    '@context': 'https://schema.org',
    '@type': type
  };

  switch (type) {
    case 'Article':
    case 'BlogPosting':
    case 'NewsArticle':
      return generateArticleSchema(baseSchema, extractedData, type, settings);
    case 'HowTo':
      return generateHowToSchema(baseSchema, extractedData, settings);
    case 'FAQ':
      return generateFAQSchema(baseSchema, extractedData, settings);
    case 'Product':
      return generateProductSchema(baseSchema, extractedData, settings);
    case 'Recipe':
      return generateRecipeSchema(baseSchema, extractedData, settings);
    case 'Event':
      return generateEventSchema(baseSchema, extractedData, settings);
    case 'LocalBusiness':
      return generateLocalBusinessSchema(baseSchema, extractedData, settings);
    case 'VideoObject':
      return generateVideoSchema(baseSchema, extractedData, settings);
    case 'BreadcrumbList':
      return generateBreadcrumbSchema(baseSchema, extractedData);
    default:
      return {
        ...baseSchema,
        name: extractedData.title || 'Untitled',
        description: extractedData.description
      };
  }
}

function generateArticleSchema(
  base: GeneratedSchema,
  data: Record<string, unknown>,
  type: 'Article' | 'BlogPosting' | 'NewsArticle',
  settings: SchemaGeneratorSettings
): GeneratedSchema {
  const schema: GeneratedSchema & Partial<ArticleSchema> = {
    ...base,
    '@type': type,
    headline: (data.title as string) || 'Article Title',
    description: (data.description as string) || undefined
  };

  const dates = data.dates as string[] | undefined;
  if (dates && dates.length > 0) {
    schema.datePublished = formatDateISO(dates[0]);
    if (dates.length > 1) {
      schema.dateModified = formatDateISO(dates[dates.length - 1]);
    }
  }

  if (settings.defaultAuthor) {
    schema.author = {
      '@type': 'Person',
      ...settings.defaultAuthor
    } as PersonSchema;
  }

  if (settings.includeOrganization && settings.defaultOrganization) {
    schema.publisher = {
      '@type': 'Organization',
      ...settings.defaultOrganization
    } as OrganizationSchema;
  }

  return schema;
}

function generateHowToSchema(
  base: GeneratedSchema,
  data: Record<string, unknown>,
  settings: SchemaGeneratorSettings
): GeneratedSchema {
  const steps = data.steps as { text: string; number: number }[] | undefined;
  
  const howToSteps: HowToStep[] = (steps || []).map((step, index) => ({
    '@type': 'HowToStep',
    name: `Step ${step.number || index + 1}`,
    text: step.text
  }));

  const schema: GeneratedSchema & Partial<HowToSchema> = {
    ...base,
    '@type': 'HowTo',
    name: (data.title as string) || 'How To Guide',
    description: (data.description as string) || undefined,
    step: howToSteps.length > 0 ? howToSteps : [
      { '@type': 'HowToStep', name: 'Step 1', text: 'First step description' }
    ]
  };

  return schema;
}

function generateFAQSchema(
  base: GeneratedSchema,
  data: Record<string, unknown>,
  _settings: SchemaGeneratorSettings
): GeneratedSchema {
  const questions = data.questions as { question: string; answer: string }[] | undefined;
  
  const faqItems: FAQItem[] = (questions || []).map(q => ({
    '@type': 'Question' as const,
    name: q.question,
    acceptedAnswer: {
      '@type': 'Answer' as const,
      text: q.answer
    }
  }));

  return {
    '@context': base['@context'],
    '@type': 'FAQPage',
    mainEntity: faqItems.length > 0 ? faqItems : [
      {
        '@type': 'Question' as const,
        name: 'Sample question?',
        acceptedAnswer: {
          '@type': 'Answer' as const,
          text: 'Sample answer'
        }
      }
    ]
  } as unknown as GeneratedSchema;
}

function generateProductSchema(
  base: GeneratedSchema,
  data: Record<string, unknown>,
  _settings: SchemaGeneratorSettings
): GeneratedSchema {
  const prices = data.prices as { value: string; currency: string }[] | undefined;
  
  const schema: GeneratedSchema & Partial<ProductSchema> = {
    ...base,
    '@type': 'Product',
    name: (data.title as string) || 'Product Name',
    description: (data.description as string) || undefined
  };

  if (prices && prices.length > 0) {
    schema.offers = {
      '@type': 'Offer',
      price: prices[0].value,
      priceCurrency: prices[0].currency,
      availability: 'https://schema.org/InStock'
    };
  }

  return schema;
}

function generateRecipeSchema(
  base: GeneratedSchema,
  data: Record<string, unknown>,
  settings: SchemaGeneratorSettings
): GeneratedSchema {
  const ingredients = data.ingredients as string[] | undefined;
  const steps = data.steps as { text: string; number: number }[] | undefined;

  const recipeInstructions: HowToStep[] = (steps || []).map((step, index) => ({
    '@type': 'HowToStep' as const,
    name: `Step ${step.number || index + 1}`,
    text: step.text
  }));

  const schema: GeneratedSchema = {
    ...base,
    '@type': 'Recipe' as const,
    name: (data.title as string) || 'Recipe Name',
    description: (data.description as string) || undefined,
    recipeIngredient: ingredients || ['Ingredient 1', 'Ingredient 2'],
    recipeInstructions
  };

  if (settings.defaultAuthor) {
    (schema as Record<string, unknown>).author = {
      '@type': 'Person',
      ...settings.defaultAuthor
    } as PersonSchema;
  }

  return schema;
}

function generateEventSchema(
  base: GeneratedSchema,
  data: Record<string, unknown>,
  settings: SchemaGeneratorSettings
): GeneratedSchema {
  const dates = data.dates as string[] | undefined;

  const schema: GeneratedSchema & Partial<EventSchema> = {
    ...base,
    '@type': 'Event',
    name: (data.title as string) || 'Event Name',
    description: (data.description as string) || undefined,
    startDate: dates && dates.length > 0 ? formatDateISO(dates[0]) : new Date().toISOString()
  };

  if (dates && dates.length > 1) {
    schema.endDate = formatDateISO(dates[1]);
  }

  if (settings.includeOrganization && settings.defaultOrganization) {
    schema.organizer = {
      '@type': 'Organization',
      ...settings.defaultOrganization
    } as OrganizationSchema;
  }

  return schema;
}

function generateLocalBusinessSchema(
  base: GeneratedSchema,
  data: Record<string, unknown>,
  _settings: SchemaGeneratorSettings
): GeneratedSchema {
  const schema: GeneratedSchema & Partial<LocalBusinessSchema> = {
    ...base,
    '@type': 'LocalBusiness',
    name: (data.title as string) || 'Business Name',
    description: (data.description as string) || undefined
  };

  return schema;
}

function generateVideoSchema(
  base: GeneratedSchema,
  data: Record<string, unknown>,
  _settings: SchemaGeneratorSettings
): GeneratedSchema {
  const dates = data.dates as string[] | undefined;

  const schema: GeneratedSchema & Partial<VideoObjectSchema> = {
    ...base,
    '@type': 'VideoObject',
    name: (data.title as string) || 'Video Title',
    description: (data.description as string) || 'Video description',
    uploadDate: dates && dates.length > 0 ? formatDateISO(dates[0]) : new Date().toISOString()
  };

  return schema;
}

function generateBreadcrumbSchema(
  base: GeneratedSchema,
  _data: Record<string, unknown>
): GeneratedSchema {
  const schema: GeneratedSchema & Partial<BreadcrumbListSchema> = {
    ...base,
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: '/' } as BreadcrumbItemSchema
    ]
  };

  return schema;
}

// =============================================================================
// SCHEMA VALIDATION
// =============================================================================

export function validateSchema(schema: GeneratedSchema): SchemaValidation {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const type = schema['@type'] as SchemaType;

  // Check required fields
  const requiredFields = REQUIRED_FIELDS[type] || [];
  for (const field of requiredFields) {
    if (!schema[field]) {
      errors.push({
        field,
        message: `Required field "${field}" is missing`,
        path: `$.${field}`
      });
    }
  }

  // Check recommended fields
  const recommendedFields = RECOMMENDED_FIELDS[type] || [];
  for (const field of recommendedFields) {
    if (!schema[field]) {
      warnings.push({
        field,
        message: `Recommended field "${field}" is missing`,
        recommendation: `Add "${field}" to improve rich results eligibility`
      });
    }
  }

  // Validate field values
  validateFieldValues(schema, errors, warnings);

  // Calculate score
  const totalFields = requiredFields.length + recommendedFields.length;
  const presentRequired = requiredFields.filter(f => !!schema[f]).length;
  const presentRecommended = recommendedFields.filter(f => !!schema[f]).length;
  
  const score = totalFields > 0
    ? Math.round(((presentRequired * 2 + presentRecommended) / (requiredFields.length * 2 + recommendedFields.length)) * 100)
    : 100;

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score
  };
}

function validateFieldValues(
  schema: GeneratedSchema,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  // Validate URLs
  const urlFields = ['url', 'image', 'logo', 'mainEntityOfPage', 'contentUrl', 'embedUrl'];
  for (const field of urlFields) {
    const value = schema[field];
    if (value && typeof value === 'string' && !isValidUrl(value)) {
      errors.push({
        field,
        message: `Invalid URL format in "${field}"`,
        path: `$.${field}`
      });
    }
  }

  // Validate dates
  const dateFields = ['datePublished', 'dateModified', 'startDate', 'endDate', 'uploadDate'];
  for (const field of dateFields) {
    const value = schema[field];
    if (value && typeof value === 'string' && !isValidISODate(value)) {
      warnings.push({
        field,
        message: `Date in "${field}" is not in ISO 8601 format`,
        recommendation: 'Use ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ'
      });
    }
  }

  // Validate price
  if ('offers' in schema) {
    const offers = schema.offers as Record<string, unknown>;
    if (offers && typeof offers === 'object') {
      if (offers.price && typeof offers.price === 'string' && isNaN(parseFloat(offers.price as string))) {
        errors.push({
          field: 'offers.price',
          message: 'Price must be a valid number',
          path: '$.offers.price'
        });
      }
    }
  }

  // Validate headline length
  if (schema.headline && typeof schema.headline === 'string') {
    if ((schema.headline as string).length > 110) {
      warnings.push({
        field: 'headline',
        message: 'Headline is too long (max 110 characters recommended)',
        recommendation: 'Shorten the headline to under 110 characters'
      });
    }
  }
}

function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

function isValidISODate(str: string): boolean {
  const date = new Date(str);
  return !isNaN(date.getTime());
}

function formatDateISO(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  } catch {
    // Fall through
  }
  return new Date().toISOString();
}

// =============================================================================
// MAIN GENERATOR FUNCTION
// =============================================================================

export function generateSchemaMarkup(
  content: string,
  settings: SchemaGeneratorSettings
): SchemaGeneratorResult {
  const analysis = analyzeContent(content);
  const generatedSchemas: GeneratedSchemaItem[] = [];
  
  // Generate schemas for detected types
  const typesToGenerate = settings.generateMultiple 
    ? analysis.detectedTypes.slice(0, 5)
    : analysis.primaryType ? [analysis.primaryType] : [];

  for (const type of typesToGenerate) {
    const schema = generateSchema(type, content, settings);
    const validation = settings.validateOnGenerate ? validateSchema(schema) : {
      isValid: true,
      errors: [],
      warnings: [],
      score: 100
    };

    generatedSchemas.push({
      id: `schema_${type}_${Date.now()}`,
      type,
      schema,
      jsonLd: generateJsonLd(schema),
      validation,
      isSelected: type === analysis.primaryType
    });
  }

  const primarySchema = generatedSchemas.find(s => s.isSelected) || generatedSchemas[0] || null;
  
  const combinedValidation: SchemaValidation = {
    isValid: generatedSchemas.every(s => s.validation.isValid),
    errors: generatedSchemas.flatMap(s => s.validation.errors),
    warnings: generatedSchemas.flatMap(s => s.validation.warnings),
    score: generatedSchemas.length > 0
      ? Math.round(generatedSchemas.reduce((sum, s) => sum + s.validation.score, 0) / generatedSchemas.length)
      : 0
  };

  const recommendations = generateRecommendations(analysis, generatedSchemas, settings);

  return {
    id: `result_${Date.now()}`,
    timestamp: new Date(),
    content,
    analysis,
    generatedSchemas,
    primarySchema,
    validation: combinedValidation,
    jsonLd: primarySchema ? primarySchema.jsonLd : '',
    preview: generatePreview(primarySchema?.schema || null),
    recommendations
  };
}

// =============================================================================
// JSON-LD GENERATION
// =============================================================================

export function generateJsonLd(schema: GeneratedSchema, minified = false): string {
  const cleaned = cleanSchema(schema);
  return minified 
    ? JSON.stringify(cleaned)
    : JSON.stringify(cleaned, null, 2);
}

export function generateHtmlScript(schemas: GeneratedSchema[], minified = false): string {
  const combined = schemas.length === 1 
    ? schemas[0]
    : { '@context': 'https://schema.org', '@graph': schemas.map(cleanSchema) };

  const json = minified ? JSON.stringify(combined) : JSON.stringify(combined, null, 2);
  return `<script type="application/ld+json">\n${json}\n</script>`;
}

function cleanSchema(schema: GeneratedSchema): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(schema)) {
    if (value !== null && value !== undefined && value !== '') {
      if (typeof value === 'object' && !Array.isArray(value)) {
        const cleanedNested = cleanSchema(value as GeneratedSchema);
        if (Object.keys(cleanedNested).length > 0) {
          cleaned[key] = cleanedNested;
        }
      } else if (Array.isArray(value)) {
        const cleanedArray = value.filter(v => v !== null && v !== undefined);
        if (cleanedArray.length > 0) {
          cleaned[key] = cleanedArray;
        }
      } else {
        cleaned[key] = value;
      }
    }
  }
  
  return cleaned;
}

// =============================================================================
// RECOMMENDATIONS
// =============================================================================

function generateRecommendations(
  analysis: ContentAnalysis,
  schemas: GeneratedSchemaItem[],
  _settings: SchemaGeneratorSettings
): SchemaRecommendation[] {
  const recommendations: SchemaRecommendation[] = [];

  // Missing required fields
  for (const schema of schemas) {
    for (const error of schema.validation.errors) {
      recommendations.push({
        id: `rec_${schema.id}_${error.field}`,
        priority: 'high',
        category: 'missing_field',
        title: `Add ${error.field}`,
        description: error.message,
        action: `Add the required field "${error.field}" to your ${schema.type} schema`
      });
    }
  }

  // Warnings as optimizations
  for (const schema of schemas) {
    for (const warning of schema.validation.warnings) {
      recommendations.push({
        id: `rec_${schema.id}_${warning.field}`,
        priority: 'medium',
        category: 'optimization',
        title: `Consider adding ${warning.field}`,
        description: warning.message,
        action: warning.recommendation
      });
    }
  }

  // Additional schema suggestions
  for (const suggestion of analysis.suggestions.slice(0, 3)) {
    if (!schemas.some(s => s.type === suggestion.type)) {
      recommendations.push({
        id: `rec_additional_${suggestion.type}`,
        priority: 'low',
        category: 'additional_schema',
        title: `Consider adding ${suggestion.type} schema`,
        description: suggestion.reason,
        action: `Add ${suggestion.type} schema to enhance rich results`
      });
    }
  }

  // Best practices
  if (schemas.length > 0 && !schemas.some(s => s.type === 'BreadcrumbList')) {
    recommendations.push({
      id: 'rec_best_practice_breadcrumb',
      priority: 'low',
      category: 'best_practice',
      title: 'Add Breadcrumb Schema',
      description: 'Breadcrumb schema helps Google understand your site structure',
      action: 'Add BreadcrumbList schema to show breadcrumbs in search results'
    });
  }

  return recommendations;
}

// =============================================================================
// PREVIEW GENERATION
// =============================================================================

function generatePreview(schema: GeneratedSchema | null): SchemaPreview {
  if (!schema) {
    return {
      googlePreview: '',
      rawJson: '',
      formattedJson: ''
    };
  }

  const rawJson = JSON.stringify(schema);
  const formattedJson = JSON.stringify(schema, null, 2);

  // Generate Google search preview
  const googlePreview = generateGooglePreview(schema);

  return {
    googlePreview,
    rawJson,
    formattedJson
  };
}

function generateGooglePreview(schema: GeneratedSchema): string {
  const type = schema['@type'] as string;
  const title = (schema.headline || schema.name || 'Page Title') as string;
  const description = (schema.description || 'Page description...') as string;

  let richSnippet = '';
  
  if (type === 'Recipe') {
    richSnippet = 'â­â­â­â­â­ 4.5 (120 reviews) Â· 45 min Â· Calories: 250';
  } else if (type === 'Product') {
    const offers = schema.offers as Record<string, unknown> | undefined;
    const price = offers?.price || '29.99';
    richSnippet = `$${price} Â· In Stock Â· â­â­â­â­ 4.2 (85 reviews)`;
  } else if (type === 'Event') {
    richSnippet = `ðŸ“… ${schema.startDate || 'Jan 15, 2025'} Â· ðŸ“ Location`;
  } else if (type === 'FAQ' || type === 'FAQPage') {
    richSnippet = 'â“ Frequently Asked Questions (expandable)';
  } else if (type === 'HowTo') {
    richSnippet = 'ðŸ“‹ Step-by-step guide Â· 10 steps Â· 30 min';
  }

  return `**${title}**\nexample.com\n${description.slice(0, 160)}${description.length > 160 ? '...' : ''}\n${richSnippet ? `\n${richSnippet}` : ''}`;
}

// =============================================================================
// EXPORT FUNCTION
// =============================================================================

export function exportSchemaMarkup(
  result: SchemaGeneratorResult,
  options: SchemaExportOptions
): string {
  const selectedSchemas = result.generatedSchemas.filter(s => s.isSelected);
  const schemasToExport = selectedSchemas.length > 0 ? selectedSchemas : result.generatedSchemas;

  if (schemasToExport.length === 0) {
    return '';
  }

  if (options.format === 'html') {
    return generateHtmlScript(
      schemasToExport.map(s => s.schema),
      options.minified
    );
  }

  if (options.format === 'json') {
    const data = {
      generated: result.timestamp.toISOString(),
      validation: result.validation,
      schemas: schemasToExport.map(s => ({
        type: s.type,
        schema: s.schema,
        validation: s.validation
      })),
      recommendations: result.recommendations
    };
    return options.minified ? JSON.stringify(data) : JSON.stringify(data, null, 2);
  }

  // json-ld format
  if (options.combineSchemas && schemasToExport.length > 1) {
    const combined = {
      '@context': 'https://schema.org',
      '@graph': schemasToExport.map(s => cleanSchema(s.schema))
    };
    return options.includeScriptTag
      ? `<script type="application/ld+json">\n${options.minified ? JSON.stringify(combined) : JSON.stringify(combined, null, 2)}\n</script>`
      : (options.minified ? JSON.stringify(combined) : JSON.stringify(combined, null, 2));
  }

  const schema = schemasToExport[0].schema;
  const json = options.minified ? JSON.stringify(schema) : JSON.stringify(schema, null, 2);
  
  return options.includeScriptTag
    ? `<script type="application/ld+json">\n${json}\n</script>`
    : json;
}

