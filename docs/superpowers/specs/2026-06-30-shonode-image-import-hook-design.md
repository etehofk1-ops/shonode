# 외부 생성 이미지 회수 import 훅 — 설계

- 날짜: 2026-06-30
- 대상: Shonode 앱(`shotboard-ai.js`, `script.js`) + shonode-mcp-server(`mcp/`)
- 상태: 승인됨(앱 + MCP 양측 구현)

## 문제

shonode-mcp-server의 `shonode_merge_results`는 생성된 **영상** 파일명만
`.shonode` JSON(`panel.videoFileName`)에 써넣는다. 생성된 **스틸 이미지**는
앱이 `.shonode` JSON이 아니라 브라우저 IndexedDB(`ShonodePanelImageStorage`,
`shonode-panel-image-db-v1`)에 저장하므로, MCP가 JSON만 고쳐서는 캔버스에
스틸이 뜨지 않는다. 즉 Codex(`codex-imagegen`)가 만든 PNG 파일을 `cut_id`
매핑으로 캔버스에 회수하는 경로가 통째로 비어 있다.

## 현재 구조 (확인된 사실)

- 캔버스 렌더링 소스는 `panel.image`(dataUrl). `script.js:863`.
- 이 dataUrl은 `.shonode`/localStorage에는 저장되지 않고(`serializePanelsForStorage`가
  `image:""`로 비움) 별도 IndexedDB에 `{id, image, fileName}` 레코드로 panel.id
  키로 저장된다. 로드 시 `initializePanelImageStorage()`가 다시 `panel.image`로
  hydrate. `script.js:657-734`.
- 이미지 1장 부착 정본 경로: `attachImageToPanel` → `updatePanel(id, {image, fileName})`
  → `persistPanels()`. `persistPanels()`가 localStorage 저장 + `queuePanelImagePersistence()`
  (IndexedDB 이미지 영속화)를 **둘 다** 트리거한다. `script.js:980-983`.
- MCP의 `buildPanel`/`mergeVideoResults`는 `image:""`만 쓴다. `mcp/lib/shonode.js`.
- 브라우저는 임의 디스크 경로를 직접 읽지 못한다. `server.js`는 점파일/ROOT_DIR
  밖을 차단하는 정적 서버로 파일읽기 엔드포인트가 없다(의도된 잠금). `server.js:85-127`.
  → 따라서 이미지 바이트는 **dataUrl 사이드카**로 앱에 들인다. PNG→base64 인코딩은
  디스크를 읽을 수 있는 MCP(Node)가 담당하고, 브라우저는 dataUrl만 받는다.

## 결정 — dataUrl 사이드카

이미지 회수 방식으로 "dataUrl 사이드카 매니페스트"를 채택. 서버/보안설정 변경 0,
`file://`·정적서버 모두 동작. (대안 — 멀티파일 선택 매칭, 서버 경로 자동읽기 —
는 각각 수동 다중선택 부담, 잠긴 server.js 완화에 따른 보안 회귀로 보류.)

## 매니페스트 포맷 — `shonode-image-manifest-v1`

독립 사이드카 `*.images.json`:

```json
{
  "version": "shonode-image-manifest-v1",
  "images": [
    { "cut_id": "panel-…", "dataUrl": "data:image/png;base64,…", "fileName": "panel-x.png" }
  ]
}
```

- `cut_id` = `panel.id`. MCP `export_prompt_batch`가 `cut_id`로 내보내고
  `mergeVideoResults`도 같은 키로 매칭하므로 계약이 일관됨.
- `dataUrl` 필수(`data:image/...` 형식). `fileName` 선택(표시용 라벨).
- 동일 `images` 배열을 풀 `.shonode` 안 `panelImages` 필드로 동봉하는 것도 허용
  → 파일 하나로 프로젝트 + 스틸 동시 회수. (단, MCP는 `.shonode`에 base64를 박지
  않고 항상 사이드카로 출력 — read_project 요약의 "no base64 dump" 원칙 보존.)

