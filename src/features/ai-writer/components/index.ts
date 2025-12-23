// ============================================
// AI WRITER - Components Barrel Export
// ============================================

export { ImagePlaceholder } from "./image-placeholder"
export { SmartImagePlaceholder } from "./smart-image-placeholder"
export { EditorToolbar } from "./editor-toolbar"
export { SelectionToolbar } from "./selection-toolbar"
export { SEOScoreGauge } from "./seo-score-gauge"
export { AIWritingIndicator } from "./ai-writing-indicator"
export { ToastNotification } from "./toast-notification"
export { OptimizationTab } from "./optimization-tab"
export { OutlineTab } from "./outline-tab"
export { CompetitorsTab } from "./competitors-tab"
export { ContextBanner } from "./context-banner"
export { MetaPanel } from "./meta-panel"

// NEW: Refactored Components for AI Writer
export { AIWriterHeader, type AIWriterHeaderProps } from "./AIWriterHeader"
export { AIWriterEditor, type AIWriterEditorProps } from "./AIWriterEditor"

// NEW: AI Tools Panel - 18 AI Writing Features in one panel
export { AIToolsPanel, AIToolsQuickBar } from "./ai-tools-panel"

// NEW: Cluster Writing Mode - Sequential article writing
export { ClusterWritingMode, type WritingQueueItem, type CompletedArticle } from "./cluster-writing-mode"

// Feature #1: NLP Terms Panel - Industry-standard keyword optimization
export { NLPTermsPanel } from "./nlp-terms-panel"

// Feature #2 & #3: GEO/AEO Score Panel - AI optimization scores
export { GEOAEOPanel } from "./geo-aeo-panel"

// Feature #4: Highlight Settings - Term highlighting controls
export { HighlightSettings } from "./highlight-settings"

// Feature #5 & #6: Content Targets Panel - Word count and heading targets
export { ContentTargetsPanel } from "./content-targets-panel"
