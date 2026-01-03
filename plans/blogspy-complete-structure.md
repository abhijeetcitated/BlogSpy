blogspy-saas/
├── _PROJECT_STRUCTURE.ts
├── README.md
├── domain-checker-guide.md
├── domain-suggestions.md
├── eslint.config.mjs
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── proxy.ts
├── tsconfig.json
├── .cursor/
├── .vscode/
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── verify-email/
│   │       └── page.tsx
│   ├── (marketing)/
│   │   ├── layout.tsx
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── blog/
│   │   │   └── page.tsx
│   │   ├── contact/
│   │   │   └── page.tsx
│   │   ├── features/
│   │   │   └── page.tsx
│   │   ├── privacy/
│   │   │   └── page.tsx
│   │   └── terms/
│   │       └── page.tsx
│   ├── ai-writer/
│   │   ├── page.tsx
│   │   ├── components/
│   │   │   └── index.ts
│   │   ├── extensions/
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── utils/
│   │       └── index.ts
│   ├── api/
│   │   ├── alerts/
│   │   │   ├── route.ts
│   │   │   ├── [id]/
│   │   │   │   └── route.ts
│   │   │   ├── preferences/
│   │   │   │   └── route.ts
│   │   │   ├── stats/
│   │   │   │   └── route.ts
│   │   │   └── test/
│   │   │       └── route.ts
│   │   ├── auth/
│   │   │   └── route.ts
│   │   ├── content/
│   │   │   └── route.ts
│   │   ├── cron/
│   │   │   ├── alert-digest/
│   │   │   │   └── route.ts
│   │   │   ├── decay-detection/
│   │   │   │   └── route.ts
│   │   │   ├── ga4-sync/
│   │   │   │   └── route.ts
│   │   │   └── gsc-sync/
│   │   │       └── route.ts
│   │   ├── decay-detection/
│   │   │   ├── analyze/
│   │   │   │   └── route.ts
│   │   │   ├── history/
│   │   │   │   └── [url]/
│   │   │   │       └── route.ts
│   │   │   ├── scores/
│   │   │   │   └── route.ts
│   │   │   ├── summary/
│   │   │   │   └── route.ts
│   │   │   └── trends/
│   │   │       └── route.ts
│   │   ├── integrations/
│   │   │   ├── ga4/
│   │   │   │   ├── callback/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── connect/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── disconnect/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── properties/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── status/
│   │   │   │   │   └── route.ts
│   │   │   │   └── sync/
│   │   │   │       └── route.ts
│   │   │   └── gsc/
│   │   │       ├── callback/
│   │   │       │   └── route.ts
│   │   │       ├── connect/
│   │   │       │   └── route.ts
│   │   │       ├── disconnect/
│   │   │       │   └── route.ts
│   │   │       ├── properties/
│   │   │       │   └── route.ts
│   │   │       ├── status/
│   │   │       │   └── route.ts
│   │   │       └── sync/
│   │   │           └── route.ts
│   │   ├── keywords/
│   │   │   └── route.ts
│   │   ├── rankings/
│   │   │   └── route.ts
│   │   ├── social-tracker/
│   │   │   ├── keywords/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   └── refresh/
│   │   │       └── route.ts
│   │   ├── trends/
│   │   │   └── route.ts
│   │   ├── video-hijack/
│   │   │   ├── tiktok/
│   │   │   │   ├── _helpers.ts
│   │   │   │   ├── hashtag/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── search/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── trending/
│   │   │   │   │   └── route.ts
│   │   │   │   └── video/
│   │   │   │       └── route.ts
│   │   │   └── youtube/
│   │   │       └── route.ts
│   │   └── webhooks/
│   │       └── route.ts
│   ├── competitor-gap/
│   │   └── page.tsx
│   ├── content-decay/
│   │   └── page.tsx
│   ├── content-roadmap/
│   │   └── page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   ├── page.tsx
│   │   ├── ai-visibility/
│   │   │   └── page.tsx
│   │   ├── billing/
│   │   │   └── page.tsx
│   │   ├── creation/
│   │   │   ├── ai-writer/
│   │   │   │   └── page.tsx
│   │   │   ├── on-page/
│   │   │   │   └── page.tsx
│   │   │   ├── schema-generator/
│   │   │   │   └── page.tsx
│   │   │   └── snippet-stealer/
│   │   │       └── page.tsx
│   │   ├── monetization/
│   │   │   ├── content-roi/
│   │   │   │   └── page.tsx
│   │   │   └── earnings-calculator/
│   │   │       └── page.tsx
│   │   ├── research/
│   │   │   ├── affiliate-finder/
│   │   │   │   └── page.tsx
│   │   │   ├── citation-checker/
│   │   │   │   └── page.tsx
│   │   │   ├── content-calendar/
│   │   │   │   └── page.tsx
│   │   │   ├── gap-analysis/
│   │   │   │   └── page.tsx
│   │   │   ├── keyword-magic/
│   │   │   │   └── page.tsx
│   │   │   ├── overview/
│   │   │   │   └── [keyword]/
│   │   │   │       └── page.tsx
│   │   │   ├── trends/
│   │   │   │   └── page.tsx
│   │   │   └── video-hijack/
│   │   │       └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   ├── strategy/
│   │   │   ├── roadmap/
│   │   │   │   └── page.tsx
│   │   │   └── topic-clusters/
│   │   │       ├── page.tsx
│   │   │       └── results/
│   │   │           └── page.tsx
│   │   └── tracking/
│   │       ├── ai-visibility/
│   │       │   └── page.tsx
│   │       ├── cannibalization/
│   │       │   └── page.tsx
│   │       ├── commerce-tracker/
│   │       │   └── page.tsx
│   │       ├── community-tracker/
│   │       │   └── page.tsx
│   │       ├── decay/
│   │       │   └── page.tsx
│   │       ├── news-tracker/
│   │       │   └── page.tsx
│   │       ├── rank-tracker/
│   │       │   └── page.tsx
│   │       └── social-tracker/
│   │           └── page.tsx
│   ├── keyword-magic/
│   │   └── page.tsx
│   ├── keyword-overview/
│   │   └── page.tsx
│   ├── on-page-checker/
│   ├── pricing/
│   ├── rank-tracker/
│   ├── settings/
│   ├── snippet-stealer/
│   ├── topic-clusters/
│   ├── trend-spotter/
│   └── trends/
├── assets/
├── components/
│   ├── charts/
│   │   ├── chart-styles.ts
│   │   ├── credit-ring.tsx
│   │   ├── index.ts
│   │   ├── kd-ring.tsx
│   │   ├── lazy-charts.tsx
│   │   ├── sparkline.tsx
│   │   ├── trending-sparkline.tsx
│   │   └── velocity-chart.tsx
│   ├── common/
│   │   ├── demo-wrapper.tsx
│   │   ├── empty-state.tsx
│   │   ├── error-boundary.tsx
│   │   ├── index.ts
│   │   ├── index.tsx
│   │   ├── loading-spinner.tsx
│   │   ├── page-header.tsx
│   │   ├── page-loading.tsx
│   │   └── data-table/
│   │       ├── DataTable.tsx
│   │       ├── DataTableBody.tsx
│   │       ├── DataTableHeader.tsx
│   │       ├── DataTablePagination.tsx
│   │       ├── DataTableToolbar.tsx
│   │       ├── index.ts
│   │       └── types.ts
│   ├── features/
│   │   ├── index.ts
│   │   ├── ai-writer/
│   │   │   └── index.ts
│   │   ├── cannibalization/
│   │   │   └── index.ts
│   │   ├── citation-checker/
│   │   │   └── index.ts
│   │   ├── content-decay/
│   │   │   └── index.ts
│   │   ├── content-roadmap/
│   │   │   └── index.ts
│   │   ├── keyword-overview/
│   │   │   └── index.ts
│   │   ├── on-page-checker/
│   │   │   └── index.ts
│   │   ├── rank-tracker/
│   │   │   └── index.ts
│   │   ├── settings/
│   │   │   └── index.ts
│   │   ├── snippet-stealer/
│   │   │   └── index.ts
│   │   ├── trend-spotter/
│   │   │   └── index.ts
│   │   └── video-hijack/
│   │       └── index.ts
│   ├── forms/
│   │   ├── index.ts
│   │   ├── keyword-search-form.tsx
│   │   ├── settings-form-cards.tsx
│   │   ├── settings-form-types.ts
│   │   ├── settings-form.tsx
│   │   └── url-analyzer-form.tsx
│   ├── icons/
│   │   └── platform-icons.tsx
│   ├── layout/
│   │   ├── app-sidebar.tsx
│   │   ├── index.ts
│   │   └── top-nav.tsx
│   ├── shared/
│   │   ├── cta-section.tsx
│   │   ├── index.ts
│   │   ├── marketing-footer.tsx
│   │   └── marketing-header.tsx
│   └── ui/
│       ├── ai-overview-card.tsx
│       ├── alert-dialog.tsx
│       ├── alert.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── checkbox.tsx
│       ├── collapsible.tsx
│       ├── community-decay-badge.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── geo-score-ring.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── platform-opportunity-badges.tsx
│       ├── popover.tsx
│       ├── progress.tsx
│       ├── radio-group.tsx
│       ├── rtv-badge.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── sidebar.tsx
│       ├── skeleton.tsx
│       ├── slider.tsx
│       ├── switch.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       ├── tooltip.tsx
│       ├── pixel-rank-badge/
│       │   ├── index.ts
│       │   ├── PixelPositionIndicator.tsx
│       │   ├── PixelRankBadge.tsx
│       │   ├── PixelRankCard.tsx
│       │   └── PixelRankMini.tsx
│       └── serp-visualizer/
│           ├── constants.tsx
│           ├── index.ts
│           ├── MiniSERPVisualizer.tsx
│           ├── PixelRankSummary.tsx
│           ├── SERPComparison.tsx
│           ├── SERPFeaturesBreakdown.tsx
│           └── SERPStackVisualizer.tsx
├── config/
├── constants/
├── contexts/
│   ├── auth-context.tsx
│   └── user-context.tsx
├── data/
│   ├── dashboard-mock.ts
│   └── mock/
│       ├── content.ts
│       ├── index.ts
│       ├── keywords.ts
│       ├── rankings.ts
│       ├── trends.ts
│       └── users.ts
├── docs/
│   ├── AI_VISIBILITY_CODE_AUDIT_REPORT.md
│   ├── AI_VISIBILITY_FEATURE_SPEC.md
│   ├── BACKEND_INFRASTRUCTURE_GUIDE.md
│   ├── FEATURES-FIX-TODO.md
│   ├── ai-visibility-analysis.md
│   ├── ai-visibility-detailed-analysis.md
│   ├── ai-writer-complete-file-structure.md
│   ├── affiliate-finder-analysis.md
│   ├── affiliate-finder-complete-analysis.md
│   ├── blogspy-complete-feature-report.md
│   ├── blogspy-complete-features-explanation.md
│   ├── blogspy-complete-system-architecture.md
│   ├── blogspy-landing-page-feature-report.md
│   ├── blogspy-system-architecture-diagram.md
│   ├── cannibalization-analysis.md
│   ├── cannibalization-complete-analysis.md
│   ├── citation-checker-analysis.md
│   ├── commerce-tracker-analysis.md
│   ├── command-palette-analysis.md
│   ├── command-palette-complete-analysis.md
│   ├── community-tracker-analysis.md
│   ├── community-tracker-complete-analysis.md
│   ├── competitor-gap-complete-analysis.md
│   ├── content-calendar-changes-list.md
│   ├── content-calendar-complete-analysis.md
│   ├── content-decay-changes-list.md
│   ├── content-decay-complete-analysis.md
│   ├── content-decay-deep-dive-analysis.md
│   ├── content-roadmap-complete-analysis.md
│   ├── content-roi-complete-analysis.md
│   ├── feature-analysis-summary.md
│   ├── integrations-complete-analysis.md
│   ├── KEYWORD_MAGIC_COMPLETE_A-Z_STRUCTURE.md
│   ├── keyword-magic-complete-analysis.md
│   └── BACKEND_INFRASTRUCTURE_GUIDE.md
├── hooks/
│   ├── index.ts
│   ├── use-api.ts
│   ├── use-auth.ts
│   ├── use-debounce.ts
│   ├── use-user.ts
│   └── use-*.ts
├── lib/
│   ├── ai-overview-analyzer.ts
│   ├── api-client.ts
│   ├── api-response.ts
│   ├── cannibalization-analyzer.ts
│   ├── citation-analyzer.ts
│   ├── clerk.ts
│   ├── clustering-algorithm.ts
│   ├── commerce-opportunity-calculator.ts
│   ├── community-decay-calculator.ts
│   ├── constants.ts
│   ├── feature-access.ts
│   ├── formatters.ts
│   ├── geo-calculator.ts
│   ├── logger.ts
│   ├── pixel-calculator.ts
│   ├── rate-limiter.ts
│   ├── rtv-calculator.ts
│   ├── safe-action.ts
│   ├── seo.ts
│   ├── social-opportunity-calculator.ts
│   ├── stripe.ts
│   ├── utils.ts
│   ├── validators.ts
│   ├── video-hijack-analyzer.ts
│   ├── video-opportunity-calculator.ts
│   ├── alerts/
│   │   ├── dispatcher.ts
│   │   ├── email-sender.ts
│   │   ├── index.ts
│   │   ├── slack-sender.ts
│   │   └── webhook-sender.ts
│   ├── decay-detection/
│   │   ├── calculator.ts
│   │   ├── index.ts
│   │   └── trend-analyzer.ts
│   ├── google/
│   │   ├── config.ts
│   │   ├── ga4-client.ts
│   │   ├── gsc-client.ts
│   │   ├── index.ts
│   │   └── oauth.ts
│   └── supabase/
│       ├── client.ts
│       ├── index.ts
│       └── server.ts
├── prisma/
│   └── schema.prisma
├── public/
│   ├── favicon.svg
│   ├── file.svg
│   ├── globe.svg
│   ├── logo.svg
│   ├── manifest.json
│   ├── next.svg
│   ├── og-image.svg
│   ├── robots.txt
│   ├── vercel.svg
│   ├── window.svg
│   └── assets/
│       └── icons/
│           └── ai-platforms/
│               ├── apple-siri.svg
│               ├── chatgpt.svg
│               ├── claude.svg
│               ├── gemini.svg
│               ├── google-aio.svg
│               ├── perplexity.svg
│               └── searchgpt.svg
├── services/
│   ├── decay-detection.service.ts
│   ├── ga4.service.ts
│   ├── gsc.service.ts
│   ├── index.ts
│   ├── keywords.service.ts
│   ├── rank-tracker.service.ts
│   ├── rankings.service.ts
│   ├── social-tracker.service.ts
│   ├── stripe.service.ts
│   ├── supabase.service.ts
│   ├── trends.service.ts
│   ├── user.service.ts
│   ├── video-hijack.service.ts
│   └── dataforseo/
│       ├── client.ts
│       ├── index.ts
│       ├── keywords.ts
│       └── serp.ts
├── src/
│   ├── middleware.ts
│   ├── lib/
│   │   ├── index.ts
│   │   ├── payments/
│   │   │   ├── index.ts
│   │   │   └── lemonsqueezy.ts
│   │   └── supabase/
│   │       ├── client.ts
│   │       ├── index.ts
│   │       └── server.ts
│   ├── shared/
│   │   ├── ai-overview/
│   │   │   ├── index.ts
│   │   │   └── components/
│   │   │       ├── AIOpportunityBadge.tsx
│   │   │       ├── AIOverviewCard.tsx
│   │   │       ├── AIOverviewMini.tsx
│   │   │       ├── AIOverviewStatusBadge.tsx
│   │   │       ├── CitationList.tsx
│   │   │       ├── CitationSourceCard.tsx
│   │   │       ├── EntityChip.tsx
│   │   │       ├── EntityGrid.tsx
│   │   │       ├── index.ts
│   │   │       ├── RecommendationCard.tsx
│   │   │       └── RecommendationsList.tsx
│   │   ├── community-decay/
│   │   │   └── index.ts
│   │   ├── dashboard/
│   │   │   └── components/
│   │   ├── geo-score/
│   │   │   ├── index.ts
│   │   │   └── components/
│   │   │       ├── GEOScoreBadge.tsx
│   │   │       ├── GEOScoreBreakdown.tsx
│   │   │       ├── GEOScoreRing.tsx
│   │   │       ├── GEOScoreTooltipContent.tsx
│   │   │       └── index.ts
│   │   ├── pricing/
│   │   │   ├── index.ts
│   │   │   └── PricingModal.tsx
│   │   ├── rtv/
│   │   │   └── index.ts
│   │   ├── settings/
│   │   │   ├── constants/
│   │   │   │   └── index.ts
│   │   │   ├── index.ts
│   │   │   ├── settings-content.tsx
│   │   │   ├── types/
│   │   │   │   └── index.ts
│   │   │   └── utils/
│   │   │       └── settings-utils.ts
│   │   └── utils/
│   │       ├── greeting.ts
│   │       └── index.ts
│   └── features/
│       ├── ai-visibility/
│       │   ├── _INTEGRATION_GUIDE.ts
│       │   ├── constants/
│       │   │   └── index.tsx
│       │   ├── types/
│       │   │   └── index.ts
│       │   └── utils/
│       │       └── index.ts
│       ├── cannibalization/
│       │   ├── cannibalization-content.tsx
│       │   ├── index.ts
│       │   ├── __mocks__/
│       │   │   └── cannibalization-data.ts
│       │   ├── components/
│       │   │   ├── BulkActionsDialog.tsx
│       │   │   ├── DomainInputDialog.tsx
│       │   │   ├── Filters.tsx
│       │   │   ├── FixIssueDialog.tsx
│       │   │   ├── IssueList.tsx
│       │   │   ├── PageHeader.tsx
│       │   │   ├── SeverityBadge.tsx
│       │   │   ├── SummaryCards.tsx
│       │   │   ├── SummaryFooter.tsx
│       │   │   └── ViewPagesModal.tsx
│       │   ├── constants/
│       │   │   └── index.ts
│       │   ├── services/
│       │   │   └── cannibalization.service.ts
│       │   └── types/
│       │       └── index.ts
│       ├── citation-checker/
│       │   ├── index.ts
│       │   ├── __mocks__/
│       │   │   └── citation-data.ts
│       │   ├── components/
│       │   │   ├── citation-card.tsx
│       │   │   ├── citation-filters.tsx
│       │   │   ├── citation-list.tsx
│       │   │   ├── citation-score-ring.tsx
│       │   │   ├── index.ts
│       │   │   ├── page-header.tsx
│       │   │   ├── sidebar-panels.tsx
│       │   │   ├── status-badge.tsx
│       │   │   └── summary-cards.tsx
│       │   ├── constants/
│       │   │   └── index.ts
│       │   ├── types/
│       │   │   └── index.ts
│       │   └── utils/
│       │       └── citation-utils.ts
│       ├── monetization/
│       │   ├── index.ts
│       │   ├── types/
│       │   │   └── index.ts
│       │   └── utils/
│       │       └── index.ts
│       ├── news-tracker/
│       │   ├── index.ts
│       │   ├── news-tracker-content.tsx
│       │   ├── news-tracker-content-refactored.tsx
│       │   ├── __mocks__/
│       │   │   └── index.ts
│       │   ├── components/
│       │   │   ├── AddKeywordDialog.tsx
│       │   │   └── SetAlertDialog.tsx
│       │   ├── config/
│       │   │   ├── api-pricing.config.ts
│       │   │   └── index.ts
│       │   ├── hooks/
│       │   │   ├── index.ts
│       │   │   ├── useCredits.ts
│       │   │   └── useNewsTracker.ts
│       │   ├── services/
│       │   │   ├── credit-plans.ts
│       │   │   ├── credit-transactions.service.ts
│       │   │   ├── credit.service.refactored.ts
│       │   │   ├── credit.service.ts
│       │   │   ├── index.ts
│       │   │   ├── news-tracker.service.ts
│       │   │   ├── promo-codes.service.ts
│       │   │   ├── rate-limiter.service.ts
│       │   │   └── security.service.ts
│       │   └── types/
│       │       ├── api.types.ts
│       │       ├── credits.types.ts
│       │       └── index.ts
│       ├── snippet-stealer/
│       │   ├── index.ts
│       │   ├── snippet-stealer-content.tsx
│       │   ├── __mocks__/
│       │   │   └── snippet-data.ts
│       │   ├── components/
│       │   │   ├── competitor-snippet-card.tsx
│       │   │   ├── google-preview.tsx
│       │   │   ├── index.ts
│       │   │   ├── opportunity-list.tsx
│       │   │   ├── snippet-editor.tsx
│       │   │   ├── toast-notification.tsx
│       │   │   └── workbench-header.tsx
│       │   ├── constants/
│       │   │   └── index.ts
│       │   ├── services/
│       │   │   ├── index.ts
│       │   │   └── snippet-stealer.service.ts
│       │   └── utils/
│       │       └── snippet-utils.ts
│       ├── social-tracker/
│       │   ├── index.ts
│       │   ├── social-tracker-content.tsx
│       │   ├── __mocks__/
│       │   │   └── index.ts
│       │   ├── components/
│       │   │   ├── AddKeywordModal.tsx
│       │   │   ├── CreditPurchaseCard.tsx
│       │   │   ├── DeleteKeywordDialog.tsx
│       │   │   ├── index.ts
│       │   │   ├── SocialPlatformTabs.tsx
│       │   │   ├── SocialSummaryCards.tsx
│       │   │   ├── SocialTrackerEmptyState.tsx
│       │   │   ├── SocialTrackerErrorBoundary.tsx
│       │   │   ├── SocialTrackerHeader.tsx
│       │   │   ├── SocialTrackerSidebar.tsx
│       │   │   ├── SocialTrackerSkeleton.tsx
│       │   │   └── keyword-card/
│       │   │       ├── index.ts
│       │   │       ├── InstagramKeywordCard.tsx
│       │   │       ├── KeywordCardActionMenu.tsx
│       │   │       ├── KeywordCardShared.tsx
│       │   │       ├── PinterestKeywordCard.tsx
│       │   │       ├── SocialKeywordCard.tsx
│       │   │       ├── SocialKeywordList.tsx
│       │   │       └── TwitterKeywordCard.tsx
│       │   ├── constants/
│       │   │   └── index.ts
│       │   ├── credits/
│       │   │   ├── config/
│       │   │   │   ├── index.ts
│       │   │   │   └── pricing.config.ts
│       │   │   ├── hooks/
│       │   │   │   ├── index.ts
│       │   │   │   ├── useCreditBalance.ts
│       │   │   │   ├── useCreditPackages.ts
│       │   │   │   ├── useCreditPurchase.ts
│       │   │   │   ├── useCreditTransactions.ts
│       │   │   │   ├── useCreditUsage.ts
│       │   │   │   └── usePromoCode.ts
│       │   │   └── components/
│       │   │       ├── CreditBalanceWidget.tsx
│       │   │       ├── CreditCustomSlider.tsx
│       │   │       ├── CreditPackageList.tsx
│       │   │       ├── CreditPromoInput.tsx
│       │   │       ├── CreditPurchaseCard.tsx
│       │   │       ├── CreditTransactionHistory.tsx
│       │   │       ├── CreditTrustBadges.tsx
│       │   │       ├── index.ts
│       │   │       └── PlatformCreditCostCard.tsx
│       │   ├── hooks/
│       │   │   ├── index.ts
│       │   │   ├── useSocialFilters.ts
│       │   │   ├── useSocialKeywords.ts
│       │   │   └── useSocialTracker.ts
│       │   └── types/
│       │       └── index.ts
│       ├── topic-clusters/
│       │   ├── index.ts
│       │   ├── topic-cluster-content.tsx
│       │   ├── topic-cluster-page.tsx
│       │   ├── components/
│       │   │   ├── BackgroundEffects.tsx
│       │   │   ├── ClusterInspector.tsx
│       │   │   ├── ClusterListView.tsx
│       │   │   ├── DifficultyLegend.tsx
│       │   │   ├── EmptyState.tsx
│       │   │   ├── add-keywords-modal.tsx
│       │   │   ├── article-list-view.tsx
│       │   │   ├── cluster-builder-panel.tsx
│       │   │   ├── cluster-builder.tsx
│       │   │   ├── cluster-overview.tsx
│       │   │   ├── cluster-results.tsx
│       │   │   ├── content-briefs-panel.tsx
│       │   │   ├── create-project-modal.tsx
│       │   │   ├── import-keywords-modal.tsx
│       │   │   ├── index.ts
│       │   │   ├── keyword-pool-table.tsx
│       │   │   ├── linking-matrix.tsx
│       │   │   └── project-detail.tsx
│       │   ├── constants/
│       │   │   ├── index.ts
│       │   │   ├── mock-cluster-data.ts
│       │   │   └── mock-projects.ts
│       │   ├── hooks/
│       │   │   ├── index.ts
│       │   │   └── use-project.ts
│       │   ├── services/
│       │   │   ├── index.ts
│       │   │   └── project.service.ts
│       │   ├── types/
│       │   │   ├── cluster-analysis.types.ts
│       │   │   ├── cluster-builder.types.ts
│       │   │   ├── content-brief.types.ts
│       │   │   ├── index.ts
│       │   │   ├── keyword-pool.types.ts
│       │   │   └── project.types.ts
│       │   └── utils/
│       │       ├── cluster-analysis-engine.ts
│       │       ├── cluster-utils.ts
│       │       └── keyword-analysis-engine.ts
│       ├── trend-spotter/
│       │   ├── index.ts
│       │   ├── trend-spotter.tsx
│       │   ├── __mocks__/
│       │   │   ├── calendar-data.ts
│       │   │   ├── geo-data.ts
│       │   │   └── index.ts
│       │   ├── components/
│       │   │   ├── cascading-city-dropdown.tsx
│       │   │   ├── content-type-suggester.tsx
│       │   │   ├── geographic-interest.tsx
│       │   │   ├── icons.tsx
│       │   │   ├── index.ts
│       │   │   ├── news-context.tsx
│       │   │   ├── publish-timing.tsx
│       │   │   ├── related-data-lists.tsx
│       │   │   ├── searchable-country-dropdown.tsx
│       │   │   ├── trend-alert-button.tsx
│       │   │   ├── trend-calendar.tsx
│       │   │   ├── velocity-chart.tsx
│       │   │   ├── world-map.tsx
│       │   │   └── calendar/
│       │   │       ├── CalendarFilters.tsx
│       │   │       ├── CalendarFooter.tsx
│       │   │       ├── CalendarHeader.tsx
│       │   │       ├── EventItem.tsx
│       │   │       ├── index.ts
│       │   │       └── MonthCard.tsx
│       │   ├── constants/
│       │   │   └── index.ts
│       │   ├── types/
│       │   │   └── index.ts
│       │   └── utils/
│       │       ├── calendar-utils.ts
│       │       ├── date-utils.ts
│       │       └── index.ts
│       └── video-hijack/
│           ├── index.ts
│           ├── video-hijack-content-refactored.tsx
│           ├── video-hijack-content.tsx
│           ├── __mocks__/
│           │   ├── tiktok-data.ts
│           │   └── video-data.ts
│           ├── api/
│           │   └── index.ts
│           ├── components/
│           │   ├── HijackScoreRing.tsx
│           │   ├── index.ts
│           │   ├── KeywordCard.tsx
│           │   ├── KeywordList.tsx
│           │   ├── PageHeader.tsx
│           │   ├── SidebarPanels.tsx
│           │   ├── StatusBadges.tsx
│           │   ├── SummaryCards.tsx
│           │   ├── TikTokResultCard.tsx
│           │   ├── TikTokTab.tsx
│           │   ├── VideoFilters.tsx
│           │   ├── VideoPlatformTabs.tsx
│           │   ├── VideoResultsSidebar.tsx
│           │   ├── VideoSearchBox.tsx
│           │   ├── VideoStatsPanel.tsx
│           │   ├── VideoSuggestionPanel.tsx
│           │   ├── YouTubeResultCard.tsx
│           │   ├── shared/
│           │   │   ├── index.ts
│           │   │   ├── VideoResultsSidebar.tsx
│           │   │   ├── VideoSearchBox.tsx
│           │   │   ├── VideoStatsPanel.tsx
│           │   │   └── VideoSuggestionPanel.tsx
│           │   ├── tiktok/
│           │   │   ├── index.ts
│           │   │   ├── TikTokResultCard.tsx
│           │   │   └── TikTokResultsList.tsx
│           │   └── youtube/
│           │       └── YouTubeResultsList.tsx
│           ├── constants/
│           │   ├── index.ts
│           │   └── platforms.ts
│           ├── services/
│           │   ├── index.ts
│           │   ├── tiktok.service.ts
│           │   └── youtube.service.ts
│           ├── types/
│           │   ├── common.types.ts
│           │   ├── index.ts
│           │   ├── platforms.ts
│           │   ├── tiktok.types.ts
│           │   ├── video-search.types.ts
│           │   └── youtube.types.ts
│           └── utils/
│               ├── common.utils.ts
│               ├── helpers.tsx
│               ├── index.ts
│               ├── mock-generators.ts
│               ├── tiktok.utils.ts
│               ├── video-utils.ts
│               └── youtube.utils.ts
├── store/
│   ├── index.ts
│   ├── keyword-store.ts
│   ├── ui-store.ts
│   └── user-store.ts
├── supabase/
│   └── migrations/
│       ├── 001_decay_detection_system.sql
│       └── 002_user_credits_system.sql
└── types/
    ├── api.ts
    ├── competitor.types.ts
    ├── content.types.ts
    ├── dashboard.ts
    ├── decay-detection.types.ts
    └── ga4.types.ts