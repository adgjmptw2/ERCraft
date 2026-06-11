/**
 * BSER Open API characterNum (OpenAPI_KR_20260504 l10n 기준)
 * fankit 폴더 번호(001~)와 다를 수 있어 이름 매칭을 우선한다.
 */
export const CHARACTER_NUM_TO_NAME = {
  1: 'Jackie',
  2: 'Aya',
  3: 'Fiora',
  4: 'Magnus',
  5: 'Zahir',
  6: 'Nadine',
  7: 'Hyunwoo',
  8: 'Hart',
  9: 'Isol',
  10: 'Li Dailin',
  11: 'Yuki',
  12: 'Hyejin',
  13: 'Xiukai',
  14: 'Chiara',
  15: 'Sissela',
  16: 'Silvia',
  17: 'Adriana',
  18: 'Shoichi',
  19: 'Emma',
  20: 'Lennox',
  21: 'Rozzi',
  22: 'Luke',
  23: 'Cathy',
  24: 'Adela',
  25: 'Bernice',
  26: 'Barbara',
  27: 'Alex',
  28: 'Sua',
  29: 'Leon',
  30: 'Eleven',
  31: 'Rio',
  32: 'William',
  33: 'Nicky',
  34: 'Nathapon',
  35: 'Jan',
  36: 'Eva',
  37: 'Daniel',
  38: 'Jenny',
  39: 'Camilo',
  40: 'Chloe',
  41: 'Johann',
  42: 'Bianca',
  43: 'Celine',
  44: 'Echion',
  45: 'Mai',
  46: 'Aiden',
  47: 'Laura',
  48: 'Tia',
  49: 'Felix',
  50: 'Elena',
  51: 'Priya',
  52: 'Adina',
  53: 'Markus',
  54: 'Karla',
  55: 'Estelle',
  56: 'Piolo',
  57: 'Martina',
  58: 'Hayes',
  59: 'Isaac',
  60: 'Tazia',
  61: 'Irene',
  62: 'Theodore',
  63: 'Ian',
  64: 'Vanya',
  65: 'Debi & Marlene',
  66: 'Arda',
  67: 'Abigail',
  68: 'Alonso',
  69: 'Lenny',
  70: 'Tsubame',
  71: 'Kenneth',
  72: 'Katja',
  73: 'Charlotte',
  74: 'Darko',
  75: 'Lenore',
  76: 'Garnet',
  77: 'Yumin',
  78: 'Hisui',
  79: 'Justyna',
  80: 'Istvan',
  81: 'Nia',
  82: 'Shurin',
  83: 'Henry',
  84: 'Blair',
  85: 'Mirka',
  86: 'Fenrir',
  87: 'Coraline',
  88: 'Bihyung',
  89: 'Craver',
}

/** fankit 폴더명 → API 표준명 */
export const FANKIT_NAME_ALIASES = {
  fiora: 'Fiora',
  fiona: 'Fiora',
  bernice: 'Bernice',
  haze: 'Hayes',
  irem: 'Irene',
  'ly anh': 'Ian',
  leni: 'Lenny',
  niah: 'Nia',
  craver: 'Craver',
  bihyung: 'Bihyung',
  xiukai: 'Xiukai',
  shoichi: 'Shoichi',
  xuelin: 'Shurin',
}

export function normalizeLookupKey(name) {
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
}

/** dak.gg/mock의 characterName(영문) → Open API characterNum */
export function resolveCharacterNumByName(characterName) {
  if (!characterName?.trim()) return null
  const key = normalizeLookupKey(characterName)
  const canonical = FANKIT_NAME_ALIASES[key] ?? characterName.trim()

  for (const [num, en] of Object.entries(CHARACTER_NUM_TO_NAME)) {
    if (normalizeLookupKey(en) === normalizeLookupKey(canonical)) {
      return Number(num)
    }
  }
  return null
}

export function resolveCharacterNum(fankitFolderName) {
  const m = fankitFolderName.match(/^(\d+)\.\s*(.+)$/)
  if (!m) return null

  const fankitNum = Number(m[1])
  if (fankitNum >= 998) return null

  const rawName = m[2].replace(/\s*-\s*.+$/, '').trim()
  const key = normalizeLookupKey(rawName)
  const canonical = FANKIT_NAME_ALIASES[key] ?? rawName

  for (const [num, en] of Object.entries(CHARACTER_NUM_TO_NAME)) {
    if (normalizeLookupKey(en) === normalizeLookupKey(canonical)) {
      return Number(num)
    }
  }

  if (fankitNum >= 1 && fankitNum <= 200) return fankitNum
  return null
}

/** API skinCode = 1_000_000 + characterNum * 1000 + skinIndex */
export function skinCode(characterNum, skinIndex) {
  return 1_000_000 + characterNum * 1000 + skinIndex
}
