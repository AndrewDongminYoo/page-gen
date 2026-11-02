# page-gen vs v0: one landing page, same prompt (2026-11-02)

The question was whether the model the operator uses every day, inside this harness, reaches the visual quality of v0.
Code quality was out of scope: page-gen's code was clearly better, so the comparison judged design only.
This note is a dated record of one run; the rule changes it motivated are listed at the end and live in `.claude/skills/` once applied.

## Setup

|                   | v0                                                       | page-gen                                                                                                                            |
| ----------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Input             | The prompt below, plus the app icon attached as an image | The same prompt, in `focus-study-landing` (made from this template)                                                                 |
| Model and context | v0                                                       | Opus 5.5 in a local Claude Code session, with read access to the app's repository (`focus-study`) and the operator's global harness |
| Icon              | Present                                                  | Absent while building (`public/icon.png` was never supplied); added to a scratch copy for the final capture                         |
| Rounds            | First result, then one feedback round                    | One run, including the `design-reviewer` pass (10 of 11 fixes applied)                                                              |

Both results were built in production mode and captured with `scripts/screenshot.mjs` at 1440px and 390px, light and dark.
v0's own preview link could not be used: it redirected to `v0.app/chat/unauthorized?reason=VM+not+found` after the preview VM stopped, so its downloaded code was installed with `--ignore-scripts` and built locally.

## Results

| Aspect                      | v0                                                                                                                                                                         | page-gen                                                                                  |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Hero                        | Two-line headline at a large size, tilted phone with a shadow                                                                                                              | One-line headline at a medium size, upright phone                                         |
| Section titles              | Written as copy ("집중의 시작은, 간단하게.")                                                                                                                               | Labels ("작동 방식", "기능")                                                              |
| Feature section rhythm      | Four small preview cards of different shapes                                                                                                                               | Four phone frames of the same size, with large empty areas beside short text              |
| Product fidelity            | Only what the prompt said; invented details contradicted the app (an early-ended session showed a duration, the everyday limit showed weekday chips the app does not have) | Strings and screen structure taken from the app's Swift sources                           |
| Dark-mode icon              | Navy icon disappeared into the navy page; fixed with a hairline border after feedback                                                                                      | Same problem, not fixed                                                                   |
| Unspecified contact address | Left as "준비 중"                                                                                                                                                          | Filled with a personal address found in another repository, and reported for confirmation |
| Screenshot script           | No layout FAIL; 5 desktop and 1 mobile tap targets under 24px, fixed after feedback                                                                                        | No FAIL on any variant                                                                    |

v0's feedback round changed only what it reported: the page height stayed identical in all four captures, and a pixel diff found 7 changed regions (the five icon placements, the removed duration, one link underline).

Verdict: v0 led on first impression and marketing polish; page-gen led on fidelity to the real product.
The gap came from three art-direction decisions (hero scale, section titles, repeated mockups), not from missing capability.

## Rule changes made from this run

The rules themselves live in the skills; this list records which observation each one answers.

| Observation                                                                                                       | Changed rule                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| The scale reserved `text-6xl`+ for "a deliberate hero", and the build stopped at a one-line medium headline       | `ui-design` §Typography: a landing hero is that deliberate case                                                           |
| Section titles were menu labels                                                                                   | `ui-design` §Copy: section titles are copy, labels become eyebrows                                                        |
| "Break the grid" named only cards, and four same-size phone frames passed it                                      | `ui-design` §Spacing and layout: no repeated device or mockup at the same size                                            |
| The navy icon disappeared on the navy dark page in both results                                                   | `ui-design` §Color: brand marks keep their shape in both themes                                                           |
| The blank contact address was filled from another repository; the operator accepted that, provided it is reported | `ui-design` §Copy: reuse only a published value with a named source, and list it for confirmation                         |
| The local session saw v0's result only through the operator                                                       | `build-ui` §4: capture a reference result with `scripts/screenshot.mjs` and `BASE_URL`, and compare against the checklist |

The checklist (`ui-design/references/checklist.md`) gained the matching first-impression and dark-mode lines.

## Appendix: the prompt

