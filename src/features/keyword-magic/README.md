# Keyword Magic Feature

A comprehensive keyword research tool for discovering SEO opportunities with detailed metrics, filters, and analysis.

## Directory Structure

```
keyword-magic/
├── actions/                    # Server actions (secured with authAction)
│   ├── search.action.ts       # Main keyword search action
│   └── index.ts
├── api/                        # API route handlers
│   └── route.ts
├── components/                 # UI components
│   ├── filters/               # Filter components by type
│   │   ├── cpc/              # CPC range filter
│   │   ├── geo/              # Geography filter
│   │   ├── include-exclude/  # Keyword include/exclude
│   │   ├── intent/           # Search intent filter
│   │   ├── kd/               # Keyword difficulty filter
│   │   ├── match-type/       # Match type selector
│   │   ├── serp/             # SERP features filter
│   │   ├── trend/            # Trend filter
│   │   ├── volume/           # Search volume filter
│   │   └── weak-spot/        # Weak spot filter
│   ├── header/               # Header components
│   ├── modals/               # Modal dialogs
│   ├── page-sections/        # Main page sections
│   ├── search/               # Search input components
│   ├── shared/               # Shared utilities
│   └── table/                # Data table
│       ├── action-bar/       # Selection action bar
│       └── columns/          # Individual column components
├── config/                    # Configuration
│   ├── api-config.ts         # API settings
│   └── feature-config.ts     # Feature flags & defaults
├── hooks/                     # Custom React hooks
├── providers/                 # Context providers
├── services/                  # Business logic (server-only)
├── store/                     # Zustand store re-exports
├── types/                     # TypeScript types
├── utils/                     # Utility functions
├── validators/                # Zod schemas
├── __mocks__/                 # Mock data for development
└── __tests__/                 # Test files
```

## Key Features

- **Keyword Search**: Single and bulk keyword lookup
- **Advanced Filters**: Volume, KD, CPC, intent, SERP features, etc.
- **Column Components**: Modular table columns with tooltips
- **Export**: CSV, JSON, XLSX export capabilities
- **Selection**: Multi-select with bulk actions
- **Weak Spots**: Competitive opportunity analysis

## Usage

### Basic Search

```tsx
import { KeywordMagicProvider } from './providers'
import { KeywordMagicSearch, KeywordMagicResults } from './components/page-sections'

function KeywordMagicPage() {
  return (
    <KeywordMagicProvider>
      <KeywordMagicSearch />
      <KeywordMagicResults />
    </KeywordMagicProvider>
  )
}
```

### Using the Store

```tsx
import { useKeywordStore } from './store'

function MyComponent() {
  const keywords = useKeywordStore((state) => state.keywords)
  const setKeyword = useKeywordStore((state) => state.setKeyword)
  
  return <div>{/* ... */}</div>
}
```

### Server Actions

```tsx
import { searchKeywords } from './actions'

// In a server component or action
const result = await searchKeywords({
  keyword: 'seo tools',
  country: 'us',
  matchType: 'broad',
})
```

## Configuration

Edit `config/feature-config.ts` to customize:

- Default country and match type
- Filter ranges and defaults
- Visible columns
- Export settings

## Security

- All server actions use `authAction` wrapper for authentication
- Services are protected with `server-only` directive
- Input validation via Zod schemas in `validators/`

## Testing

```bash
# Run tests
npm test -- --testPathPattern=keyword-magic

# Run with coverage
npm test -- --coverage --testPathPattern=keyword-magic
```

## Contributing

1. Follow the established folder structure
2. Add barrel exports for new modules
3. Include TypeScript types
4. Write tests for new functionality
