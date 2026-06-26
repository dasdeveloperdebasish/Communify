# Communify

A Reddit-style community hub built with React Native and Expo. Users can browse communities, join them, read posts, and create new ones — with full offline support baked in from the start.

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo Go app on your device, or an Android/iOS emulator
- macOS if you want to run on iOS simulator

### Install

```bash
git clone <repo-url>
cd Communify
npm install
```

### Run

```bash
npx expo start
```

Scan the QR code with Expo Go, or press `a` for Android emulator, `i` for iOS simulator.

### Login

Any valid email + password (min 6 chars). Auth is mocked — no backend required.

---

## Architecture

### Folder Structure

```
src/
├── api/              # Axios client + inline mock adapter
├── components/
│   ├── common/       # Reusable UI (Button, Input, Card, Modal...)
│   └── features/     # Domain components (CommunityCard, PostCard)
├── hooks/            # Business logic lives here, not in screens
├── navigation/       # Auth flow + Main tab/stack navigator
├── screens/          # Layout and navigation only — no business logic
├── services/         # Storage, offline queue, React Query client
├── store/            # Zustand (auth state + offline queue only)
├── theme/            # Design tokens — colors, spacing, typography
├── types/            # Shared TypeScript interfaces
└── utils/            # Validation schemas, helper functions
```

### State Management

I chose React Query + Zustand rather than a single global store. The split is deliberate:

**React Query** owns all server state — communities, posts, pagination, caching, background refetch. It handles the async lifecycle cleanly and gives optimistic updates and cache invalidation for free.

**Zustand** handles two slices only: auth session and the offline action queue. These are genuinely client-side concerns that React Query isn't designed for. Keeping Zustand minimal means there's no risk of server state and client state getting out of sync.

**React Hook Form + Zod** handles form state on the create post screen. Draft content is persisted to AsyncStorage on every keystroke so it survives unexpected app restarts.

### Mock API

The app uses an inline Axios adapter instead of MSW. MSW requires a Service Worker which isn't supported in React Native. The adapter intercepts requests by URL pattern, returns typed responses with a simulated 300ms delay, and is toggled by a single `USE_MOCK` flag in `src/api/client.ts`.

Swapping to a real backend means changing that flag and updating the `baseURL`. Nothing else changes.

Community lookups use a `Map` for O(1) access. The adapter also enforces uniqueness on post titles per user per community, returning a 409 which the UI surfaces as an inline field error.

### Navigation

```
AppNavigator
├── AuthNavigator
│   └── LoginScreen
└── MainNavigator (bottom tabs)
    ├── CommunitiesTab
    │   └── CommunitiesStack
    │       ├── CommunityListScreen
    │       ├── CommunityDetailScreen
    │       └── CreatePostScreen (modal)
    └── ProfileTab
        └── ProfileScreen
```

Session is restored from SecureStore on launch. The navigator switches between auth and main automatically. Tab bar hides on detail and modal screens.

---

## Offline Strategy

Detection is event-driven via `NetInfo.addEventListener` — no polling. When connectivity changes, `offlineStore` updates immediately and all subscribed components re-render.

- **Cached data** — React Query serves stale data from memory when offline. Users see the last known state rather than an error screen.
- **Join/Leave queue** — Actions performed offline are pushed to AsyncStorage. On reconnect, `syncOfflineQueue()` replays them against the API and React Query invalidates the relevant queries.
- **Draft persistence** — Post drafts are saved to AsyncStorage on every keystroke. If the app is killed mid-draft, content is restored when the user returns to the create post screen.

One honest limitation: the React Query cache lives in memory. If the app is fully killed and relaunched offline, cached community and post data won't be available. The fix would be `@tanstack/query-async-storage-persister` to persist the cache across restarts — noted as a future improvement.

---

## Key Decisions

**No MSW** — The inline Axios adapter approach is simpler, has zero setup friction, and is easier to reason about than a service worker in a React Native context.

**FlatList over FlashList** — Initially used FlashList for performance, but the community list has at most 25 items and the detail screen's post list is similarly bounded. FlatList is simpler, has no external dependency, and is sufficient. FlashList would be the right call for lists with hundreds of items and complex cell rendering.

**Zustand scope** — Deliberately kept small. Anything that comes from the server lives in React Query. Zustand only manages what genuinely doesn't fit there.

**Module-level submission guard** — The create post screen uses a module-level boolean to prevent duplicate submissions. A React ref resets on re-render in StrictMode; a module-level variable doesn't. This is a pragmatic solution to a StrictMode double-invocation issue in development.

**ConfirmModal over Alert** — Native `Alert` looks different on iOS and Android and can't be styled. A custom modal gives consistent UX and matches the app's design system.

---

## Performance Notes

- `useCallback` and `useMemo` on list render functions and expensive computations
- FlatList with `keyExtractor` and stable item keys
- React Query `staleTime` of 5 minutes reduces unnecessary network requests
- `refetchOnWindowFocus: false` on post queries — prevents refetch on navigation which was causing duplicate post entries
- Skeleton placeholders instead of spinners for initial loads

---

## What I'd improve with more time

- **Persist React Query cache** to AsyncStorage so offline data survives app restarts
- **Post detail screen** with full content and comment thread
- **Like functionality** with optimistic update and offline queue support
- **Push notifications** for community activity
- **Unit tests** for hooks and utility functions using Jest and React Native Testing Library
- **E2E tests** with Detox for critical flows (login, create post, join community)
- **Error boundaries** around each screen for graceful crash recovery
- **Accessibility** — `accessibilityLabel` and `accessibilityRole` on all interactive elements
- **Dark mode** — design tokens already support it, needs a theme context and toggle UI
- **Real backend** — flip `USE_MOCK` in `src/api/client.ts`, update `baseURL`, done
