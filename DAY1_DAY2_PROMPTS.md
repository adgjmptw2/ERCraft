# ERCraft — Day 1 & Day 2 Prompts

---

## DAY 1 — Project Init & Structure

> 목표: 레포에 올릴 수 있는 뼈대 완성. 실행은 되고, 빈 페이지여도 괜찮음.

```

Set up the ERCraft project.

1. Init a Vite + React + TypeScript project
2. Install dependencies at latest stable versions:
   - zustand, @tanstack/react-query
   - axios, react-router-dom
   - react-window, @types/react-window
   - tailwindcss, autoprefixer, postcss
   - lucide-react, clsx, tailwind-merge
   - react-hook-form, zod
   Then run: npx shadcn@latest init

3. Set up path alias: @/ → src/ in both tsconfig.json and vite.config.ts

   Each folder gets an empty index.ts only — no code yet.

5. Create src/types/ with these files.
   Write realistic interfaces based on Eternal Return game data.
   Keep it minimal — only fields we'll actually use in the UI.
   - api.ts    → ApiResult<T>, DataSource
   - player.ts → PlayerSummary, PlayerStats, PlayerRanking, NicknameHistory
   - match.ts  → MatchSummary, MatchDetail
   - ranking.ts → RankingEntry, MmrProjection

6. Set up React Router in main.tsx with these routes:
   /              → HomePage (empty shell)
   /player/:nickname → ProfilePage (empty shell)
   /ranking       → RankingPage (empty shell)
   /auth/callback → AuthCallbackPage (empty shell)
   *              → NotFoundPage (simple 404 message)

7. Create these config files:
   - .env.example  (VITE_API_BASE_URL= and VITE_BSER_API_KEY=, no values)
   - .env.local    (same keys, gitignored)
   - .gitignore    (node_modules, dist, .env.local)
   - prettier.config.js (semi: false, singleQuote: true, printWidth: 100)

8. Write README.md with:
   - One paragraph about what ERCraft is
   - Tech stack list
   - Getting started (clone, install, cp .env.example .env.local, npm run dev)
   - Feature checklist using checkboxes:
     - [ ] Player search
     - [ ] Match history
     - [ ] MMR prediction
     - [ ] Leaderboard
     - [ ] OAuth login
     - [ ] External API integration (pending)
   - A note: "Currently running on mock data — API integration in progress"

Stop here. Do not write any page UI or component logic.
Confirm with: "Day 1 complete — X files created, npm run dev is working."
```

---

## DAY 2 — Mock Data & First Two Pages

> 목표: 홈 검색 화면 + 프로필 페이지가 mock 데이터로 실제로 동작.
> 컴포넌트는 직접 스타일링할 부분 남겨두기 — 레이아웃 뼈대만 잡을 것.

```

Day 1 scaffolding is done. Now add mock data and wire up two pages.

--- PART A: Mock Data ---

Create src/mocks/ with these files.
All data must satisfy the TypeScript interfaces from src/types/ exactly.

players.ts — 3 PlayerSummary + PlayerStats objects
  Use realistic-looking Eternal Return nicknames and numbers.
  Vary the stats meaningfully (one high win rate, one low, one mid).

matches.ts — 10 MatchSummary objects spread across the 3 players
  Mix of wins and losses, different characters, different placements.

rankings.ts — 15 RankingEntry objects
  Cover at least 4 different tiers.


--- PART B: API Stub ---

Create src/api/client.ts — axios instance reading from VITE_API_BASE_URL.
Create src/api/player.ts with these functions:
  searchPlayers(nickname: string): Promise<ApiResult<PlayerSummary[]>>
  fetchPlayerStats(userNum: number): Promise<ApiResult<PlayerStats>>
  fetchMatchHistory(userNum: number, page: number): Promise<ApiResult<MatchSummary[]>>

Each function: if VITE_BSER_API_KEY is empty → return mock data.
Otherwise: axios call with a TODO comment for the real endpoint.

--- PART C: Hooks ---

Create these three hooks. Keep them thin — just TanStack Query wrappers.
  usePlayerStats(userNum: number)
  useMatchHistory(userNum: number)  ← useInfiniteQuery, 10 items per page
  useDebounce<T>(value: T, delay?: number)  ← 500ms default

--- PART D: HomePage ---

Build src/pages/HomePage.tsx.
Keep the layout simple — this page will be styled manually later.
Just get the structure right:

- Search input, debounced, tied to searchPlayers()
- Show results as a simple list when query is 2+ chars
- Each result: nickname + a "View profile" link to /player/:nickname
- If no results: plain "No players found" text
- No skeleton, no animation yet — that comes later

--- PART E: ProfilePage ---

Build src/pages/ProfilePage.tsx.
Read :nickname from the URL, find the matching mock player.

Layout (structure only, minimal styling):
- Top: nickname, level, tier
- Middle: win rate, KDA, total games — displayed as plain numbers
- Bottom: list of last 5 matches from mock data
  Each match: character name, placement, kills/deaths/assists, date

No virtualization yet — that's added when the real API returns real volume.
No skeleton yet.

--- Done ---

When finished:
- npm run dev must work
- Both pages must render real mock data
- No TypeScript errors
- Do not add any page the prompt didn't ask for

Output: list of files created or modified today only.
```
