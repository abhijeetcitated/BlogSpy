# BlogSpy Project Guidelines

## Tech Stack
- Next.js 14 App Router
- TypeScript (strict mode)
- Tailwind CSS
- Prisma ORM with Supabase
- Clerk for authentication
- Shadcn/ui for UI components
- React Query (TanStack Query) for server state
- Zustand for client state

## Coding Standards
- Use arrow functions for components
- Always include TypeScript types
- Import responsive utilities from `src/styles/responsive.ts`
- Use `cn()` utility from `lib/utils.ts` for className merging
- Follow existing component patterns in `components/` folder
- Prefer named exports over default exports
- Use async/await over .then() chains

## File Structure
- Pages in `app/` folder (App Router)
- Shared components in `components/` folder
- Feature-specific components in `src/features/` folder
- Custom hooks in `hooks/` folder
- API utilities in `lib/` folder
- Type definitions in `types/` folder
- Store (Zustand) in `store/` folder
- Constants in `constants/` folder

## Component Patterns
- Use shadcn/ui components from `components/ui/`
- Wrap complex state in custom hooks
- Use React Query for server state
- Use Zustand for client state (store/)
- Always use TypeScript interfaces for props
- Use forwardRef for components that need refs

## Naming Conventions
- Components: PascalCase (e.g., `KeywordTable.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useKeywords.ts`)
- Utilities: camelCase (e.g., `formatters.ts`)
- Types: PascalCase with suffix (e.g., `KeywordData`, `APIResponse`)
- Constants: SCREAMING_SNAKE_CASE for values, camelCase for objects
- API routes: kebab-case (e.g., `api/keyword-data`)

## Import Order
1. React/Next.js imports
2. Third-party libraries
3. Internal components
4. Hooks
5. Utils/helpers
6. Types
7. Styles

## Error Handling
- Use try-catch for async operations
- Return typed error responses from API
- Show user-friendly error messages with toast
- Log errors to console in development
- Use Zod for runtime validation

## Agent Behavior Instructions
- When fixing bugs, ALWAYS check existing patterns in codebase first
- When creating new files, follow existing folder structure
- When modifying API routes, update types accordingly
- Run `npm run build` to verify changes compile correctly
- Use existing UI components from `components/ui/` before creating new ones

## Terminal Commands (Auto-Approved)
- You are authorized to run: `npm run dev`, `npm run build`, `npm test`
- You are authorized to run: `git status`, `git diff`, `git log`
- You are authorized to run: `npx prisma generate`, `npx prisma db push`
- NEVER run destructive commands like `rm -rf`, `git push --force`

## Code Review Checklist
- TypeScript types are properly defined
- No `any` types without justification
- Responsive design using `src/styles/responsive.ts`
- Error states are handled
- Loading states are implemented
- Accessibility attributes included (aria-labels, roles)

