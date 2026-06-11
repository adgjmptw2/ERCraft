# 정적 에셋 (Fankit → public/assets)

## 경로 구조

```
public/assets/
  manifest.json
  brand/                    # 로고
  characters/
    {characterNum}.webp     # 기본 미니 초상화 (리스트 UI)
    {characterNum}/
      mini-{skin}.webp
      half-{skin}.webp
      full-{skin}.webp
      skills/{key}.webp
  skins/
    {skinCode}.webp         # skinCode = 1000000 + characterNum*1000 + skinIndex
  tiers/
    {slug}.webp             # iron, gold, mithril …
  items/
    {category}/.../{slug}.webp
  loadout/
    {category}/.../{slug}.webp
```

- **캐릭터 키**: BSER Open API `characterNum` (fankit 폴더 번호와 다를 수 있음 → 이름으로 매핑)
- **스킨 키**: API `skinCode` (`scripts/bser-character-ids.mjs` 참고)
- **아이템/로드아웃**: Fankit slug 기반 (`items/{slug}.webp`, `loadout/{slug}.webp`)
- **itemCode**: Open API 코드와 Fankit slug는 1:1이 아님 → `src/assets/itemAssetMap.ts`에 검증된 매핑만 추가

## Fankit 일괄 import

```bash
# 기본 경로: D:\er\Eternal Return Fankit
npm run assets:import-fankit

# 경로 지정
$env:FANKIT_ROOT="D:\er\Eternal Return Fankit"; npm run assets:import-fankit
```

## 수동 추가 (캐릭터만)

1. `raw-assets/characters/19.png`
2. `npm run assets:characters`

## 프론트 URL

- `VITE_ASSET_BASE_URL` 비어 있으면 `/assets/...`
- CDN: `VITE_ASSET_BASE_URL=https://assets.example`
- 브라우저는 `public/assets` 전체를 한 번에 받지 않음 — 화면에서 참조된 webp만 요청
- UI는 기본적으로 `characters/{characterNum}.webp`, `tiers/{slug}.webp`만 사용
- `full`/`half`/`skills`/`skins`/`items`/`loadout`은 기능 연결 전까지 UI에서 일괄 로드하지 않음
- `manifest.json`은 import 결과 목록용 — 렌더링 중 fetch/preload 하지 않음
- 아이템·특성(로드아웃) 아이콘은 `ItemIcon` / `TraitIcon` / `LoadoutIcon` — 화면에 필요한 slug만 lazy 로드
- `VERIFIED_*_SLUGS`에 없는 slug는 아이콘을 표시하지 않고 빈 슬롯·텍스트 fallback
- itemCode → slug 매핑은 공식 메타 검증 후 `ITEM_CODE_TO_SLUG`에만 추가 — 추측·이름 기반 매핑 금지
- 잘못된 아이콘보다 fallback이 우선
- Fankit 폴더 번호 ≠ Open API `characterNum` → `scripts/bser-character-ids.mjs` 기준
- raw 원본(`raw-assets/`)은 Git에 넣지 않음

이미지 저작권·Fankit 이용 정책은 Nimble Neuron IP 가이드를 확인하세요.
