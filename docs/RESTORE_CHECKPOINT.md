# UI 복구 가이드 — 1번(원하는 화면) vs 2번(되돌아간 화면)

## 어떤 상태인지

| | **1번 (원하는 UI)** | **2번 (옛 UI)** |
|---|---|---|
| 헤더 | 검색창 + 랭킹 | **홈** + 랭킹 |
| 최근 매치 | 가로 카드, TK/K/A, **아이템 8칸**, 딜량·RP·등급·팀운 | **패배/승리** 텍스트, KDA 한 줄, **상세 →** |
| 좌측 | S11·티어, RP 차트, **핵심 요약** | **51% 승률 바**, 옛 스탯 그리드 |
| `MatchRow.tsx` | **약 790줄** | **약 72줄** |

## GitHub에 1번이 있는지

**있습니다.** Cloud Agent가 `5f02fe6` 커밋으로 올려 두었습니다.  
직접 push 안 하셔도 GitHub `main`에 1번 UI 코드가 들어 있습니다.

- **1번 UI 커밋:** `5f02fe6` (`Cursor: Apply local changes for cloud agent`)
- **최신 main:** `e489e24` (1번 + 이후 소규모 수정)

다른 Cursor 대화창이 **로컬만** `94a1130`(2번)으로 되돌린 것으로 보입니다.

## 로컬 복구 (PowerShell) — 반드시 이 순서

```powershell
cd "C:\Users\MINE\Desktop\Study\ERCraft-main"

# 1) 저장 안 한 수정 버리기 (중요)
git status

# 2) GitHub에서 1번 UI 받기
git fetch origin
git checkout main
git reset --hard origin/main

# 3) 확인 — MatchRow.tsx가 790줄 근처여야 함
(Get-Content src\components\player\MatchRow.tsx).Count
Select-String src\components\shared\AppShell.tsx -Pattern "HeaderPlayerSearch"
Select-String src\components\player\MatchRow.tsx -Pattern "MatchRecordRow"

# 4) dev 서버 재시작
npm install
npm run dev
```

브라우저 **Ctrl+Shift+R** 강력 새로고침.

### 복구 성공 기준

- `MatchRow.tsx` **700줄 이상**
- `AppShell.tsx`에 `HeaderPlayerSearch` 있음 (**홈** 없음)
- `MatchRow.tsx`에 `MatchRecordRow` 있음
- 화면에 **패배/승리** 한 줄 리스트가 아니라 **아이템 칸 있는 매치 카드**

## 그래도 2번이면

1. 폴더 경로 확인: `ERCraft-main` 맞는지
2. `git log -1 --oneline` 결과를 확인 (`e489e24` 또는 `f43363e` / `5f02fe6` 이어야 함)
3. Cursor에서 **다른 브랜치** 열고 있는지 (`git branch`)
4. 터미널 dev 서버 끄고 다시 `npm run dev`

## 1번 UI 태그

```powershell
git checkout restore/conversation-2026-06-11
# 또는
git reset --hard 5f02fe6
```