## 앱측 — `shotboard-ai.js`

신규 함수 `importPanelImageManifest(manifest, options)` (머지, 비파괴):

1. `Array.isArray(manifest.images)` 검증. 아니면 무시.
2. `byId = new Map(panels.map(p => [p.id, p]))`.
3. 각 엔트리: `cut_id`가 존재하고 `dataUrl`이 `data:image/`로 시작하는지 검증.
   - 미존재 cut_id → `missed`. 잘못된 dataUrl → `skipped`. 중복 cut_id → 마지막 우선.
4. 매칭 패널에 `image`, `fileName` 세팅 + 스틸이 보이도록 `viewMode:"image"` 전환.
5. `pushHistoryState()`(되돌리기 가능) → 일괄 적용 후 `persistPanels()` →
   `renderPanels()`. (영상이 있던 패널의 `videoFileName`은 건드리지 않음 —
   필드가 다름. viewMode만 image로 바꿔 스틸을 표시.)
6. 리포트 반환 `{applied, missed, skipped}` + `setStatus("스틸 N장 회수 (매칭 안 됨 M건)")`.
   빈 배열 → "회수할 이미지가 없습니다." 용량 초과는 `persistPanels`의 기존 경고로 처리.

UI 배선 — `handleImportWorkspaceInputChange`에서 JSON 파싱 직후, **파괴적
확인창을 띄우기 전에** 형태 감지:

- `version === "shonode-image-manifest-v1"` (또는 `images`만 있고 `panels` 없음)
  → `importPanelImageManifest` 머지 경로, 확인창 생략(추가 동작이므로).
- 일반 `.shonode` → 기존 `importWorkspaceSnapshot` 그대로. 적용 후 스냅샷에
  `panelImages` 배열이 있으면 이어서 `importPanelImageManifest`로 머지.

새 버튼 없이 기존 "가져오기" 입력 하나로 둘 다 수용. (전용 "이미지 회수" 메뉴
분리는 후속 옵션, 이번 범위 아님.)

## MCP측 — `mcp/lib/shonode.js` + `mcp/index.js`

- `buildImageManifest(results)` 신규: `image_file_name`/`image_path`/`dataUrl`을 가진
  결과로부터 `{version:"shonode-image-manifest-v1", images:[{cut_id, dataUrl, fileName}]}`
  생성. 파일 경로가 주어지면 PNG를 읽어 base64 dataUrl로 인코딩(MIME은 확장자 기준).
- `shonode_merge_results` 확장: 하나의 `results` 입력에서
  - `video_file_name` → 기존대로 `.shonode`(`videoFileName`)에 머지(`mergeVideoResults`).
  - 이미지 항목 → `buildImageManifest`로 사이드카 `<project>.images.json` 작성/갱신.
  - 이미지 경로는 `.shonode` 디렉터리 기준(또는 명시 `base_dir` 인자) 해석.
- 도구 응답에 `{video:{applied,missed}, images:{written, manifest_path}}` 형태로 보고.
- `mcp/README.md`의 "Known limitation" 갱신(이미지 분기 열림 명시).

## 검증

- 앱: preview로 앱 기동 → 1px 테스트 dataUrl 매니페스트를 import 입력 또는
  `importPanelImageManifest`로 주입 → 캔버스 표시 확인 + 새로고침 후 IndexedDB에서
  재표시 확인(스냅샷). 미매칭 cut_id 리포트 확인.
- MCP: `npm run smoke --prefix mcp` 흐름에 `buildImageManifest`/이미지 머지 단위
  점검 추가(임시 PNG → 매니페스트 dataUrl 라운드트립).

## 범위 밖(후속)

- 전용 "이미지 회수" UI 메뉴 분리.
- 멀티파일(파일명 매칭)·서버 경로 자동읽기 회수 경로.
- `.shonode`에 이미지 dataUrl 인라인 임베드(현재는 사이드카만).
