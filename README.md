# Master Of Slide

**Master Of Slide**는 `open-slide` 소스를 기반으로 만든 에이전트 친화형 슬라이드 제작 도구입니다. React로 슬라이드를 만들고, Web UI에서 미리보기, 발표, HTML/PDF/PPTX 내보내기, Canva 전달까지 이어갈 수 있습니다.

이 프로젝트는 한글 발표 자료 제작을 우선 고려해 `lang: 'ko'`, 한글 폰트 fallback, 한글 줄바꿈 규칙, Markdown/Obsidian 원문 기반 제작 흐름을 추가했습니다.

## 무엇을 할 수 있나

- React 컴포넌트로 1920 × 1080 슬라이드 제작
- Codex CLI 같은 코딩 에이전트에게 Markdown/Obsidian 문서 경로를 주고 슬라이드 생성
- Web UI에서 슬라이드 목록, 미리보기, 발표 모드, 에셋 관리
- HTML, PDF, PPTX 다운로드
- Canva Connect API로 PPTX를 Canva에 전달하고 Canva에서 후속 편집
- 한글 문서와 한글 발표 자료에 맞춘 렌더링 기본값
- 네오브루탈리즘 스타일 Web UI

## 빠른 시작

```bash
pnpm install
pnpm dev:demo
```

브라우저에서 아래 주소를 엽니다.

```text
http://127.0.0.1:5173/
```

새 워크스페이스를 만들 때는 CLI를 사용할 수 있습니다.

```bash
npx @open-slide/cli init my-slide
cd my-slide
pnpm install
pnpm dev
```

## GitHub 주소로 Codex / Claude에 설치하기

Master Of Slide 저장소 주소:

```text
https://github.com/reallygood83/master-of-slide
```

Codex나 Claude Code에 위 주소를 주고 설치를 맡길 때는 아래처럼 요청하면 됩니다.

```text
https://github.com/reallygood83/master-of-slide 를 클론해서 설치해줘.
설치 후 pnpm install:agents를 실행해서 slide 스킬과 /slide 명령도 전역에 설치해줘.
```

에이전트가 실행해야 하는 명령은 다음과 같습니다.

```bash
git clone https://github.com/reallygood83/master-of-slide.git
cd master-of-slide
pnpm install
pnpm install:agents
pnpm dev:demo
```

`pnpm install:agents`는 아래 파일을 전역 사용자 설정에 복사합니다.

```text
~/.codex/skills/slide/SKILL.md
~/.codex/skills/slide-authoring/SKILL.md
~/.codex/skills/create-slide-from-markdown/SKILL.md
~/.codex/skills/create-slide-image-prompts/SKILL.md
~/.claude/commands/slide.md
```

설치 후에는 Codex나 Claude Code를 다시 시작해야 새 스킬/명령이 보입니다.

사용 예:

```text
$slide "/Users/me/Obsidian/Vault/Research/My Note.md"
```

Claude Code에서는 slash command로도 사용할 수 있습니다.

```text
/slide "/Users/me/Obsidian/Vault/Research/My Note.md"
```

참고:

- Codex는 전역 skill을 `$slide` 또는 자연어 `slide ...` 요청으로 라우팅합니다.
- Claude Code는 `~/.claude/commands/slide.md` 때문에 `/slide` 명령으로 표시됩니다.
- repo 안에서만 쓸 경우에도 `.agents/skills/slide`와 `.claude/commands/slide.md`가 포함되어 있으므로, 저장소 루트에서 새 에이전트 세션을 열면 바로 사용할 수 있습니다.

## 기본 사용 흐름

1. `slides/<slide-id>/index.tsx`에 슬라이드를 작성합니다.
2. Web UI에서 슬라이드를 확인합니다.
3. 필요하면 Inspector/Design/Assets 패널에서 보정합니다.
4. 슬라이드에 로고를 넣으려면 상단 `Logo` 버튼에서 새 파일을 업로드하거나 기존 `assets/` 이미지를 선택합니다.
5. Download 메뉴에서 HTML, PDF, PPTX로 내보냅니다.
6. Canva에서 수정하려면 Canva 설정을 저장한 뒤 `Open in Canva`를 실행합니다.