```plaintext
"온:공" iOS 앱의 한국어 랜딩페이지를 / 에 만들어 주세요.

제품과 대상
- 온:공은 공부하는 학생이 집중하는 동안 스스로 고른 앱과 웹사이트를 잠가 두는 iPhone 집중 타이머예요. iOS 17 이상, iPhone 전용이에요.
- 대상: 휴대폰 때문에 공부 흐름이 자주 끊기는 중·고등학생과 대학생.
- 계정·서버가 없고, 사용량은 기기 안의 스크린 타임 보고서에서만 보여 줘요.
- 같은 스튜디오(donminzzi lab)의 알람 앱 "온음(WarmWake)"의 형제 앱이에요. 이름의 "온"을 공유하는 가족처럼 보이되 같은 앱으로 보이면 안 돼요.

페이지의 목표
- 앱이 무엇을 막고 무엇을 막지 않는지 정직하게 보여 주고, 출시 소식을 기다리게 만드는 것. 아직 출시 전이에요.

섹션
1. 내비게이션: 아이콘 + "온:공" 워드마크, 기능 · 작동 방식 · 개인정보 · 문의 링크, "출시 알림 받기" 버튼.
2. Hero: 헤드라인 위 왼쪽에 아이콘을 64px 정도로 둬요. 헤드라인 "공부할 땐, 온전히 공부만." 서브카피 "집중하는 동안 방해되는 앱과 웹사이트를 잠가 두는 iPhone 집중 타이머예요." 버튼은 "출시 알림 받기"(mailto:{문의 이메일}), 보조 링크는 "어떻게 작동하나요". 오른쪽에 iPhone 프레임 하나: 전체 화면 집중 타이머(남은 시간 크게, 아래에 "쉬기"와 "집중 종료"). 타이머의 진행 링은 아이콘의 크림 링과 호박색 점 모양을 따라 주세요.
3. 작동 방식(3단계): ① 스크린 타임 접근 허용 ② 집중을 방해하는 앱과 웹사이트 고르기 ③ 집중 시간을 25~50분 중에 5분 단위로 정하고 시작.
4. 기능 4개(카드 그리드가 아니라 기능마다 설명 + 작은 화면 예시가 번갈아 놓이는 레이아웃):
   - 짧게 쉬기: 한 번의 집중에서 3분씩 최대 3번 쉴 수 있어요. 대기 화면을 거쳐야 쉴 수 있고, 쉬는 동안에는 타이머가 멈추고 제한이 잠깐 풀려요.
   - 매일 제한: 학교 시간처럼 매일 반복되는 시간대에 따로 고른 앱을 막아요. 점심시간 같은 짧은 해제 구간을 몇 개 둘 수 있고, 앱을 열지 않아도 매일 적용돼요.
   - 집중 모드와 함께: iOS에서 "공부" 같은 집중 모드를 켜면 집중이 시작되고, 알림은 그 집중 모드 설정대로 걸러져요. 그렇게 시작한 집중은 집중 모드를 끄면 끝나요.
   - 오늘의 기록: 오늘 한 집중과 끝난 이유를 보여 주고, 오늘의 사용량은 스크린 타임 보고서로 확인해요.
5. 개인정보: "계정이 없어요", "고른 앱 목록과 사용량을 서버로 보내지 않아요", "사용량은 iPhone의 스크린 타임 보고서 안에서만 보여요" 세 줄을 강조.
6. FAQ(아코디언):
   - 모든 브라우저에서 사이트가 막히나요? → 사이트(도메인) 단위로 막고, 주소의 세부 경로별로 막지는 않아요. 브라우저별 동작은 확인한 범위만 안내할 예정이에요.
   - 공부했다는 증명이 되나요? → 아니요. 스스로 정한 약속을 지키도록 돕는 도구예요.
   - 일시정지가 있나요? → 쉬기(3분, 최대 3번)만 있어요.
   - Android나 iPad도 되나요? → 지금은 iPhone만 지원해요.
   - 부모님이 관리하는 기능이 있나요? → 없어요. 본인이 본인의 iPhone에서 쓰는 앱이에요.
7. 마지막 CTA: 아이콘과 함께 "출시되면 가장 먼저 알려 드릴게요." + 출시 알림 버튼.
8. 푸터: donminzzi lab, 형제 앱 "온음(WarmWake)" 링크, 개인정보처리방침, 문의 이메일, © donminzzi lab.

톤과 참고
- 차분하고 단정한 해요체. 과장하거나 다그치는 문구("폰 중독 탈출!" 같은 말)는 쓰지 않아요.
- 공부 책상 위처럼 여백이 넉넉하고 조용한 인상. 숫자(타이머)를 타이포그래피의 주인공으로.
- 한글 본문은 Pretendard 계열로, 타이머 숫자는 tabular numbers로.

브랜드 색과 아이콘
- 앱 아이콘: public/icon.png (남색 바탕에 크림색 링, 그 아래 호박색 점). 내비게이션, Hero, 파비콘, 마지막 CTA에 쓰고 아이콘을 다시 그리지 마세요.
- 브랜드 색은 호박색 하나이고 값은 고정이에요: 라이트 #A85F10, 다크 #F4A646. 주요 버튼, 강조, 진행 표시에만 써요.
- 중립색은 아이콘의 남색 #1E2744와 크림 #FFF4E2예요. 라이트 모드는 크림 바탕에 남색 글자, 다크 모드는 남색 바탕에 크림 글자로, 아이콘과 같은 조합이 되게 해 주세요.
- 버튼 글자: 라이트에서는 호박 바탕에 흰 글자, 다크에서는 호박 바탕에 남색 글자. 다크에서 호박 바탕에 크림 글자는 쓰지 마세요(대비 1.9:1).
- 라이트 모드에서 호박색은 크림 바탕 위 대비가 4.48:1이라, 큰 글자·아이콘·테두리·진행 표시에만 쓰고 작은 본문 링크는 남색에 밑줄로 표시해 주세요.
- 링과 점, 두 개의 원은 이 앱의 모티프예요. 타이머 일러스트와 섹션 사이의 작은 구분 요소에만 절제해서 쓰고, 배경 장식으로 흩뿌리지 마세요. 그라디언트는 쓰지 않아요.

실제 콘텐츠와 상태
- 화면 이미지는 아직 없어요. iPhone 프레임 안의 화면은 UI 컴포넌트로 단순하게 재구성하고, 나중에 실제 스크린샷(1179×2556)으로 바꿀 수 있게 이미지 자리로 분리해 주세요.
- App Store 배지는 "곧 출시" 상태로, 링크 없이 비활성으로 보여 주세요.
- 실제로 확인되지 않은 수치(사용자 수, 평점, 집중 시간 증가율)는 넣지 마세요.
```

<!-- cspell:ignore donminzzi -->
