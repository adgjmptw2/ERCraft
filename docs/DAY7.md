# 7일차 — 돌아보기

---

프론트 API 레이어를 인터페이스로 가르고, 백엔드 body 파싱을 zod로 변경

**`EternalReturnClient` 인터페이스.** `src/api/erClient.ts`에 인터페이스 + `getClient()`, `erClient.mock.ts`에 `MockEternalReturnClient`, `erClient.real.ts`에 `RealEternalReturnClient`를 뒀다. mock은 기존 `loader` 함수를 그대로 위임만 하고, 없는 유저는 `throwApiError('PLAYER_NOT_FOUND', ...)`. real은 메서드마다 `throwApiError('NOT_IMPLEMENTED', '<methodName> is not implemented yet')`만 던지고, BSER 실연동은 이번에 건들지 않음

**인터페이스는 4 + 1.** 스펙에 적힌 `searchPlayers` / `fetchPlayerByNickname` / `fetchPlayerStats` / `fetchMatchHistory`만으로는 DTO 조립할 때 `PlayerStatsDTO.tier`를 얻을 길이 없어서 `fetchPlayerByUserNum(userNum)` 하나만 더 추가했다. 클라이언트는 그대로 순수 데이터만 반환.

**`src/api/player.ts` 리팩터.** 공개 함수 6개 시그니처랑 기존 테스트는 그대로 유지. 안에서는 `getClient()`로만 데이터를 가져오고 `ApiResult<T>` 래핑은 이 파일 한 곳에서만 한다. `source`는 `hasApiKey()`를 보고 `external | cache`. 인라인 `loader` 호출은 전부 뺐고, 이제 `loader`는 mock 클라이언트 안에서만 import

**백엔드 body 파싱 → zod.** `zod` + `fastify-type-provider-zod`를 추가. `createApp`에서 `setValidatorCompiler` / `setSerializerCompiler`를 걸고, 라우트는 `app.withTypeProvider<ZodTypeProvider>()`로 감싸서 `schema.body` / `schema.querystring`을 zod로 선언. 스키마는 `src/schemas.ts`에 몰아 뒀다. 기존 `Record<string, unknown>` 수동 파싱은 전부 삭제

**에러 코드 호환.** 에러 핸들러에서 `hasZodFastifySchemaValidationErrors`로 잡아 기존대로 **400 `INVALID_REQUEST`**로 내려 준다. `DUPLICATE_FAVORITE`(409), `UNAUTHORIZED`(401) 등 나머지 코드는 그대로. 6일차 테스트 6건은 변경 없이 통과.

**README.** 지금 동작하는 것만 남기고 백엔드 엔드포인트는 favorites / search-history 네 개만 적었다. `/api/players/*` 쪽은 미구현이라 뺌

**Postman collection.** `docs/ERCraft.postman_collection.json`에 위 네 엔드포인트. `{{base_url}}` = `http://localhost:3001`.

**테스트:** 프론트 22 + 백엔드 6 = 28건 통과
