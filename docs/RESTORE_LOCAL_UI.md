# 1번 UI 복구 (GitHub에 본인 작업 없어도 됨)

본인이 push하지 않은 **1번 UI(카드형 전적)** 는 GitHub에 원래 없습니다.  
다른 Cursor 대화가 로컬을 **2번 UI(패배/승리 리스트, 홈 버튼)** 로 덮어쓴 상태입니다.

이 저장소에 **2번 → 1번 변환 패치**를 포함해 두었습니다.  
(GitHub에서 찾는 게 아니라, **프로젝트 폴더 안 `patches/`** 에 있습니다.)

## Windows (Desktop ERCraft-main)

PowerShell에서 `npm`이 **디지털 서명** 오류로 막히거나, Git Bash에서 **`node: command not found`** 가 나오면 아래를 쓰세요.

### 1단계 — 패치 적용 (Node.js 불필요, Git만 있으면 됨)

**Git Bash (MINGW64):**

```bash
cd "/c/Users/MINE/Desktop/Study/ERCraft-main"
bash scripts/apply-records-ui-patch.sh
```

또는 한 줄:

```bash
git apply --3way patches/restore-records-ui-v2.patch
```

**cmd:**

```cmd
cd /d "C:\Users\MINE\Desktop\Study\ERCraft-main"
restore-ui.cmd
```

(`restore-ui.cmd`는 `git apply`만 실행. Node 없으면 패치 후 종료)

### 2단계 — dev 서버 (Node.js 필요)

Git Bash PATH에 `node`가 없을 수 있습니다. **cmd** 또는 **PowerShell**에서:

```cmd
cd /d "C:\Users\MINE\Desktop\Study\ERCraft-main"
npm.cmd run dev
```

Node 설치 확인:

```cmd
where node
where npm
```

없으면 https://nodejs.org LTS 설치 후 터미널을 다시 여세요.

### 패치 파일만 받기

```bash
git fetch origin cursor/cloud-agent-1781159192012-5f23r
git checkout origin/cursor/cloud-agent-1781159192012-5f23r -- patches scripts/apply-records-ui-patch.sh restore-ui.cmd
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
