# RESTORE_LOCAL_UI.md

# 1번 UI 복구

**패치(`git apply`)는 로컬 파일이 다르면 실패하거나 옛 UI가 그대로 남습니다.**  
→ 아래 **강제 checkout** 을 쓰세요.

## Git Bash (권장)

```bash
cd "/c/Users/MINE/Desktop/Study/ERCraft-main"
git fetch origin cursor/cloud-agent-1781159192012-5f23r
git checkout origin/cursor/cloud-agent-1781159192012-5f23r -- src/
```

또는:

```bash
bash scripts/checkout-ui-v1.sh
```

## cmd (Node/PowerShell 실행 정책 상관없음)

```cmd
cd /d "C:\Users\MINE\Desktop\Study\ERCraft-main"
restore-ui-v1.cmd
npm.cmd run dev
```

## 1번 UI 맞는지 확인

| 확인 | 1번 |
|------|-----|
| `MatchRow.tsx` | **700줄+** (에디터에서 열어보기) |
| 헤더 | **검색창** (홈 버튼 없음) |
| 매치 | **카드형** (패배/승리 한 줄 리스트 아님) |
| dev 우하단 | `records-v2-20260611` |

dev 서버 **재시작** + browser **Ctrl+Shift+R** 필수.

## 스크립트 파일 받기

```bash
git fetch origin cursor/cloud-agent-1781159192012-5f23r
git checkout origin/cursor/cloud-agent-1781159192012-5f23r -- restore-ui-v1.cmd scripts/checkout-ui-v1.sh
```
