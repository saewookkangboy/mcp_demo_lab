# 04. 대화형 검색 MCP — 중급

## 학습 목표

- 검색 결과와 답변을 근거 문서 ID로 연결한다.
- 대화 이력을 도구 입력에 포함해 후속 질문을 처리한다.
- 결과 없음과 환각 방지 조건을 테스트한다.

## 실행과 예상 결과

`npm run dev` 후 `/projects/04-intermediate-conversational-search/`를 연다. “재택근무 승인 규칙은?”에 주 2회·전날 승인 답변과 `DOC-101` 근거가 표시된다. 이어 “승인은 언제 받아요?”라고 물으면 이전 대화가 사용된다.

두 질문의 MCP 실행 기록은 초기화 전까지 누적된다. 두 번째 `tools/call`의 `history`와 실행 번호를 확인한다.

Harness 비교에서는 citation 배열의 ID·제목 계약을 확인한다. 같은 상태로 비교하려면 실행 초기화 후 동일한 질문을 사용한다.

## 학습자 테스트

`node --test projects/04-intermediate-conversational-search/tests/app.test.js`

실습: `src/server.js`에 휴가 문서를 추가하고, 휴가 질문의 문서 ID와 핵심 문장을 검증하는 테스트를 먼저 작성한다.

## 실패·검증 포인트

- 결과 없음: 빈 `citations`와 재질문 안내를 반환해야 한다.
- 후속 질문: `usedHistory`가 실제 전달된 메시지 수와 같아야 한다.
- 근거: 화면의 문서 ID가 반환된 `citations`에 존재해야 한다.
- 주의: 단순 키워드 검색 mock이며 실제 임베딩·벡터 DB를 사용하지 않는다.
