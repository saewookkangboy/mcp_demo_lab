# MCP Demo Lab

MCP(Model Context Protocol)의 핵심 흐름을 프런트엔드 결과로 확인하는 **교육용 가상 프로젝트 5개**입니다. 외부 API, 비밀키, 데이터베이스 없이 Node.js 20 이상만 있으면 실행됩니다. 모든 인물·회사·금액·문서는 가상 데이터입니다.

## 전체 시연 시작

운영자가 미리 실행해 둔 주소를 브라우저에서 연 뒤 `전체 시연 시작`을 누릅니다. 강사와 수강생은 시연 중 CLI나 터미널을 사용하지 않습니다.

```text
홈 화면
  → 전체 시연 시작
  → 좌측에서 5개 데모 선택
  → 기본 입력 실행
  → MCP 실행 과정 확인
  → Harness 적용 전후 비교
  → 화면 검증
```

전체 시연 화면에서는 다음 기능을 한 창에서 사용할 수 있습니다.

- 5개 데모 순서 이동
- 전체 데모 공통 Harness 적용·미적용 선택
- 기본 입력 자동 실행
- MCP 5단계 실행 기록 확인
- 실행 기록과 결과의 화면 검증
- 외부 MCP 연결 구조 시연

## 운영자 최초 준비

아래 명령은 강의 전에 운영자가 서버를 한 번 준비할 때만 사용합니다. 수강생 시연 과정에는 필요하지 않습니다.

```bash
git clone <YOUR_REPOSITORY_URL>
cd mcp-demo-lab
npm run verify
npm run dev
```

브라우저에서 `http://localhost:4173`을 엽니다. 패키지 설치는 필요하지 않습니다.

기본 mock 데모는 오프라인으로 동작합니다. 대화형 검색 하단의 `실제 MCP 호출`은 인터넷 연결이 있을 때 공식 MCP 문서 서버에 Streamable HTTP로 연결합니다.

## 프로젝트 구성

| 순서 | 난이도 | 프로젝트 | 핵심 MCP 개념 | 테스트 초점 |
|---:|---|---|---|---|
| 01 | 강사 시연 | 회의록 작성 | 텍스트 → 구조화 결과 | 필수 입력, 실행 항목 완전성 |
| 02 | 강사 시연 | 견적서 작성 | 인자 전달, 결정적 계산 | 세금·합계, 수량 경계값 |
| 03 | 초급 | 설계도 제작 | 입력 스키마, SVG 산출물 | 정상·경계·오류값 |
| 04 | 중급 | 대화형 검색 | 검색 근거, 대화 이력 | citation, 결과 없음, 후속 질문 |
| 05 | 고급 | 데이터 기반 메모리 | 이벤트 로그, 최신 상태 | 충돌, 추적성, 세션 격리 |

## Harness 적용 전후 비교

모든 데모에는 기본값 `Harness 적용` 토글이 있습니다. 토글을 끄고 한 번, 켜고 한 번 실행하면 미적용·적용의 마지막 결과가 비교 카드에 각각 남습니다.

```text
미적용: 입력 → MCP → 미검증 결과
적용: 입력 사전검증 → 도구 allowlist → MCP → 출력 계약 → 증거 JSON
```

자세한 수강생 시연 순서와 프로젝트별 결과 계약은 [Harness 적용 전후 비교 가이드](docs/HARNESS_COMPARISON_GUIDE.md)를 참고하세요.

## MCP 흐름

```text
브라우저 폼
  → Mock MCP Client: connect / listTools / callTool
  → Mock MCP Server: initialize / tools/list / tools/call
  → 프로젝트 도구 로직
  → JSON 결과
  → FE 카드·SVG·대화·타임라인
```

`shared/mcp/`는 프로토콜 학습을 위한 최소 대역입니다. 실제 MCP SDK나 네트워크 전송을 구현한 production server가 아닙니다. 프로젝트별 `src/server.js`를 실제 SDK의 tool handler로 교체해도 `main.js`가 받는 JSON 계약은 유지할 수 있게 분리했습니다.

## 수강생 시연 화면

각 프로젝트에서 실행 버튼을 누르면 결과와 함께 공통 **MCP 실행 과정** 패널이 표시됩니다.

```text
01 Client 연결 및 초기화 — initialize
02 사용 가능한 도구 조회 — tools/list
03 도구 호출 요청 — tools/call
04 도구 결과 반환 — result 또는 error
05 프런트엔드 렌더링 — render
```