CLI나 Codex가 새 슬라이드 폴더를 만들면 Web UI에도 반영됩니다. 예를 들어 에이전트가 아래 파일을 생성하면:

```text
slides/market-report/index.tsx
```

dev 서버는 파일 변경을 감지하고 홈 화면 목록에 `market-report`를 표시합니다. 서버가 이미 켜져 있는데 목록이 늦게 보이면 브라우저를 한 번 새로고침하면 됩니다.

## Markdown / Obsidian 문서로 슬라이드 만들기

Codex CLI 같은 에이전트 환경에서 다음처럼 요청하면 됩니다.

```text
이 Obsidian 문서를 바탕으로 발표 슬라이드를 만들어줘:
/Users/me/Obsidian/Vault/Research/My Note.md
```

내장 스킬 `create-slide-from-markdown`은 다음을 처리합니다.

- Markdown heading을 슬라이드 구조로 변환
- Obsidian wikilink, embed, callout을 일반 슬라이드 문맥으로 정리
- 한글 원문이면 한글 친화 디자인과 문장 밀도 적용
- 이미지 생성이 가능한 에이전트 환경이면 슬라이드 에셋 생성

### `/slide` 스킬

Master Of Slide 워크스페이스에는 `slide` 스킬도 포함됩니다. Claude Code나 Codex에서 아래처럼 요청하면 Markdown/Obsidian 문서를 읽어 바로 `slides/<id>/index.tsx`를 생성하는 흐름으로 들어갑니다.

```text
/slide /Users/me/Obsidian/Vault/Research/My Note.md
```

`slide` 스킬은 내부적으로 다음 스킬을 함께 사용하도록 설계되어 있습니다.

- `create-slide-from-markdown`: Markdown/Obsidian 원문 분석
- `slide-authoring`: 1920 × 1080 React 슬라이드 작성 규칙
- `create-slide-image-prompts`: GPT Image 2 스타일의 이미지 프롬프트 생성

Codex처럼 이미지 생성이 가능한 환경에서는 `create-slide-image-prompts`가 표지 히어로 이미지, 인포그래픽, 제품/브랜드 포스터, UI 목업 등에 맞는 프롬프트를 만들고, 가능하면 생성 이미지를 `slides/<id>/assets/`에 저장해 슬라이드에 배치합니다. 이미지 생성이 불가능한 환경에서는 같은 프롬프트를 `ImagePlaceholder` 힌트나 최종 안내에 남깁니다.

## 한글 최적화

워크스페이스의 `open-slide.config.ts`에 `lang: 'ko'`를 설정합니다.

```ts
import type { OpenSlideConfig } from '@open-slide/core';

const openSlideConfig: OpenSlideConfig = {
  port: 5173,
  lang: 'ko',
};

export default openSlideConfig;
```

적용 범위:

- 브라우저 미리보기의 `<html lang="ko">`
- HTML/PDF export의 lang metadata
- 한글 폰트 fallback
- 한글 줄바꿈 안정화
- PPTX 생성 전 React 렌더링 과정의 한글 표시 안정화

## PPTX export

Download 메뉴에서 `Export as PPTX`를 선택하면 `.pptx` 파일이 다운로드됩니다.

현재 PPTX는 각 React 슬라이드를 이미지로 렌더링해 한 장씩 넣는 방식입니다. PowerPoint와 Canva에서 열기 안정성이 높고, Master Of Slide의 `slide.design` 토큰도 캡처 과정에 적용되어 배경색, 글자색, accent, 폰트 기반 시각 스타일이 유지됩니다.

다만 PPTX 안의 모든 텍스트와 도형이 PowerPoint/Canva의 개별 편집 객체로 변환되는 방식은 아닙니다. 텍스트 수정은 Canva에서 디자인 위에 새 텍스트를 얹어 보정하거나, 원본 React 슬라이드를 수정한 뒤 다시 export하는 흐름이 가장 안정적입니다.

## Web UI에서 로고 넣기

슬라이드 화면 상단의 `Logo` 버튼을 누르면 로고를 넣을 수 있습니다.

메뉴:

