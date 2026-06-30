# Layer 2 — `shonode_generate_storyboard` (MCP AI 디렉터) 설계

- 날짜: 2026-06-30
- 대상: shonode-mcp-server(`mcp/`)
- 상태: 승인됨(설계대로, 분기점 기본값 확정)

## 문제 / 목표

현재 MCP는 "프롬프트 생성 + 핸드오프"까지만 하고 모델을 직접 호출하지 않는다.
`shonode_create_project`는 사람이 cuts를 전부 넘겨야 한다. 앱의 "AI 디렉터"
(`ai-client.js`)는 브리프를 Gemini로 보내 스토리보드 플랜(projectDraft + cuts)을
생성하지만, 그 지능은 브라우저 클라이언트에만 있다.

Layer 2 = MCP에 `shonode_generate_storyboard` 툴을 추가해 **브리프 → Gemini →
`.shonode`** 단계를 서버측에서 연다. 이후 `export_prompt_batch` → Codex →
`merge_results`(영상/이미지) 흐름으로 자연히 이어진다. 이미지 모델 호출은 여전히
Codex에 위임한다(Layer 2는 Gemini 텍스트 생성만 호출).

## 현재 사실 (확인됨)

- `storyboard-proxy.js`는 얇은 포워더: `{model, request:{contents, generationConfig}}`를
  받아 `generativelanguage.googleapis.com/v1beta/models/<model>:generateContent`로
  넘기고 원응답 반환. 키는 서버 env `GEMINI_API_KEY`. 지능 없음.
- `ai-client.js`의 지능:
  - `buildPrompt(payload)`: 브리프 + 프로젝트 컨텍스트 + (레퍼런스 카탈로그)를 큰 영어
    시스템 프롬프트로. 컷 수 추론·한국어 메타·영어 프롬프트 규칙.
  - `buildRequest`: `{contents:[{role:user, parts:[{text},…inlineData]}],
    generationConfig:{responseMimeType:"application/json", responseJsonSchema:<컷 스키마>}}`.
  - `mapResponse`: Gemini candidate 텍스트 JSON → `{summary, projectDraft, cuts[]}`.
  - Gemini 컷 필드: `sceneTitle, durationLabel, caption, referenceImageIndex(es),
    imagePromptMode, i2iPrompt, t2iPrompt, i2vStartPrompt, i2vMotionPrompt, i2vEndPrompt`.
- `lib/shonode.js`의 `buildPanel`은 **이미 camelCase를 수용**한다:
  `sceneTitle`, `durationLabel`, `imagePromptMode`, `t2iPrompt`, `i2vStartPrompt/Motion/End`를
  직접 읽음. `buildProject`는 `{title,sequence,runtime,tone,aspectRatio,logline,notes}` 수용.
  `buildSnapshot({project,panels})`로 임포트 가능한 스냅샷 완성. → Gemini 컷 매핑이 단순.

## 결정 (분기점 기본값)

1. **Gemini 직접 호출**(MCP가 키 보유). stdio MCP라 서버 불필요. 키 출처:
   `process.env.GEMINI_API_KEY` 우선, 없으면 프로젝트 루트 `.env`(이미 키 존재)를 읽어 폴백.
   둘 다 없으면 명확한 에러. (대안 — 실행 중 server.js 프록시 POST — 서버 의존이라 보류.)
2. **텍스트 브리프 전용 MVP.** 레퍼런스 이미지 인라인(i2i)은 범위 밖(후속). T2I/I2V 프롬프트 생성.
3. **새 `.shonode` 생성**(out_path). "선택 컷만 재생성" 분기는 후속.

## 컴포넌트 (경계 명확·테스트 가능)

