# 실제 오픈소스 MCP 확장 가이드

이 문서는 mock 데모에서 실제 MCP로 한 단계 확장하기 위한 강사·학습자용 가이드입니다. 기본 수업은 mock으로 완료할 수 있고, 네트워크·도구 설치가 가능한 환경에서만 OSS 확장을 진행합니다.

## 확인한 오픈소스 MCP

| 서버 | 적용 데모 | 실행 방식 | 라이선스 | 공식 소스 |
|---|---|---|---|---|
| Filesystem MCP | 회의록 | `npx` / stdio | MIT | [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem) |
| Git MCP | 견적서 | `uvx` / stdio | 저장소 Apache-2.0·기존 코드 MIT | [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers/tree/main/src/git) |
| Playwright MCP | 설계도 | `npx` / stdio 또는 HTTP | Apache-2.0 | [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp) |
| Fetch MCP | 대화형 검색 확장 | `uvx` / stdio | MIT | [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers/tree/main/src/fetch) |
| Memory MCP | 메모리 | `npx` / stdio | 저장소 Apache-2.0·기존 코드 MIT | [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers/tree/main/src/memory) |
| GitHub MCP Server | 저장소 제출·리뷰 | Docker/Go 또는 원격 HTTP | MIT | [github/github-mcp-server](https://github.com/github/github-mcp-server) |

## 바로 체험하는 실제 원격 MCP

대화형 검색 데모 하단의 `실제 MCP 호출` 버튼은 `https://modelcontextprotocol.io/mcp`에 연결합니다.

```text
Browser
  → 이 저장소의 /api/oss-mcp/docs-search
  → initialize
  → tools/list
  → search_model_context_protocol
  → 공식 문서 결과와 링크
```

외부 endpoint는 코드에 고정되어 있으며 사용자가 임의 URL을 전달할 수 없습니다. 인증·토큰·쓰기 도구를 사용하지 않고, 결과는 브라우저에서 untrusted text로 escape합니다.

## 로컬 OSS 서버 연결

`mcp.config.example.json`을 사용하는 MCP Host의 설정 형식에 맞게 복사합니다. Filesystem 서버에는 저장소 전체가 아니라 `samples/oss-inputs`만 허용하는 것을 권장합니다.

```bash
npx -y @modelcontextprotocol/server-filesystem ./samples/oss-inputs
npx -y @modelcontextprotocol/server-memory
uvx mcp-server-git --repository .
npx -y @playwright/mcp@latest
```

## 데모별 WoW Moment

1. 회의록: 학습자가 `transcript.md`를 수정하고 Filesystem MCP가 실제 파일을 다시 읽게 한다.
2. 견적서: Git MCP가 가격표 변경 commit의 diff를 읽고 견적 변동 근거를 제시한다.
3. 설계도: Playwright MCP가 생성된 SVG를 열어 스냅샷·콘솔·스크린샷을 검증한다.
4. 검색: 공식 원격 MCP에서 발견한 실제 도구와 검색 결과 링크를 화면에 표시한다.
5. 메모리: Memory MCP의 entity·relation·observation으로 다음 세션에서도 관계를 불러온다.

## 안전 기준

- 수업은 합성 데이터와 전용 샘플 폴더만 사용합니다.
- Filesystem MCP의 허용 경로를 홈 폴더나 루트로 지정하지 않습니다.
- Fetch MCP는 임의 URL·내부 IP 접근 위험이 있으므로 기본 라이브 데모에서 사용하지 않습니다.
- GitHub MCP는 읽기 전용 모드와 최소 toolset부터 시작하며 토큰을 저장소에 기록하지 않습니다.
- 삭제·쓰기 도구는 강사 승인 단계 뒤에 배치합니다.
- MCP 결과는 신뢰하지 않는 외부 입력으로 취급하고 HTML escape와 스키마 검증을 적용합니다.
