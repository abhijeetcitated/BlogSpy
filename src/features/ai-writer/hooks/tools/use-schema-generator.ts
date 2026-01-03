/**
 * useSchemaGenerator Hook
 * 
 * Production-grade React hook for schema markup generation
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  SchemaType,
  GeneratedSchema,
  ContentAnalysis,
  SchemaValidation,
  SchemaGeneratorResult,
  GeneratedSchemaItem,
  SchemaRecommendation,
  SchemaGeneratorSettings,
  SchemaExportOptions,
  UseSchemaGeneratorOptions,
  UseSchemaGeneratorReturn,
  DEFAULT_SCHEMA_SETTINGS
} from '@/src/features/ai-writer/types/tools/schema-markup.types';
import {
  analyzeContent,
  generateSchema,
  generateSchemaMarkup,
  validateSchema,
  generateJsonLd,
  generateHtmlScript,
  exportSchemaMarkup
} from '@/src/features/ai-writer/utils/tools/schema-markup';

export function useSchemaGenerator(
  options: UseSchemaGeneratorOptions = {}
): UseSchemaGeneratorReturn {
  const {
    settings: initialSettings = {},
    autoGenerate = false,
    onComplete,
    onError
  } = options;

  // ==========================================================================
  // STATE
  // ==========================================================================

  const [result, setResult] = useState<SchemaGeneratorResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [content, setContent] = useState<string>('');
  const [settings, setSettings] = useState<SchemaGeneratorSettings>({
    ...DEFAULT_SCHEMA_SETTINGS,
    ...initialSettings
  });

  // ==========================================================================
  // DERIVED STATE
  // ==========================================================================

  const analysis = useMemo<ContentAnalysis | null>(() => {
    return result?.analysis || null;
  }, [result]);

  const generatedSchemas = useMemo<GeneratedSchemaItem[]>(() => {
    return result?.generatedSchemas || [];
  }, [result]);

  const validation = useMemo<SchemaValidation | null>(() => {
    return result?.validation || null;
  }, [result]);

  const recommendations = useMemo<SchemaRecommendation[]>(() => {
    return result?.recommendations || [];
  }, [result]);

  // ==========================================================================
  // CORE FUNCTIONS
  // ==========================================================================

  const generate = useCallback(async (inputContent: string): Promise<void> => {
    if (!inputContent.trim()) {
      setError(new Error('Content is required'));
      return;
    }

    setIsGenerating(true);
    setError(null);
    setContent(inputContent);

    try {
      // Simulate async processing
      await new Promise(resolve => setTimeout(resolve, 100));

      const generatorResult = generateSchemaMarkup(inputContent, settings);
      setResult(generatorResult);
      onComplete?.(generatorResult);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Generation failed');
      setError(error);
      onError?.(error);
    } finally {
      setIsGenerating(false);
    }
  }, [settings, onComplete, onError]);

  const regenerate = useCallback(async (): Promise<void> => {
    if (content) {
      await generate(content);
    }
  }, [content, generate]);

  // ==========================================================================
  // SCHEMA MANAGEMENT
  // ==========================================================================

  const generateForType = useCallback((type: SchemaType): GeneratedSchemaItem | null => {
    if (!content) return null;

    const schema = generateSchema(type, content, settings);
    const schemaValidation = validateSchema(schema);

    return {
      id: `schema_${type}_${Date.now()}`,
      type,
      schema,
      jsonLd: generateJsonLd(schema),
      validation: schemaValidation,
      isSelected: false
    };
  }, [content, settings]);

  const validateSchemaFn = useCallback((schema: GeneratedSchema): SchemaValidation => {
    return validateSchema(schema);
  }, []);

  const selectSchema = useCallback((schemaId: string): void => {
    if (!result) return;

    setResult({
      ...result,
      generatedSchemas: result.generatedSchemas.map(s => ({
        ...s,
        isSelected: s.id === schemaId
      })),
      primarySchema: result.generatedSchemas.find(s => s.id === schemaId) || result.primarySchema
    });
  }, [result]);

  const updateSchema = useCallback((
    schemaId: string,
    updates: Partial<GeneratedSchema>
  ): void => {
    if (!result) return;

    setResult({
      ...result,
      generatedSchemas: result.generatedSchemas.map(s => {
        if (s.id === schemaId) {
          const updatedSchema = { ...s.schema, ...updates };
          return {
            ...s,
            schema: updatedSchema,
            jsonLd: generateJsonLd(updatedSchema),
            validation: validateSchema(updatedSchema)
          };
        }
        return s;
      })
    });
  }, [result]);

  const removeSchema = useCallback((schemaId: string): void => {
    if (!result) return;

    const updatedSchemas = result.generatedSchemas.filter(s => s.id !== schemaId);
    setResult({
      ...result,
      generatedSchemas: updatedSchemas,
      primarySchema: result.primarySchema?.id === schemaId 
        ? updatedSchemas[0] || null 
        : result.primarySchema
    });
  }, [result]);

  // ==========================================================================
  // EXPORT FUNCTIONS
  // ==========================================================================

  const getJsonLd = useCallback((schemaIds?: string[]): string => {
    if (!result) return '';

    const schemas = schemaIds
      ? result.generatedSchemas.filter(s => schemaIds.includes(s.id))
      : result.generatedSchemas.filter(s => s.isSelected);

    if (schemas.length === 0 && result.primarySchema) {
      return result.primarySchema.jsonLd;
    }

    if (schemas.length === 1) {
      return schemas[0].jsonLd;
    }

    const combined = {
      '@context': 'https://schema.org',
      '@graph': schemas.map(s => s.schema)
    };
    return JSON.stringify(combined, null, 2);
  }, [result]);

  const getHtmlScript = useCallback((schemaIds?: string[]): string => {
    if (!result) return '';

    const schemas = schemaIds
      ? result.generatedSchemas.filter(s => schemaIds.includes(s.id))
      : result.generatedSchemas.filter(s => s.isSelected);

    if (schemas.length === 0 && result.primarySchema) {
      return generateHtmlScript([result.primarySchema.schema]);
    }

    return generateHtmlScript(schemas.map(s => s.schema));
  }, [result]);

  const exportSchema = useCallback((exportOptions: SchemaExportOptions): string => {
    if (!result) return '';
    return exportSchemaMarkup(result, exportOptions);
  }, [result]);

  // ==========================================================================
  // SETTINGS
  // ==========================================================================

  const updateSettings = useCallback((newSettings: Partial<SchemaGeneratorSettings>): void => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // ==========================================================================
  // AUTO-GENERATE EFFECT
  // ==========================================================================

  // Auto-generate is handled externally if needed

  // ==========================================================================
  // RETURN
  // ==========================================================================

  return {
    result,
    isGenerating,
    error,

    analysis,
    generatedSchemas,
    validation,
    recommendations,

    generate,
    regenerate,

    generateForType,
    validateSchema: validateSchemaFn,

    selectSchema,
    updateSchema,
    removeSchema,

    getJsonLd,
    getHtmlScript,
    exportSchema,

    settings,
    updateSettings
  };
}

export default useSchemaGenerator;