- `Upload to current page`: 새 이미지 파일을 업로드하고 현재 페이지만 로고 삽입
- `Upload to all pages`: 새 이미지 파일을 업로드하고 모든 페이지에 로고 삽입
- `Asset to current page`: 이미 `slides/<slide-id>/assets/`에 있는 이미지를 골라 현재 페이지만 로고 삽입
- `Asset to all pages`: 이미 `slides/<slide-id>/assets/`에 있는 이미지를 골라 모든 페이지에 로고 삽입

동작 흐름:

1. 업로드한 파일 또는 기존 asset 이미지를 현재 슬라이드의 로고 소스로 사용합니다.
2. 선택한 범위에 따라 현재 페이지만 또는 모든 페이지를 로고 오버레이로 감쌉니다.
3. 로고는 기본적으로 오른쪽 위에 배치됩니다.
4. 위치나 크기를 바꾸고 싶으면 생성된 `slides/<slide-id>/index.tsx`의 `data-master-of-slide-logo` 이미지 스타일을 수정하면 됩니다.

현재 로고 삽입은 개발 서버에서만 동작합니다. 정적 빌드 결과물에서는 슬라이드 파일을 직접 수정할 수 없기 때문입니다.

## Canva 연결 흐름

Canva 계정 비밀번호를 입력하는 것이 아닙니다. 필요한 값은 **Canva Developer Portal에서 만든 Integration의 OAuth Client ID와 Client Secret**입니다.

관련 공식 링크:

- Canva Developer Portal: https://www.canva.com/developers/apps
- Canva Connect API 문서: https://www.canva.dev/docs/connect/
- Canva Connect 인증 설정: https://www.canva.dev/docs/connect/authentication/
- Canva scopes 설명: https://www.canva.dev/docs/connect/appendix/scopes/
- Canva Design Import API: https://www.canva.dev/docs/connect/api-reference/design-imports/

### 1. Canva Developer Portal에서 Integration 만들기

1. https://www.canva.com/developers/apps 로 이동합니다.
2. `Create an integration`을 선택합니다.
3. Integration type은 일반 개인/로컬 개발 용도라면 `Public`을 선택합니다.
   - `Private`은 Canva Enterprise 팀 전용 설정입니다.
4. 약관에 동의하고 Integration을 생성합니다.
5. 왼쪽 `Configuration` 화면에서 `Client ID`를 복사합니다.
6. `Client Secret`을 생성한 뒤 복사합니다.
   - 이 값은 Canva 계정 비밀번호가 아닙니다.
   - GitHub에 올리면 안 됩니다.

### 2. Redirect URI 등록하기

Canva Developer Portal의 왼쪽 메뉴에서 `Authentication`을 열고, `Authorized redirects`에 아래 값을 추가합니다.

```text
http://127.0.0.1:5173/api/canva/callback
```

주의:

- Canva는 로컬 주소에 `localhost` 대신 `127.0.0.1`을 요구할 수 있습니다.
- Web UI의 Canva Settings에 입력한 Redirect URI와 Developer Portal에 등록한 Redirect URI가 **완전히 같아야** 합니다.
- 개발 서버 포트를 바꾸면 Redirect URI의 포트도 같이 바꿔야 합니다.

예를 들어 dev server가 `5174`에서 돈다면 아래 값을 추가해야 합니다.

```text
http://127.0.0.1:5174/api/canva/callback
```

### 3. Scope 활성화하기

Canva Developer Portal의 왼쪽 `Scopes` 메뉴에서 아래 권한을 활성화합니다.

```text
design:content:write
```

이 권한은 Master Of Slide가 만든 PPTX를 Canva 디자인으로 가져오기 위해 필요합니다. 권한이 빠져 있으면 Canva 로그인 후 다음 오류가 날 수 있습니다.

```text
Canva rejected the requested scope.
```

권한을 켰다면 Master Of Slide에서 `Connect Canva`를 다시 실행합니다.

### 4. Master Of Slide Web UI에서 연결하기

Web UI에서 설정하는 방법:

