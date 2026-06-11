# 1번 UI 복구 (GitHub에 본인 작업 없어도 됨)

본인이 push하지 않은 **1번 UI(카드형 전적)** 는 GitHub에 원래 없습니다.  
다른 Cursor 대화가 로컬을 **2번 UI(패배/승리 리스트, 홈 버튼)** 로 덮어쓴 상태입니다.

이 저장소에 **2번 → 1번 변환 패치**를 포함해 두었습니다.  
(GitHub에서 찾는 게 아니라, **프로젝트 폴더 안 `patches/`** 에 있습니다.)

## PowerShell (Desktop ERCraft-main)

```powershell
cd "C:\Users\MINE\Desktop\Study\ERCraft-main"
node scripts/apply-records-ui-patch.mjs
npm install
npm run dev
```

## 1번 UI 확인

| 확인 | 1번 (원하는) | 2번 (옛 UI) |
|------|-------------|-------------|
| 헤더 | 검색창 | **홈** 버튼 |
| 매치 | 아이템 8칸 카드 | **패배/승리** 리스트 |
| MatchRow.tsx | **700줄+** | ~72줄 |
| dev 화면 우하단 | `records-v2-20260611` | 없음 |

## 본인 원본 파일 복구 (가능하면)

Cursor / VS Code → 파일 우클릭 → **Timeline(로컬 기록)**  
`MatchRow.tsx`, `ProfileRecordsSidebar.tsx` 등에서 덮어쓰기 전 버전 찾기

## 패치 수동 적용

```powershell
git apply --3way patches/restore-records-ui-v2.patch
```

충돌 시 `*.rej` 파일 확인 후 수동 병합.