- `교육용 MOCK MCP` 배지는 실제 외부 MCP 연결과 혼동하지 않도록 항상 표시됩니다.
- 각 단계의 `요청 JSON 보기`, `응답 JSON 보기`를 열어 전달된 인자와 결과를 설명할 수 있습니다.
- 정상 단계는 초록색, 도구 오류는 빨간색으로 표시됩니다.
- `실행 초기화`는 화면 결과와 실행 기록을 초기 상태로 되돌립니다.
- 검색과 메모리 프로젝트는 초기화 전까지 여러 번의 MCP 호출 기록을 실행 번호와 함께 누적합니다.
- 패널 하단의 `화면 검증 실행`으로 5단계 흐름과 결과 표시를 즉시 확인할 수 있습니다.

### 권장 시연 순서

1. 입력 데이터와 호출할 도구를 설명합니다.
2. 실행 버튼을 누르고 01~05 단계를 차례로 펼쳐 봅니다.
3. `tools/call`의 입력과 `tool/result`의 반환 JSON을 비교합니다.
4. 프런트엔드가 결과 JSON 중 어떤 값을 화면에 사용했는지 확인합니다.
5. 잘못된 입력을 실행해 빨간 오류 단계와 사용자 안내를 확인합니다.
6. 패널 하단의 `화면 검증 실행`을 눌러 시연 결과를 확인합니다.

## 개발자용 자동 테스트

```bash
# 전체 학습자 테스트
npm test

# 파일 구조까지 포함한 최종 검증
npm run verify

# 한 프로젝트만 실행
node --test projects/04-intermediate-conversational-search/tests/app.test.js
```

이 절은 저장소를 수정하는 개발자용입니다. 일반 강의 시연에서는 전체 시연 화면의 `화면 검증`을 사용합니다. 테스트 이름은 사용자의 기대 행동을 먼저 읽도록 작성했습니다.

## 폴더 구조

```text
mcp-demo-lab/
├── index.html
├── package.json
├── scripts/
│   ├── dev-server.mjs
│   └── smoke.mjs
├── shared/
│   ├── mcp/
│   │   ├── mock-mcp-client.js
│   │   └── mock-mcp-server.js
│   └── ui/styles.css
└── projects/
    ├── 01-instructor-meeting-notes/
    ├── 02-instructor-quote/
    ├── 03-beginner-blueprint/
    ├── 04-intermediate-conversational-search/
    └── 05-advanced-memory/
        ├── README.md
        ├── index.html
        ├── main.js
        ├── src/server.js
        └── tests/app.test.js
```

## 강사 운영 순서

1. 루트 화면에서 `전체 시연 시작`을 누르고 5개 난이도를 소개합니다.
2. 01에서 입력 하나가 구조화 결과로 바뀌는 장면을 시연합니다.
3. 02에서 입력 검증과 금액 테스트를 보여줍니다.
4. 학습자는 03의 출입문 위치 확장 실습을 수행합니다.
5. 04에서 근거 없는 답을 만들지 않는 테스트를 확인합니다.
6. 05에서 과거 사건의 지연 도착과 세션 격리를 검증합니다.

## 공통 실패·검증 체크리스트

- [ ] `npm run verify`가 종료 코드 0으로 끝난다.
- [ ] 루트 페이지에서 프로젝트 카드가 정확히 5개 보인다.
- [ ] 모든 프로젝트에 README, FE, mock server, 실행 가능한 테스트가 있다.
- [ ] 오류 입력을 조용히 보정하지 않고 이해 가능한 오류로 거부한다.
- [ ] 검색 결과에는 근거가 있고, 없으면 없다고 답한다.
- [ ] 메모리에는 값뿐 아니라 시간과 출처가 남는다.
- [ ] 실제 고객 데이터·개인정보·비밀키가 포함되지 않는다.

## 실제 MCP로 교체할 때

1. 공식 SDK로 stdio 또는 HTTP transport를 구성합니다.
2. `src/server.js`의 도구 이름과 입력·출력 계약을 유지해 handler를 옮깁니다.
3. FE가 MCP server에 직접 접근하지 않도록 백엔드 Client/API 계층을 둡니다.
4. 쓰기 도구에는 사용자 인증, 권한, 승인, 감사 로그를 추가합니다.
5. mock 계약 테스트와 실제 server 통합 테스트를 분리합니다.

조사된 오픈소스 서버, 프로젝트별 연결 명령, 샘플 데이터와 안전 기준은 [실제 오픈소스 MCP 확장 가이드](docs/OSS_MCP_EXTENSION_GUIDE.md)를 참고하세요. `mcp.config.example.json`에는 Filesystem·Memory·Git·Playwright·공식 Docs MCP의 시작 설정이 포함되어 있습니다.

## 라이선스

MIT