- **`mcp/lib/director.js`** (순수, fetch 없음 → 단위 테스트):
  - `buildDirectorPrompt(brief, ctx)` — `ai-client.js` buildPrompt 이식(텍스트 전용;
    레퍼런스 카탈로그 줄은 "(none)"로). `ctx` = {title, sequence, runtime, tone,
    aspectRatio, logline, notes, currentPanelCount}.
  - `buildDirectorRequest(brief, ctx)` — `{contents, generationConfig{responseMimeType,
    responseJsonSchema}}`. responseJsonSchema는 ai-client.js의 컷 스키마 이식.
  - `mapDirectorResponse(geminiJson)` — candidate 텍스트 JSON 파싱 → `{summary,
    projectDraft, cuts[]}`. 각 cut: `imagePromptMode`('t2i'|'i2i'), 활성 이미지 프롬프트를
    `t2iPrompt`로 정규화(i2i면 i2iPrompt 사용 — buildPanel이 t2iPrompt만 읽으므로),
    i2v 필드 통과, sceneTitle/durationLabel/caption 통과. (referenceImageIndexes는
    텍스트 MVP에선 무시.)
  - 파싱 실패/빈 cuts → 던지거나 빈 배열 명확 처리.
- **`mcp/lib/gemini.js`** (유일한 impure):
  - `resolveGeminiKey()` — env → 프로젝트 `.env` 폴백.
  - `callGemini(model, request, apiKey)` — generateContent 직접 POST, 원 JSON 반환,
    HTTP 에러는 의미 있는 메시지로.
- **`mcp/index.js`**: `shonode_generate_storyboard` 등록.
  - args: `brief`(필수), `title?`, `aspect_ratio?`(기본 16:9), `tone?`,`runtime?`,
    `logline?`,`notes?`,`sequence?`(프로젝트 컨텍스트), `model?`(기본 gemini-2.5-flash),
    `out_path?`.
  - 흐름: 키 해석 → `buildDirectorRequest(brief, ctx)` → `callGemini` →
    `mapDirectorResponse` → projectDraft를 `buildProject`(+aspect_ratio 우선)·cuts를
    `buildPanel`·`buildSnapshot`로 스냅샷 조립 → out_path면 파일 쓰기 →
    `{summary, panelCount, out_path?}`(out_path 없으면 스냅샷 JSON 텍스트).
  - 키 없음 → `fail("GEMINI_API_KEY가 없습니다. env나 프로젝트 .env에 설정하세요.")`.

## 데이터 흐름

```
brief + ctx
  → buildDirectorRequest  (lib/director.js, 순수)
  → callGemini            (lib/gemini.js, fetch)
  → mapDirectorResponse   (lib/director.js, 순수) → {summary, projectDraft, cuts}
  → buildProject + buildPanel + buildSnapshot (lib/shonode.js 재사용)
  → .shonode (out_path) → 이후 export_prompt_batch → Codex → merge_results
```

## 에러 처리

- 키 없음 → 명확한 fail 메시지(어디에 키 넣는지 안내).
- Gemini HTTP 4xx/5xx → 상태코드+본문 일부를 fail로.
- candidate 텍스트 없음/JSON 파싱 실패 → fail.
- cuts 0개 → summary는 반환하되 panelCount 0, 경고성 메시지.

## 테스트

- **smoke (순수부, 키 불필요)**: `buildDirectorRequest`(responseMimeType=json,
  responseJsonSchema에 cuts/projectDraft 존재, 프롬프트 텍스트에 브리프·컨텍스트 포함),
  `mapDirectorResponse`(녹화한 Gemini 응답 픽스처 → summary/projectDraft/cuts,
  i2i 컷의 t2iPrompt 정규화 확인), 그리고 cuts→buildPanel→buildSnapshot가 유효
  `.shonode`(version·panels) 산출.
- **라이브 통합(선택, 키 있을 때만)**: 실제 brief로 `callGemini` 1회 → cuts ≥1 +
  유효 스냅샷. 키 없으면 skip(로그). stdio e2e로 툴 호출까지 점검(키 있을 때).

## 경계 갱신 (문서/코드)

`mcp/README.md`: "Layer 1=핸드오프(모델 미호출) / Layer 2=`generate_storyboard`만
Gemini **텍스트** 호출(이미지 모델은 여전히 Codex 위임)". 툴 표에 행 추가 + 새 툴 설명 +
`GEMINI_API_KEY` 요건. index.js 상단 주석의 툴 목록·경계 문구 갱신.

## 범위 밖(후속)

- 레퍼런스 이미지 인라인(i2i) 디렉팅.
- "선택 컷만 재생성"(기존 .shonode 부분 갱신).
- 프록시 경유 옵션.
- Layer 2를 통한 영상/이미지 실제 생성(이미지 모델은 Codex 위임 유지).
