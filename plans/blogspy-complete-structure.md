blogspy-saas/
â”œâ”€â”€ _PROJECT_STRUCTURE.ts
â”œâ”€â”€ README.md
â”œâ”€â”€ domain-checker-guide.md
â”œâ”€â”€ domain-suggestions.md
â”œâ”€â”€ eslint.config.mjs
â”œâ”€â”€ next.config.ts
â”œâ”€â”€ package-lock.json
â”œâ”€â”€ package.json
â”œâ”€â”€ postcss.config.mjs
â”œâ”€â”€ proxy.ts
â”œâ”€â”€ tsconfig.json
â”œâ”€â”€ .cursor/
â”œâ”€â”€ .vscode/
â”œâ”€â”€ app/
â”‚   â”œâ”€â”€ favicon.ico
â”‚   â”œâ”€â”€ globals.css
â”‚   â”œâ”€â”€ layout.tsx
â”‚   â”œâ”€â”€ (auth)/
â”‚   â”‚   â”œâ”€â”€ layout.tsx
â”‚   â”‚   â”œâ”€â”€ forgot-password/
â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”œâ”€â”€ login/
â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”œâ”€â”€ register/
â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â””â”€â”€ verify-email/
â”‚   â”‚       â””â”€â”€ page.tsx
â”‚   â”œâ”€â”€ (marketing)/
â”‚   â”‚   â”œâ”€â”€ layout.tsx
â”‚   â”‚   â”œâ”€â”€ about/
â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”œâ”€â”€ blog/
â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”œâ”€â”€ contact/
â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”œâ”€â”€ features/
â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”œâ”€â”€ privacy/
â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â””â”€â”€ terms/
â”‚   â”‚       â””â”€â”€ page.tsx
â”‚   â”œâ”€â”€ ai-writer/
â”‚   â”‚   â”œâ”€â”€ page.tsx
â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â””â”€â”€ index.ts
â”‚   â”‚   â”œâ”€â”€ extensions/
â”‚   â”‚   â”‚   â””â”€â”€ index.ts
â”‚   â”‚   â”œâ”€â”€ hooks/
â”‚   â”‚   â”‚   â””â”€â”€ index.ts
â”‚   â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â”‚   â””â”€â”€ index.ts
â”‚   â”‚   â””â”€â”€ utils/
â”‚   â”‚       â””â”€â”€ index.ts
â”‚   â”œâ”€â”€ api/
â”‚   â”‚   â”œâ”€â”€ alerts/
â”‚   â”‚   â”‚   â”œâ”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ [id]/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ preferences/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ stats/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â””â”€â”€ test/
â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”œâ”€â”€ auth/
â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”œâ”€â”€ content/
â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”œâ”€â”€ cron/
â”‚   â”‚   â”‚   â”œâ”€â”€ alert-digest/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ decay-detection/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ ga4-sync/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â””â”€â”€ gsc-sync/
â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”œâ”€â”€ decay-detection/
â”‚   â”‚   â”‚   â”œâ”€â”€ analyze/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ history/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ [url]/
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ scores/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ summary/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â””â”€â”€ trends/
â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”œâ”€â”€ integrations/
â”‚   â”‚   â”‚   â”œâ”€â”€ ga4/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ callback/
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ connect/
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ disconnect/
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ properties/
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ status/
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ sync/
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â””â”€â”€ gsc/
â”‚   â”‚   â”‚       â”œâ”€â”€ callback/
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚       â”œâ”€â”€ connect/
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚       â”œâ”€â”€ disconnect/
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚       â”œâ”€â”€ properties/
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚       â”œâ”€â”€ status/
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚       â””â”€â”€ sync/
â”‚   â”‚   â”‚           â””â”€â”€ route.ts
â”‚   â”‚   â”œâ”€â”€ keywords/
â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”œâ”€â”€ rankings/
â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”œâ”€â”€ social-tracker/
â”‚   â”‚   â”‚   â”œâ”€â”€ keywords/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ [id]/
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â””â”€â”€ refresh/
â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”œâ”€â”€ trends/
â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”œâ”€â”€ video-hijack/
â”‚   â”‚   â”‚   â”œâ”€â”€ tiktok/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ _helpers.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ hashtag/
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ search/
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ trending/
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ video/
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â””â”€â”€ youtube/
â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â””â”€â”€ webhooks/
â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”œâ”€â”€ competitor-gap/
â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”œâ”€â”€ content-decay/
â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”œâ”€â”€ content-roadmap/
â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”œâ”€â”€ dashboard/
â”‚   â”‚   â”œâ”€â”€ layout.tsx
â”‚   â”‚   â”œâ”€â”€ loading.tsx
â”‚   â”‚   â”œâ”€â”€ page.tsx
â”‚   â”‚   â”œâ”€â”€ ai-visibility/
â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”œâ”€â”€ billing/
â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”œâ”€â”€ creation/
â”‚   â”‚   â”‚   â”œâ”€â”€ ai-writer/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ on-page/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ schema-generator/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â””â”€â”€ snippet-stealer/
â”‚   â”‚   â”‚       â””â”€â”€ page.tsx
â”‚   â”‚   â”œâ”€â”€ monetization/
â”‚   â”‚   â”‚   â”œâ”€â”€ content-roi/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â””â”€â”€ earnings-calculator/
â”‚   â”‚   â”‚       â””â”€â”€ page.tsx
â”‚   â”‚   â”œâ”€â”€ research/
â”‚   â”‚   â”‚   â”œâ”€â”€ affiliate-finder/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ citation-checker/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ content-calendar/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ gap-analysis/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ keyword-magic/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ overview/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ [keyword]/
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ trends/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â””â”€â”€ video-hijack/
â”‚   â”‚   â”‚       â””â”€â”€ page.tsx
â”‚   â”‚   â”œâ”€â”€ settings/
â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”œâ”€â”€ strategy/
â”‚   â”‚   â”‚   â”œâ”€â”€ roadmap/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â””â”€â”€ topic-clusters/
â”‚   â”‚   â”‚       â”œâ”€â”€ page.tsx
â”‚   â”‚   â”‚       â””â”€â”€ results/
â”‚   â”‚   â”‚           â””â”€â”€ page.tsx
â”‚   â”‚   â””â”€â”€ tracking/
â”‚   â”‚       â”œâ”€â”€ ai-visibility/
â”‚   â”‚       â”‚   â””â”€â”€ page.tsx
â”‚   â”‚       â”œâ”€â”€ cannibalization/
â”‚   â”‚       â”‚   â””â”€â”€ page.tsx
â”‚   â”‚       â”œâ”€â”€ commerce-tracker/
â”‚   â”‚       â”‚   â””â”€â”€ page.tsx
â”‚   â”‚       â”œâ”€â”€ community-tracker/
â”‚   â”‚       â”‚   â””â”€â”€ page.tsx
â”‚   â”‚       â”œâ”€â”€ decay/
â”‚   â”‚       â”‚   â””â”€â”€ page.tsx
â”‚   â”‚       â”œâ”€â”€ news-tracker/
â”‚   â”‚       â”‚   â””â”€â”€ page.tsx
â”‚   â”‚       â”œâ”€â”€ rank-tracker/
â”‚   â”‚       â”‚   â””â”€â”€ page.tsx
â”‚   â”‚       â””â”€â”€ social-tracker/
â”‚   â”‚           â””â”€â”€ page.tsx
â”‚   â”œâ”€â”€ keyword-magic/
â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”œâ”€â”€ keyword-overview/
â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”œâ”€â”€ on-page-checker/
â”‚   â”œâ”€â”€ pricing/
â”‚   â”œâ”€â”€ rank-tracker/
â”‚   â”œâ”€â”€ settings/
â”‚   â”œâ”€â”€ snippet-stealer/
â”‚   â”œâ”€â”€ topic-clusters/
â”‚   â”œâ”€â”€ trend-spotter/
â”‚   â””â”€â”€ trends/
â”œâ”€â”€ assets/
â”œâ”€â”€ components/
â”‚   â”œâ”€â”€ charts/
â”‚   â”‚   â”œâ”€â”€ chart-styles.ts
â”‚   â”‚   â”œâ”€â”€ credit-ring.tsx
â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”œâ”€â”€ kd-ring.tsx
â”‚   â”‚   â”œâ”€â”€ lazy-charts.tsx
â”‚   â”‚   â”œâ”€â”€ sparkline.tsx
â”‚   â”‚   â”œâ”€â”€ trending-sparkline.tsx
â”‚   â”‚   â””â”€â”€ velocity-chart.tsx
â”‚   â”œâ”€â”€ common/
â”‚   â”‚   â”œâ”€â”€ demo-wrapper.tsx
â”‚   â”‚   â”œâ”€â”€ empty-state.tsx
â”‚   â”‚   â”œâ”€â”€ error-boundary.tsx
â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”œâ”€â”€ index.tsx
â”‚   â”‚   â”œâ”€â”€ loading-spinner.tsx
â”‚   â”‚   â”œâ”€â”€ page-header.tsx
â”‚   â”‚   â”œâ”€â”€ page-loading.tsx
â”‚   â”‚   â””â”€â”€ data-table/
â”‚   â”‚       â”œâ”€â”€ DataTable.tsx
â”‚   â”‚       â”œâ”€â”€ DataTableBody.tsx
â”‚   â”‚       â”œâ”€â”€ DataTableHeader.tsx
â”‚   â”‚       â”œâ”€â”€ DataTablePagination.tsx
â”‚   â”‚       â”œâ”€â”€ DataTableToolbar.tsx
â”‚   â”‚       â”œâ”€â”€ index.ts
â”‚   â”‚       â””â”€â”€ types.ts
â”‚   â”œâ”€â”€ features/
â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”œâ”€â”€ ai-writer/
â”‚   â”‚   â”‚   â””â”€â”€ index.ts
â”‚   â”‚   â”œâ”€â”€ cannibalization/
â”‚   â”‚   â”‚   â””â”€â”€ index.ts
â”‚   â”‚   â”œâ”€â”€ citation-checker/
â”‚   â”‚   â”‚   â””â”€â”€ index.ts
â”‚   â”‚   â”œâ”€â”€ content-decay/
â”‚   â”‚   â”‚   â””â”€â”€ index.ts
â”‚   â”‚   â”œâ”€â”€ content-roadmap/
â”‚   â”‚   â”‚   â””â”€â”€ index.ts
â”‚   â”‚   â”œâ”€â”€ keyword-overview/
â”‚   â”‚   â”‚   â””â”€â”€ index.ts
â”‚   â”‚   â”œâ”€â”€ on-page-checker/
â”‚   â”‚   â”‚   â””â”€â”€ index.ts
â”‚   â”‚   â”œâ”€â”€ rank-tracker/
â”‚   â”‚   â”‚   â””â”€â”€ index.ts
â”‚   â”‚   â”œâ”€â”€ settings/
â”‚   â”‚   â”‚   â””â”€â”€ index.ts
â”‚   â”‚   â”œâ”€â”€ snippet-stealer/
â”‚   â”‚   â”‚   â””â”€â”€ index.ts
â”‚   â”‚   â”œâ”€â”€ trend-spotter/
â”‚   â”‚   â”‚   â””â”€â”€ index.ts
â”‚   â”‚   â””â”€â”€ video-hijack/
â”‚   â”‚       â””â”€â”€ index.ts
â”‚   â”œâ”€â”€ forms/
â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”œâ”€â”€ keyword-search-form.tsx
â”‚   â”‚   â”œâ”€â”€ settings-form-cards.tsx
â”‚   â”‚   â”œâ”€â”€ settings-form-types.ts
â”‚   â”‚   â”œâ”€â”€ settings-form.tsx
â”‚   â”‚   â””â”€â”€ url-analyzer-form.tsx
â”‚   â”œâ”€â”€ icons/
â”‚   â”‚   â””â”€â”€ platform-icons.tsx
â”‚   â”œâ”€â”€ layout/
â”‚   â”‚   â”œâ”€â”€ app-sidebar.tsx
â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â””â”€â”€ top-nav.tsx
â”‚   â”œâ”€â”€ shared/
â”‚   â”‚   â”œâ”€â”€ cta-section.tsx
â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”œâ”€â”€ marketing-footer.tsx
â”‚   â”‚   â””â”€â”€ marketing-header.tsx
â”‚   â””â”€â”€ ui/
â”‚       â”œâ”€â”€ ai-overview-card.tsx
â”‚       â”œâ”€â”€ alert-dialog.tsx
â”‚       â”œâ”€â”€ alert.tsx
â”‚       â”œâ”€â”€ avatar.tsx
â”‚       â”œâ”€â”€ badge.tsx
â”‚       â”œâ”€â”€ button.tsx
â”‚       â”œâ”€â”€ card.tsx
â”‚       â”œâ”€â”€ checkbox.tsx
â”‚       â”œâ”€â”€ collapsible.tsx
â”‚       â”œâ”€â”€ community-decay-badge.tsx
â”‚       â”œâ”€â”€ dialog.tsx
â”‚       â”œâ”€â”€ dropdown-menu.tsx
â”‚       â”œâ”€â”€ geo-score-ring.tsx
â”‚       â”œâ”€â”€ input.tsx
â”‚       â”œâ”€â”€ label.tsx
â”‚       â”œâ”€â”€ platform-opportunity-badges.tsx
â”‚       â”œâ”€â”€ popover.tsx
â”‚       â”œâ”€â”€ progress.tsx
â”‚       â”œâ”€â”€ radio-group.tsx
â”‚       â”œâ”€â”€ rtv-badge.tsx
â”‚       â”œâ”€â”€ scroll-area.tsx
â”‚       â”œâ”€â”€ select.tsx
â”‚       â”œâ”€â”€ separator.tsx
â”‚       â”œâ”€â”€ sheet.tsx
â”‚       â”œâ”€â”€ sidebar.tsx
â”‚       â”œâ”€â”€ skeleton.tsx
â”‚       â”œâ”€â”€ slider.tsx
â”‚       â”œâ”€â”€ switch.tsx
â”‚       â”œâ”€â”€ table.tsx
â”‚       â”œâ”€â”€ tabs.tsx
â”‚       â”œâ”€â”€ textarea.tsx
â”‚       â”œâ”€â”€ tooltip.tsx
â”‚       â”œâ”€â”€ pixel-rank-badge/
â”‚       â”‚   â”œâ”€â”€ index.ts
â”‚       â”‚   â”œâ”€â”€ PixelPositionIndicator.tsx
â”‚       â”‚   â”œâ”€â”€ PixelRankBadge.tsx
â”‚       â”‚   â”œâ”€â”€ PixelRankCard.tsx
â”‚       â”‚   â””â”€â”€ PixelRankMini.tsx
â”‚       â””â”€â”€ serp-visualizer/
â”‚           â”œâ”€â”€ constants.tsx
â”‚           â”œâ”€â”€ index.ts
â”‚           â”œâ”€â”€ MiniSERPVisualizer.tsx
â”‚           â”œâ”€â”€ PixelRankSummary.tsx
â”‚           â”œâ”€â”€ SERPComparison.tsx
â”‚           â”œâ”€â”€ SERPFeaturesBreakdown.tsx
â”‚           â””â”€â”€ SERPStackVisualizer.tsx
â”œâ”€â”€ config/
â”œâ”€â”€ constants/
â”œâ”€â”€ contexts/
â”‚   â”œâ”€â”€ auth-context.tsx
â”‚   â””â”€â”€ user-context.tsx
â”œâ”€â”€ data/
â”‚   â”œâ”€â”€ dashboard-mock.ts
â”‚   â””â”€â”€ mock/
â”‚       â”œâ”€â”€ content.ts
â”‚       â”œâ”€â”€ index.ts
â”‚       â”œâ”€â”€ keywords.ts
â”‚       â”œâ”€â”€ rankings.ts
â”‚       â”œâ”€â”€ trends.ts
â”‚       â””â”€â”€ users.ts
â”œâ”€â”€ docs/
â”‚   â”œâ”€â”€ AI_VISIBILITY_CODE_AUDIT_REPORT.md
â”‚   â”œâ”€â”€ AI_VISIBILITY_FEATURE_SPEC.md
â”‚   â”œâ”€â”€ BACKEND_INFRASTRUCTURE_GUIDE.md
â”‚   â”œâ”€â”€ FEATURES-FIX-TODO.md
â”‚   â”œâ”€â”€ ai-visibility-analysis.md
â”‚   â”œâ”€â”€ ai-visibility-detailed-analysis.md
â”‚   â”œâ”€â”€ ai-writer-complete-file-structure.md
â”‚   â”œâ”€â”€ affiliate-finder-analysis.md
â”‚   â”œâ”€â”€ affiliate-finder-complete-analysis.md
â”‚   â”œâ”€â”€ blogspy-complete-feature-report.md
â”‚   â”œâ”€â”€ blogspy-complete-features-explanation.md
â”‚   â”œâ”€â”€ blogspy-complete-system-architecture.md
â”‚   â”œâ”€â”€ blogspy-landing-page-feature-report.md
â”‚   â”œâ”€â”€ blogspy-system-architecture-diagram.md
â”‚   â”œâ”€â”€ cannibalization-analysis.md
â”‚   â”œâ”€â”€ cannibalization-complete-analysis.md
â”‚   â”œâ”€â”€ citation-checker-analysis.md
â”‚   â”œâ”€â”€ commerce-tracker-analysis.md
â”‚   â”œâ”€â”€ command-palette-analysis.md
â”‚   â”œâ”€â”€ command-palette-complete-analysis.md
â”‚   â”œâ”€â”€ community-tracker-analysis.md
â”‚   â”œâ”€â”€ community-tracker-complete-analysis.md
â”‚   â”œâ”€â”€ competitor-gap-complete-analysis.md
â”‚   â”œâ”€â”€ content-calendar-changes-list.md
â”‚   â”œâ”€â”€ content-calendar-complete-analysis.md
â”‚   â”œâ”€â”€ content-decay-changes-list.md
â”‚   â”œâ”€â”€ content-decay-complete-analysis.md
â”‚   â”œâ”€â”€ content-decay-deep-dive-analysis.md
â”‚   â”œâ”€â”€ content-roadmap-complete-analysis.md
â”‚   â”œâ”€â”€ content-roi-complete-analysis.md
â”‚   â”œâ”€â”€ feature-analysis-summary.md
â”‚   â”œâ”€â”€ integrations-complete-analysis.md
â”‚   â”œâ”€â”€ KEYWORD_MAGIC_COMPLETE_A-Z_STRUCTURE.md
â”‚   â”œâ”€â”€ keyword-magic-complete-analysis.md
â”‚   â””â”€â”€ BACKEND_INFRASTRUCTURE_GUIDE.md
â”œâ”€â”€ hooks/
â”‚   â”œâ”€â”€ index.ts
â”‚   â”œâ”€â”€ use-api.ts
â”‚   â”œâ”€â”€ use-auth.ts
â”‚   â”œâ”€â”€ use-debounce.ts
â”‚   â”œâ”€â”€ use-user.ts
â”‚   â””â”€â”€ use-*.ts
â”œâ”€â”€ lib/
â”‚   â”œâ”€â”€ ai-overview-analyzer.ts
â”‚   â”œâ”€â”€ api-client.ts
â”‚   â”œâ”€â”€ api-response.ts
â”‚   â”œâ”€â”€ cannibalization-analyzer.ts
â”‚   â”œâ”€â”€ citation-analyzer.ts
â”‚   â”œâ”€â”€ clerk.ts
â”‚   â”œâ”€â”€ clustering-algorithm.ts
â”‚   â”œâ”€â”€ commerce-opportunity-calculator.ts
â”‚   â”œâ”€â”€ community-decay-calculator.ts
â”‚   â”œâ”€â”€ constants.ts
â”‚   â”œâ”€â”€ feature-access.ts
â”‚   â”œâ”€â”€ formatters.ts
â”‚   â”œâ”€â”€ geo-calculator.ts
â”‚   â”œâ”€â”€ logger.ts
â”‚   â”œâ”€â”€ pixel-calculator.ts
â”‚   â”œâ”€â”€ rate-limiter.ts
â”‚   â”œâ”€â”€ rtv-calculator.ts
â”‚   â”œâ”€â”€ safe-action.ts
â”‚   â”œâ”€â”€ seo.ts
â”‚   â”œâ”€â”€ social-opportunity-calculator.ts
â”‚   â”œâ”€â”€ Lemon Squeezy.ts
â”‚   â”œâ”€â”€ utils.ts
â”‚   â”œâ”€â”€ validators.ts
â”‚   â”œâ”€â”€ video-hijack-analyzer.ts
â”‚   â”œâ”€â”€ video-opportunity-calculator.ts
â”‚   â”œâ”€â”€ alerts/
â”‚   â”‚   â”œâ”€â”€ dispatcher.ts
â”‚   â”‚   â”œâ”€â”€ email-sender.ts
â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”œâ”€â”€ slack-sender.ts
â”‚   â”‚   â””â”€â”€ webhook-sender.ts
â”‚   â”œâ”€â”€ decay-detection/
â”‚   â”‚   â”œâ”€â”€ calculator.ts
â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â””â”€â”€ trend-analyzer.ts
â”‚   â”œâ”€â”€ google/
â”‚   â”‚   â”œâ”€â”€ config.ts
â”‚   â”‚   â”œâ”€â”€ ga4-client.ts
â”‚   â”‚   â”œâ”€â”€ gsc-client.ts
â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â””â”€â”€ oauth.ts
â”‚   â””â”€â”€ supabase/
â”‚       â”œâ”€â”€ client.ts
â”‚       â”œâ”€â”€ index.ts
â”‚       â””â”€â”€ server.ts
â”œâ”€â”€ prisma/
â”‚   â””â”€â”€ schema.prisma
â”œâ”€â”€ public/
â”‚   â”œâ”€â”€ favicon.svg
â”‚   â”œâ”€â”€ file.svg
â”‚   â”œâ”€â”€ globe.svg
â”‚   â”œâ”€â”€ logo.svg
â”‚   â”œâ”€â”€ manifest.json
â”‚   â”œâ”€â”€ next.svg
â”‚   â”œâ”€â”€ og-image.svg
â”‚   â”œâ”€â”€ robots.txt
â”‚   â”œâ”€â”€ vercel.svg
â”‚   â”œâ”€â”€ window.svg
â”‚   â””â”€â”€ assets/
â”‚       â””â”€â”€ icons/
â”‚           â””â”€â”€ ai-platforms/
â”‚               â”œâ”€â”€ apple-siri.svg
â”‚               â”œâ”€â”€ chatgpt.svg
â”‚               â”œâ”€â”€ claude.svg
â”‚               â”œâ”€â”€ gemini.svg
â”‚               â”œâ”€â”€ google-aio.svg
â”‚               â”œâ”€â”€ perplexity.svg
â”‚               â””â”€â”€ searchgpt.svg
â”œâ”€â”€ services/
â”‚   â”œâ”€â”€ decay-detection.service.ts
â”‚   â”œâ”€â”€ ga4.service.ts
â”‚   â”œâ”€â”€ gsc.service.ts
â”‚   â”œâ”€â”€ index.ts
â”‚   â”œâ”€â”€ keywords.service.ts
â”‚   â”œâ”€â”€ rank-tracker.service.ts
â”‚   â”œâ”€â”€ rankings.service.ts
â”‚   â”œâ”€â”€ social-tracker.service.ts
â”‚   â”œâ”€â”€ Lemon Squeezy.service.ts
â”‚   â”œâ”€â”€ supabase.service.ts
â”‚   â”œâ”€â”€ trends.service.ts
â”‚   â”œâ”€â”€ user.service.ts
â”‚   â”œâ”€â”€ video-hijack.service.ts
â”‚   â””â”€â”€ dataforseo/
â”‚       â”œâ”€â”€ client.ts
â”‚       â”œâ”€â”€ index.ts
â”‚       â”œâ”€â”€ keywords.ts
â”‚       â””â”€â”€ serp.ts
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ middleware.ts
â”‚   â”œâ”€â”€ lib/
â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”œâ”€â”€ payments/
â”‚   â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”‚   â””â”€â”€ lemonsqueezy.ts
â”‚   â”‚   â””â”€â”€ supabase/
â”‚   â”‚       â”œâ”€â”€ client.ts
â”‚   â”‚       â”œâ”€â”€ index.ts
â”‚   â”‚       â””â”€â”€ server.ts
â”‚   â”œâ”€â”€ shared/
â”‚   â”‚   â”œâ”€â”€ ai-overview/
â”‚   â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”‚   â””â”€â”€ components/
â”‚   â”‚   â”‚       â”œâ”€â”€ AIOpportunityBadge.tsx
â”‚   â”‚   â”‚       â”œâ”€â”€ AIOverviewCard.tsx
â”‚   â”‚   â”‚       â”œâ”€â”€ AIOverviewMini.tsx
â”‚   â”‚   â”‚       â”œâ”€â”€ AIOverviewStatusBadge.tsx
â”‚   â”‚   â”‚       â”œâ”€â”€ CitationList.tsx
â”‚   â”‚   â”‚       â”œâ”€â”€ CitationSourceCard.tsx
â”‚   â”‚   â”‚       â”œâ”€â”€ EntityChip.tsx
â”‚   â”‚   â”‚       â”œâ”€â”€ EntityGrid.tsx
â”‚   â”‚   â”‚       â”œâ”€â”€ index.ts
â”‚   â”‚   â”‚       â”œâ”€â”€ RecommendationCard.tsx
â”‚   â”‚   â”‚       â””â”€â”€ RecommendationsList.tsx
â”‚   â”‚   â”œâ”€â”€ community-decay/
â”‚   â”‚   â”‚   â””â”€â”€ index.ts
â”‚   â”‚   â”œâ”€â”€ dashboard/
â”‚   â”‚   â”‚   â””â”€â”€ components/
â”‚   â”‚   â”œâ”€â”€ geo-score/
â”‚   â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”‚   â””â”€â”€ components/
â”‚   â”‚   â”‚       â”œâ”€â”€ GEOScoreBadge.tsx
â”‚   â”‚   â”‚       â”œâ”€â”€ GEOScoreBreakdown.tsx
â”‚   â”‚   â”‚       â”œâ”€â”€ GEOScoreRing.tsx
â”‚   â”‚   â”‚       â”œâ”€â”€ GEOScoreTooltipContent.tsx
â”‚   â”‚   â”‚       â””â”€â”€ index.ts
â”‚   â”‚   â”œâ”€â”€ pricing/
â”‚   â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”‚   â””â”€â”€ PricingModal.tsx
â”‚   â”‚   â”œâ”€â”€ rtv/
â”‚   â”‚   â”‚   â””â”€â”€ index.ts
â”‚   â”‚   â”œâ”€â”€ settings/
â”‚   â”‚   â”‚   â”œâ”€â”€ constants/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ index.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ settings-content.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ index.ts
â”‚   â”‚   â”‚   â””â”€â”€ utils/
â”‚   â”‚   â”‚       â””â”€â”€ settings-utils.ts
â”‚   â”‚   â””â”€â”€ utils/
â”‚   â”‚       â”œâ”€â”€ greeting.ts
â”‚   â”‚       â””â”€â”€ index.ts
â”‚   â””â”€â”€ features/
â”‚       â”œâ”€â”€ ai-visibility/
â”‚       â”‚   â”œâ”€â”€ _INTEGRATION_GUIDE.ts
â”‚       â”‚   â”œâ”€â”€ constants/
â”‚       â”‚   â”‚   â””â”€â”€ index.tsx
â”‚       â”‚   â”œâ”€â”€ types/
â”‚       â”‚   â”‚   â””â”€â”€ index.ts
â”‚       â”‚   â””â”€â”€ utils/
â”‚       â”‚       â””â”€â”€ index.ts
â”‚       â”œâ”€â”€ cannibalization/
â”‚       â”‚   â”œâ”€â”€ cannibalization-content.tsx
â”‚       â”‚   â”œâ”€â”€ index.ts
â”‚       â”‚   â”œâ”€â”€ __mocks__/
â”‚       â”‚   â”‚   â””â”€â”€ cannibalization-data.ts
â”‚       â”‚   â”œâ”€â”€ components/
â”‚       â”‚   â”‚   â”œâ”€â”€ BulkActionsDialog.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ DomainInputDialog.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ Filters.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ FixIssueDialog.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ IssueList.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ PageHeader.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ SeverityBadge.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ SummaryCards.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ SummaryFooter.tsx
â”‚       â”‚   â”‚   â””â”€â”€ ViewPagesModal.tsx
â”‚       â”‚   â”œâ”€â”€ constants/
â”‚       â”‚   â”‚   â””â”€â”€ index.ts
â”‚       â”‚   â”œâ”€â”€ services/
â”‚       â”‚   â”‚   â””â”€â”€ cannibalization.service.ts
â”‚       â”‚   â””â”€â”€ types/
â”‚       â”‚       â””â”€â”€ index.ts
â”‚       â”œâ”€â”€ citation-checker/
â”‚       â”‚   â”œâ”€â”€ index.ts
â”‚       â”‚   â”œâ”€â”€ __mocks__/
â”‚       â”‚   â”‚   â””â”€â”€ citation-data.ts
â”‚       â”‚   â”œâ”€â”€ components/
â”‚       â”‚   â”‚   â”œâ”€â”€ citation-card.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ citation-filters.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ citation-list.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ citation-score-ring.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚       â”‚   â”‚   â”œâ”€â”€ page-header.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ sidebar-panels.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ status-badge.tsx
â”‚       â”‚   â”‚   â””â”€â”€ summary-cards.tsx
â”‚       â”‚   â”œâ”€â”€ constants/
â”‚       â”‚   â”‚   â””â”€â”€ index.ts
â”‚       â”‚   â”œâ”€â”€ types/
â”‚       â”‚   â”‚   â””â”€â”€ index.ts
â”‚       â”‚   â””â”€â”€ utils/
â”‚       â”‚       â””â”€â”€ citation-utils.ts
â”‚       â”œâ”€â”€ monetization/
â”‚       â”‚   â”œâ”€â”€ index.ts
â”‚       â”‚   â”œâ”€â”€ types/
â”‚       â”‚   â”‚   â””â”€â”€ index.ts
â”‚       â”‚   â””â”€â”€ utils/
â”‚       â”‚       â””â”€â”€ index.ts
â”‚       â”œâ”€â”€ news-tracker/
â”‚       â”‚   â”œâ”€â”€ index.ts
â”‚       â”‚   â”œâ”€â”€ news-tracker-content.tsx
â”‚       â”‚   â”œâ”€â”€ news-tracker-content-refactored.tsx
â”‚       â”‚   â”œâ”€â”€ __mocks__/
â”‚       â”‚   â”‚   â””â”€â”€ index.ts
â”‚       â”‚   â”œâ”€â”€ components/
â”‚       â”‚   â”‚   â”œâ”€â”€ AddKeywordDialog.tsx
â”‚       â”‚   â”‚   â””â”€â”€ SetAlertDialog.tsx
â”‚       â”‚   â”œâ”€â”€ config/
â”‚       â”‚   â”‚   â”œâ”€â”€ api-pricing.config.ts
â”‚       â”‚   â”‚   â””â”€â”€ index.ts
â”‚       â”‚   â”œâ”€â”€ hooks/
â”‚       â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚       â”‚   â”‚   â”œâ”€â”€ useCredits.ts
â”‚       â”‚   â”‚   â””â”€â”€ useNewsTracker.ts
â”‚       â”‚   â”œâ”€â”€ services/
â”‚       â”‚   â”‚   â”œâ”€â”€ credit-plans.ts
â”‚       â”‚   â”‚   â”œâ”€â”€ credit-transactions.service.ts
â”‚       â”‚   â”‚   â”œâ”€â”€ credit.service.refactored.ts
â”‚       â”‚   â”‚   â”œâ”€â”€ credit.service.ts
â”‚       â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚       â”‚   â”‚   â”œâ”€â”€ news-tracker.service.ts
â”‚       â”‚   â”‚   â”œâ”€â”€ promo-codes.service.ts
â”‚       â”‚   â”‚   â”œâ”€â”€ rate-limiter.service.ts
â”‚       â”‚   â”‚   â””â”€â”€ security.service.ts
â”‚       â”‚   â””â”€â”€ types/
â”‚       â”‚       â”œâ”€â”€ api.types.ts
â”‚       â”‚       â”œâ”€â”€ credits.types.ts
â”‚       â”‚       â””â”€â”€ index.ts
â”‚       â”œâ”€â”€ snippet-stealer/
â”‚       â”‚   â”œâ”€â”€ index.ts
â”‚       â”‚   â”œâ”€â”€ snippet-stealer-content.tsx
â”‚       â”‚   â”œâ”€â”€ __mocks__/
â”‚       â”‚   â”‚   â””â”€â”€ snippet-data.ts
â”‚       â”‚   â”œâ”€â”€ components/
â”‚       â”‚   â”‚   â”œâ”€â”€ competitor-snippet-card.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ google-preview.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚       â”‚   â”‚   â”œâ”€â”€ opportunity-list.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ snippet-editor.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ toast-notification.tsx
â”‚       â”‚   â”‚   â””â”€â”€ workbench-header.tsx
â”‚       â”‚   â”œâ”€â”€ constants/
â”‚       â”‚   â”‚   â””â”€â”€ index.ts
â”‚       â”‚   â”œâ”€â”€ services/
â”‚       â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚       â”‚   â”‚   â””â”€â”€ snippet-stealer.service.ts
â”‚       â”‚   â””â”€â”€ utils/
â”‚       â”‚       â””â”€â”€ snippet-utils.ts
â”‚       â”œâ”€â”€ social-tracker/
â”‚       â”‚   â”œâ”€â”€ index.ts
â”‚       â”‚   â”œâ”€â”€ social-tracker-content.tsx
â”‚       â”‚   â”œâ”€â”€ __mocks__/
â”‚       â”‚   â”‚   â””â”€â”€ index.ts
â”‚       â”‚   â”œâ”€â”€ components/
â”‚       â”‚   â”‚   â”œâ”€â”€ AddKeywordModal.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ CreditPurchaseCard.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ DeleteKeywordDialog.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚       â”‚   â”‚   â”œâ”€â”€ SocialPlatformTabs.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ SocialSummaryCards.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ SocialTrackerEmptyState.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ SocialTrackerErrorBoundary.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ SocialTrackerHeader.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ SocialTrackerSidebar.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ SocialTrackerSkeleton.tsx
â”‚       â”‚   â”‚   â””â”€â”€ keyword-card/
â”‚       â”‚   â”‚       â”œâ”€â”€ index.ts
â”‚       â”‚   â”‚       â”œâ”€â”€ InstagramKeywordCard.tsx
â”‚       â”‚   â”‚       â”œâ”€â”€ KeywordCardActionMenu.tsx
â”‚       â”‚   â”‚       â”œâ”€â”€ KeywordCardShared.tsx
â”‚       â”‚   â”‚       â”œâ”€â”€ PinterestKeywordCard.tsx
â”‚       â”‚   â”‚       â”œâ”€â”€ SocialKeywordCard.tsx
â”‚       â”‚   â”‚       â”œâ”€â”€ SocialKeywordList.tsx
â”‚       â”‚   â”‚       â””â”€â”€ TwitterKeywordCard.tsx
â”‚       â”‚   â”œâ”€â”€ constants/
â”‚       â”‚   â”‚   â””â”€â”€ index.ts
â”‚       â”‚   â”œâ”€â”€ credits/
â”‚       â”‚   â”‚   â”œâ”€â”€ config/
â”‚       â”‚   â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚       â”‚   â”‚   â”‚   â””â”€â”€ pricing.config.ts
â”‚       â”‚   â”‚   â”œâ”€â”€ hooks/
â”‚       â”‚   â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚       â”‚   â”‚   â”‚   â”œâ”€â”€ useCreditBalance.ts
â”‚       â”‚   â”‚   â”‚   â”œâ”€â”€ useCreditPackages.ts
â”‚       â”‚   â”‚   â”‚   â”œâ”€â”€ useCreditPurchase.ts
â”‚       â”‚   â”‚   â”‚   â”œâ”€â”€ useCreditTransactions.ts
â”‚       â”‚   â”‚   â”‚   â”œâ”€â”€ useCreditUsage.ts
â”‚       â”‚   â”‚   â”‚   â””â”€â”€ usePromoCode.ts
â”‚       â”‚   â”‚   â””â”€â”€ components/
â”‚       â”‚   â”‚       â”œâ”€â”€ CreditBalanceWidget.tsx
â”‚       â”‚   â”‚       â”œâ”€â”€ CreditCustomSlider.tsx
â”‚       â”‚   â”‚       â”œâ”€â”€ CreditPackageList.tsx
â”‚       â”‚   â”‚       â”œâ”€â”€ CreditPromoInput.tsx
â”‚       â”‚   â”‚       â”œâ”€â”€ CreditPurchaseCard.tsx
â”‚       â”‚   â”‚       â”œâ”€â”€ CreditTransactionHistory.tsx
â”‚       â”‚   â”‚       â”œâ”€â”€ CreditTrustBadges.tsx
â”‚       â”‚   â”‚       â”œâ”€â”€ index.ts
â”‚       â”‚   â”‚       â””â”€â”€ PlatformCreditCostCard.tsx
â”‚       â”‚   â”œâ”€â”€ hooks/
â”‚       â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚       â”‚   â”‚   â”œâ”€â”€ useSocialFilters.ts
â”‚       â”‚   â”‚   â”œâ”€â”€ useSocialKeywords.ts
â”‚       â”‚   â”‚   â””â”€â”€ useSocialTracker.ts
â”‚       â”‚   â””â”€â”€ types/
â”‚       â”‚       â””â”€â”€ index.ts
â”‚       â”œâ”€â”€ topic-clusters/
â”‚       â”‚   â”œâ”€â”€ index.ts
â”‚       â”‚   â”œâ”€â”€ topic-cluster-content.tsx
â”‚       â”‚   â”œâ”€â”€ topic-cluster-page.tsx
â”‚       â”‚   â”œâ”€â”€ components/
â”‚       â”‚   â”‚   â”œâ”€â”€ BackgroundEffects.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ ClusterInspector.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ ClusterListView.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ DifficultyLegend.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ EmptyState.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ add-keywords-modal.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ article-list-view.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ cluster-builder-panel.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ cluster-builder.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ cluster-overview.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ cluster-results.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ content-briefs-panel.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ create-project-modal.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ import-keywords-modal.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚       â”‚   â”‚   â”œâ”€â”€ keyword-pool-table.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ linking-matrix.tsx
â”‚       â”‚   â”‚   â””â”€â”€ project-detail.tsx
â”‚       â”‚   â”œâ”€â”€ constants/
â”‚       â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚       â”‚   â”‚   â”œâ”€â”€ mock-cluster-data.ts
â”‚       â”‚   â”‚   â””â”€â”€ mock-projects.ts
â”‚       â”‚   â”œâ”€â”€ hooks/
â”‚       â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚       â”‚   â”‚   â””â”€â”€ use-project.ts
â”‚       â”‚   â”œâ”€â”€ services/
â”‚       â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚       â”‚   â”‚   â””â”€â”€ project.service.ts
â”‚       â”‚   â”œâ”€â”€ types/
â”‚       â”‚   â”‚   â”œâ”€â”€ cluster-analysis.types.ts
â”‚       â”‚   â”‚   â”œâ”€â”€ cluster-builder.types.ts
â”‚       â”‚   â”‚   â”œâ”€â”€ content-brief.types.ts
â”‚       â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚       â”‚   â”‚   â”œâ”€â”€ keyword-pool.types.ts
â”‚       â”‚   â”‚   â””â”€â”€ project.types.ts
â”‚       â”‚   â””â”€â”€ utils/
â”‚       â”‚       â”œâ”€â”€ cluster-analysis-engine.ts
â”‚       â”‚       â”œâ”€â”€ cluster-utils.ts
â”‚       â”‚       â””â”€â”€ keyword-analysis-engine.ts
â”‚       â”œâ”€â”€ trend-spotter/
â”‚       â”‚   â”œâ”€â”€ index.ts
â”‚       â”‚   â”œâ”€â”€ trend-spotter.tsx
â”‚       â”‚   â”œâ”€â”€ __mocks__/
â”‚       â”‚   â”‚   â”œâ”€â”€ calendar-data.ts
â”‚       â”‚   â”‚   â”œâ”€â”€ geo-data.ts
â”‚       â”‚   â”‚   â””â”€â”€ index.ts
â”‚       â”‚   â”œâ”€â”€ components/
â”‚       â”‚   â”‚   â”œâ”€â”€ cascading-city-dropdown.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ content-type-suggester.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ geographic-interest.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ icons.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚       â”‚   â”‚   â”œâ”€â”€ news-context.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ publish-timing.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ related-data-lists.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ searchable-country-dropdown.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ trend-alert-button.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ trend-calendar.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ velocity-chart.tsx
â”‚       â”‚   â”‚   â”œâ”€â”€ world-map.tsx
â”‚       â”‚   â”‚   â””â”€â”€ calendar/
â”‚       â”‚   â”‚       â”œâ”€â”€ CalendarFilters.tsx
â”‚       â”‚   â”‚       â”œâ”€â”€ CalendarFooter.tsx
â”‚       â”‚   â”‚       â”œâ”€â”€ CalendarHeader.tsx
â”‚       â”‚   â”‚       â”œâ”€â”€ EventItem.tsx
â”‚       â”‚   â”‚       â”œâ”€â”€ index.ts
â”‚       â”‚   â”‚       â””â”€â”€ MonthCard.tsx
â”‚       â”‚   â”œâ”€â”€ constants/
â”‚       â”‚   â”‚   â””â”€â”€ index.ts
â”‚       â”‚   â”œâ”€â”€ types/
â”‚       â”‚   â”‚   â””â”€â”€ index.ts
â”‚       â”‚   â””â”€â”€ utils/
â”‚       â”‚       â”œâ”€â”€ calendar-utils.ts
â”‚       â”‚       â”œâ”€â”€ date-utils.ts
â”‚       â”‚       â””â”€â”€ index.ts
â”‚       â””â”€â”€ video-hijack/
â”‚           â”œâ”€â”€ index.ts
â”‚           â”œâ”€â”€ video-hijack-content-refactored.tsx
â”‚           â”œâ”€â”€ video-hijack-content.tsx
â”‚           â”œâ”€â”€ __mocks__/
â”‚           â”‚   â”œâ”€â”€ tiktok-data.ts
â”‚           â”‚   â””â”€â”€ video-data.ts
â”‚           â”œâ”€â”€ api/
â”‚           â”‚   â””â”€â”€ index.ts
â”‚           â”œâ”€â”€ components/
â”‚           â”‚   â”œâ”€â”€ HijackScoreRing.tsx
â”‚           â”‚   â”œâ”€â”€ index.ts
â”‚           â”‚   â”œâ”€â”€ KeywordCard.tsx
â”‚           â”‚   â”œâ”€â”€ KeywordList.tsx
â”‚           â”‚   â”œâ”€â”€ PageHeader.tsx
â”‚           â”‚   â”œâ”€â”€ SidebarPanels.tsx
â”‚           â”‚   â”œâ”€â”€ StatusBadges.tsx
â”‚           â”‚   â”œâ”€â”€ SummaryCards.tsx
â”‚           â”‚   â”œâ”€â”€ TikTokResultCard.tsx
â”‚           â”‚   â”œâ”€â”€ TikTokTab.tsx
â”‚           â”‚   â”œâ”€â”€ VideoFilters.tsx
â”‚           â”‚   â”œâ”€â”€ VideoPlatformTabs.tsx
â”‚           â”‚   â”œâ”€â”€ VideoResultsSidebar.tsx
â”‚           â”‚   â”œâ”€â”€ VideoSearchBox.tsx
â”‚           â”‚   â”œâ”€â”€ VideoStatsPanel.tsx
â”‚           â”‚   â”œâ”€â”€ VideoSuggestionPanel.tsx
â”‚           â”‚   â”œâ”€â”€ YouTubeResultCard.tsx
â”‚           â”‚   â”œâ”€â”€ shared/
â”‚           â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚           â”‚   â”‚   â”œâ”€â”€ VideoResultsSidebar.tsx
â”‚           â”‚   â”‚   â”œâ”€â”€ VideoSearchBox.tsx
â”‚           â”‚   â”‚   â”œâ”€â”€ VideoStatsPanel.tsx
â”‚           â”‚   â”‚   â””â”€â”€ VideoSuggestionPanel.tsx
â”‚           â”‚   â”œâ”€â”€ tiktok/
â”‚           â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚           â”‚   â”‚   â”œâ”€â”€ TikTokResultCard.tsx
â”‚           â”‚   â”‚   â””â”€â”€ TikTokResultsList.tsx
â”‚           â”‚   â””â”€â”€ youtube/
â”‚           â”‚       â””â”€â”€ YouTubeResultsList.tsx
â”‚           â”œâ”€â”€ constants/
â”‚           â”‚   â”œâ”€â”€ index.ts
â”‚           â”‚   â””â”€â”€ platforms.ts
â”‚           â”œâ”€â”€ services/
â”‚           â”‚   â”œâ”€â”€ index.ts
â”‚           â”‚   â”œâ”€â”€ tiktok.service.ts
â”‚           â”‚   â””â”€â”€ youtube.service.ts
â”‚           â”œâ”€â”€ types/
â”‚           â”‚   â”œâ”€â”€ common.types.ts
â”‚           â”‚   â”œâ”€â”€ index.ts
â”‚           â”‚   â”œâ”€â”€ platforms.ts
â”‚           â”‚   â”œâ”€â”€ tiktok.types.ts
â”‚           â”‚   â”œâ”€â”€ video-search.types.ts
â”‚           â”‚   â””â”€â”€ youtube.types.ts
â”‚           â””â”€â”€ utils/
â”‚               â”œâ”€â”€ common.utils.ts
â”‚               â”œâ”€â”€ helpers.tsx
â”‚               â”œâ”€â”€ index.ts
â”‚               â”œâ”€â”€ mock-generators.ts
â”‚               â”œâ”€â”€ tiktok.utils.ts
â”‚               â”œâ”€â”€ video-utils.ts
â”‚               â””â”€â”€ youtube.utils.ts
â”œâ”€â”€ store/
â”‚   â”œâ”€â”€ index.ts
â”‚   â”œâ”€â”€ keyword-store.ts
â”‚   â”œâ”€â”€ ui-store.ts
â”‚   â””â”€â”€ user-store.ts
â”œâ”€â”€ supabase/
â”‚   â””â”€â”€ migrations/
â”‚       â”œâ”€â”€ 001_decay_detection_system.sql
â”‚       â””â”€â”€ 002_user_credits_system.sql
â””â”€â”€ types/
    â”œâ”€â”€ api.ts
    â”œâ”€â”€ competitor.types.ts
    â”œâ”€â”€ content.types.ts
    â”œâ”€â”€ dashboard.ts
    â”œâ”€â”€ decay-detection.types.ts
    â””â”€â”€ ga4.types.ts