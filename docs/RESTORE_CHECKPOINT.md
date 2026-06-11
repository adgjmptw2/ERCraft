# 복구 체크포인트 (이 대화 작업)

**커밋:** `f43363e` — `fix: TK/K/A 슬래시 정렬 및 프로필 전적 갱신 버튼 추가`

**태그:** `restore/conversation-2026-06-11`

## 이 체크포인트에 포함된 기능

- [ ] 헤더: `홈` 제거, `HeaderPlayerSearch` 검색창
- [ ] `SeasonHistoryGrid` 모바일 버튼 축소
- [ ] `ProfileHero` 패딩·폰트 축소, **전적 갱신** 버튼
- [ ] 분석 탭: 캐릭터 선택 시 6축·통계 전환 (`characterScopedAnalysis`)
- [ ] 승률 표시 수정 (`analysisTabViewModel`)
- [ ] 펠릭스 등 캐릭터 이미지 fallback (`CharacterAvatar`)
- [ ] TK/K/A `/` 구분, 15px 동일 크기 (`MatchStatSlashGrid`)

## 로컬 복구 (PowerShell)

```powershell
cd "C:\Users\MINE\Desktop\Study\ERCraft-main"
git fetch origin
git checkout main
git reset --hard f43363e
npm install
npm run dev
```

## 복구 확인

```powershell
git log -1 --oneline
# f43363e fix: TK/K/A 슬래시 정렬 및 프로필 전적 갱신 버튼 추가

Select-String -Path src\components\shared\AppShell.tsx -Pattern "HeaderPlayerSearch"
Select-String -Path src\components\profile\ProfileHero.tsx -Pattern "전적 갱신"
```

`HeaderPlayerSearch`, `전적 갱신`이 검색되면 코드는 복구된 상태입니다.
