# Communify

A Reddit-style community hub built with React Native and Expo. Users can browse communities, join them, read posts, and create new ones — with offline support baked in from the start.

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
│   ├── common/       # Reusable UI (Button, Input, Modal, Skeleton...)
│   └── features/     # Domain components (CommunityCard, PostCard)
├── hooks/            # Business logic lives here, not in screens
├── navigation/       # Auth flow + Main tab/stack navigator
├── screens/          # Layout and navigation only — no business logic
├── services/         # Storage, offline queue, React Query client
├── store/            # Zustand — auth state + offline queue only
├── theme/            # Design tokens — colors, spacing, typography
├── types/            # Shared TypeScript interfaces
└── utils/            # Validation schemas, helper functions
```

### State Management

I chose React Query + Zustand rather than a single global store. The split is deliberate:

**React Query** owns all server state — communities, posts, pagination, caching, background refetch. It handles the async lifecycle cleanly and gives optimistic updates, cache invalidation, and loading/error states for free.

**Zustand** handles two slices only: auth session and the offline action queue. These are genuinely client-side concerns that React Query isn't designed for. Keeping Zustand minimal means there's no risk of server state and client state getting out of sync.

**React Hook Form + Zod** handles form state on the create post screen. Draft content is persisted to AsyncStorage on every keystroke so it survives unexpected app restarts.

### Mock API

The app uses an inline Axios adapter instead of MSW. MSW requires a Service Worker which isn't supported in React Native. The adapter intercepts requests by URL pattern, returns typed responses with a simulated 300ms delay, and is toggled by a single `USE_MOCK` flag in `src/api/client.ts`.

Swapping to a real backend means changing that flag and updating the `baseURL`. Nothing else changes.

Community lookups use a `Map` for O(1) access. The adapter enforces uniqueness on post titles per user per community, returning a 409 which the UI surfaces as an inline field error rather than a disruptive alert.

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

### Known Limitations

**Cache persistence** — The React Query cache lives in memory. If the app is fully killed and relaunched while offline, cached community and post data won't be available. The fix is `@tanstack/query-async-storage-persister` to persist the cache to AsyncStorage across restarts — this is the first thing I would add with more time.

**Queue and sync with mock API** — The offline queue and sync logic are correctly implemented in `offlineStore` and `offlineQueue.ts`. However they cannot be demonstrated with the mock API since it runs locally in-memory and doesn't require network access. In production with a real backend, join/leave actions performed offline would be queued to AsyncStorage and replayed automatically on reconnect.

---

## Key Decisions

**No MSW** — The inline Axios adapter is simpler, has zero setup friction, and is easier to reason about than a service worker in a React Native context. The adapter is a thin routing layer — easy to replace.

**FlatList over FlashList** — Initially used FlashList for performance, but the community list has at most 25 items and the detail screen's post list is similarly bounded. FlatList is simpler, has no external dependency, and is sufficient at this scale. FlashList would be the right call for lists with hundreds of items and complex cell rendering.

**Zustand scope kept minimal** — Anything that comes from the server lives in React Query. Zustand only manages what genuinely doesn't fit there: session state and the offline mutation queue.

**Module-level submission guard** — The create post screen uses a module-level boolean to prevent duplicate submissions. A React ref resets on re-render in StrictMode; a module-level variable doesn't. This is a pragmatic solution to a known StrictMode double-invocation behaviour in development.

**ConfirmModal over native Alert** — Native `Alert` styling differs between iOS and Android and can't be customised. A custom modal gives consistent UX and matches the app's design system.

**Map for community lookups** — The mock adapter uses a `Map<string, Community>` for O(1) ID-based lookups instead of O(n) array `find`. Built once on store initialisation and kept in sync on mutations.

---

## Performance Notes

- `useCallback` and `useMemo` on list render functions and computed values
- FlatList with stable `keyExtractor` and memoised `renderItem`
- React Query `staleTime` of 5 minutes reduces unnecessary network requests
- `refetchOnWindowFocus: false` and `refetchOnMount: false` on post queries — prevents refetch on navigation which was causing cache inconsistencies
- Skeleton placeholders instead of spinners for initial loads — better perceived performance
- Optimistic updates on join/leave and post creation — UI responds instantly without waiting for the server

---

## Future Improvements

- **Persist React Query cache** to AsyncStorage using `@tanstack/query-async-storage-persister` so offline data survives app restarts
- **Post detail screen** with full content and comment thread
- **Like functionality** with optimistic update and offline queue support
- **Push notifications** for community activity
- **Unit tests** for hooks and utility functions using Jest and React Native Testing Library
- **E2E tests** with Detox for critical flows — login, create post, join community
- **Error boundaries** around each screen for graceful crash recovery
- **Accessibility** — `accessibilityLabel` and `accessibilityRole` on all interactive elements
- **Dark mode** — design tokens already support it, needs a theme context and toggle UI
- **Real backend** — flip `USE_MOCK` in `src/api/client.ts`, update `baseURL`, done
- **CI/CD** — GitHub Actions for lint, type-check, and EAS build on push