1. 슬라이드 화면으로 들어갑니다.
2. Download 버튼을 누릅니다.
3. `Canva Settings`를 엽니다.
4. `Client ID`에 Canva Developer Portal의 Client ID를 입력합니다.
5. `Client Secret`에 생성한 Client Secret을 입력합니다.
6. `Redirect URI`에 Developer Portal에 등록한 값과 같은 값을 입력합니다.
7. `Save & Login`을 누릅니다.
8. Canva 로그인/승인을 완료합니다.
9. Master Of Slide로 돌아와 Download 메뉴에서 `Open in Canva`를 선택합니다.

저장된 값은 로컬 워크스페이스의 `.env` 파일에 저장됩니다. `.env`는 GitHub에 올리면 안 됩니다.

Canva에서 열리는 결과물은 Master Of Slide의 시각 스타일을 담은 PPTX를 Canva Design Import로 가져온 것입니다. Canva 안에서 열리더라도 Master Of Slide의 테마가 Canva의 네이티브 Brand Kit, 템플릿, 편집 가능한 테마 객체로 자동 변환되는 것은 아닙니다. 현재 목표는 “Canva에서 열 수 있고 후속 디자인 작업을 이어갈 수 있는 시각적으로 보존된 슬라이드”입니다.

### 자주 나는 Canva 오류

| 오류 메시지 | 원인 | 해결 |
| --- | --- | --- |
| `Set CANVA_CLIENT_ID and CANVA_CLIENT_SECRET` | Canva OAuth 정보가 없음 | Web UI의 `Canva Settings`에서 Client ID/Secret 저장 |
| `Canva login state mismatch` | 오래된 로그인 탭, 이전 state 값, 다른 주소에서 callback | 로그인 탭을 닫고 Master Of Slide에서 `Connect Canva` 다시 실행 |
| `Canva login session expired` | OAuth state가 만료됨 | 탭을 닫고 `Connect Canva` 다시 실행 |
| `Requested scopes are not allowed` | Developer Portal에서 `design:content:write`를 켜지 않음 | `Scopes`에서 `design:content:write` 활성화 |
| `리디렉션 URI를 구성하지 않았습니다` | Authorized redirects에 callback URL이 없음 | `Authentication`에 `http://127.0.0.1:5173/api/canva/callback` 추가 |
| `Canva is not connected` | 아직 로그인/승인 완료 전 | `Connect Canva` 완료 후 `Open in Canva` 재실행 |

## Canva CLI / Connect API 참고

Canva CLI는 주로 Canva Apps 개발용입니다. 이 프로젝트에서 PPTX를 Canva로 전달하는 기능은 Canva Connect API의 Design Import를 사용합니다.

공식 문서:

- Canva Developer Portal: https://www.canva.com/developers/apps
- Canva Connect 인증: https://www.canva.dev/docs/connect/authentication/
- Canva Design Import API: https://www.canva.dev/docs/connect/api-reference/design-imports/
- Canva CLI: https://www.canva.dev/docs/apps/canva-cli/

기존 PPTX 파일을 CLI로 Canva에 올릴 수도 있습니다.

```bash
CANVA_ACCESS_TOKEN=... open-slide import:canva deck.pptx --title "My deck"
```

## 주요 폴더

| 경로 | 설명 |
| --- | --- |
| `packages/core` | 런타임, Web UI, Vite plugin, export, Canva 연동, `open-slide` CLI |
| `packages/cli` | 새 워크스페이스 생성 CLI |
| `apps/demo` | 데모 슬라이드 워크스페이스 |
| `apps/web` | 소개용 Next.js 웹사이트 |

## 개발 명령어

```bash
pnpm dev:demo       # 데모 Web UI 실행
pnpm test           # 테스트 실행
pnpm --filter @open-slide/core typecheck
pnpm --filter @open-slide/core build
pnpm --filter demo build
```

## GitHub 업로드 전 주의

절대 올리면 안 되는 값:

- `.env`
- `CANVA_CLIENT_SECRET`
- Canva access token
- 기타 API key

이 저장소의 `.gitignore`는 `.env`를 무시하도록 설정되어야 합니다.

## 라이선스와 출처

Master Of Slide는 `open-slide` 소스를 기반으로 하며, 한글 최적화, Markdown/Obsidian 기반 제작 흐름, PPTX/Canva export 흐름, Web UI 스타일링을 추가했습니다.

License: MIT
