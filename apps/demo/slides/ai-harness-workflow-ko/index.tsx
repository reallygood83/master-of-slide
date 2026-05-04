import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';
import localAiWorkflow from './assets/local-ai-workflow_001.jpg';
import modelFuelHarnessCar from './assets/model-fuel-harness-car_001.jpg';
import poster from './assets/poster.jpg';

export const design: DesignSystem = {
  palette: {
    bg: '#0f0e0b',
    text: '#101010',
    accent: '#bf4503',
  },
  fonts: {
    display:
      '"Pretendard", "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif',
    body: '"Pretendard", "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif',
  },
  typeScale: {
    hero: 142,
    body: 38,
  },
  radius: 0,
};

const ink = 'var(--osd-text)';
const cream = '#fffaf0';
const orange = 'var(--osd-accent)';
const yellow = '#ffd84d';
const mint = '#24d6a3';
const blue = '#1b78ff';
const purple = '#7d4cff';
const red = '#ff314f';
const muted = 'color-mix(in srgb, var(--osd-text) 62%, var(--osd-bg))';

const mono =
  '"JetBrains Mono", "SF Mono", Menlo, Consolas, "Apple SD Gothic Neo", "Malgun Gothic", monospace';

const fill: CSSProperties = {
  width: '100%',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  boxSizing: 'border-box',
  background: 'var(--osd-bg)',
  color: 'var(--osd-text)',
  fontFamily: 'var(--osd-font-body)',
  wordBreak: 'keep-all',
  overflowWrap: 'anywhere',
};

const gridBg: CSSProperties = {
  backgroundImage:
    'linear-gradient(color-mix(in srgb, var(--osd-text) 8%, transparent) 2px, transparent 2px), linear-gradient(90deg, color-mix(in srgb, var(--osd-text) 8%, transparent) 2px, transparent 2px)',
  backgroundSize: '64px 64px',
};

function PageShell({
  children,
  label,
  section,
  bg = 'var(--osd-bg)',
}: {
  children: ReactNode;
  label: string;
  section: string;
  bg?: string;
}) {
  return (
    <div style={{ ...fill, ...gridBg, backgroundColor: bg, padding: 92 }}>
      <div
        style={{
          position: 'absolute',
          top: 34,
          left: 92,
          fontFamily: mono,
          fontSize: 'calc(var(--osd-size-body) * 0.58)',
          fontWeight: 950,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        AI 평준화 시대 / Master Of Slide
      </div>
      <div
        style={{
          position: 'absolute',
          top: 30,
          right: 92,
          border: `5px solid ${ink}`,
          background: cream,
          padding: '10px 18px',
          boxShadow: `8px 8px 0 ${ink}`,
          fontFamily: mono,
          fontSize: 'calc(var(--osd-size-body) * 0.58)',
          fontWeight: 950,
        }}
      >
        {label}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 92,
          bottom: 44,
          color: muted,
          fontFamily: mono,
          fontSize: 'calc(var(--osd-size-body) * 0.58)',
          fontWeight: 850,
        }}
      >
        {section}
      </div>
      {children}
    </div>
  );
}

function Stamp({
  children,
  color = yellow,
  rotate = -2,
}: {
  children: ReactNode;
  color?: string;
  rotate?: number;
}) {
  return (
    <span
      style={{
        display: 'inline-block',
        border: `5px solid ${ink}`,
        background: color,
        padding: '12px 22px',
        boxShadow: `8px 8px 0 ${ink}`,
        transform: `rotate(${rotate}deg)`,
        fontFamily: mono,
        fontSize: 'calc(var(--osd-size-body) * 0.74)',
        fontWeight: 950,
      }}
    >
      {children}
    </span>
  );
}

function BrutalCard({
  title,
  body,
  color = cream,
  accent = orange,
  minHeight = 190,
}: {
  title: string;
  body: string;
  color?: string;
  accent?: string;
  minHeight?: number;
}) {
  return (
    <div
      style={{
        border: `5px solid ${ink}`,
        background: color,
        boxShadow: `12px 12px 0 ${ink}`,
        padding: 30,
        minHeight,
      }}
    >
      <div
        style={{
          display: 'inline-block',
          background: accent,
          border: `4px solid ${ink}`,
          padding: '8px 14px',
          marginBottom: 18,
          fontFamily: mono,
          fontSize: 'calc(var(--osd-size-body) * 0.58)',
          fontWeight: 950,
        }}
      >
        {title}
      </div>
      <p
        style={{
          margin: 0,
          fontSize: 'calc(var(--osd-size-body) * 0.82)',
          lineHeight: 1.44,
          fontWeight: 760,
        }}
      >
        {body}
      </p>
    </div>
  );
}

function BigNumber({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div
      style={{
        border: `7px solid ${ink}`,
        background: color,
        boxShadow: `16px 16px 0 ${ink}`,
        padding: '30px 34px',
      }}
    >
      <div
        style={{
          fontSize: 'calc(var(--osd-size-hero) * 0.65)',
          lineHeight: 0.95,
          fontWeight: 950,
          letterSpacing: '-0.04em',
        }}
      >
        {value}
      </div>
      <div
        style={{
          marginTop: 16,
          fontSize: 'calc(var(--osd-size-body) * 0.76)',
          lineHeight: 1.34,
          fontWeight: 820,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function Lane({ title, items, color }: { title: string; items: string[]; color: string }) {
  return (
    <div
      style={{
        border: `5px solid ${ink}`,
        background: color,
        boxShadow: `10px 10px 0 ${ink}`,
        padding: 26,
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: 'calc(var(--osd-size-body) * 1.1)',
          lineHeight: 1.12,
          fontWeight: 950,
        }}
      >
        {title}
      </h3>
      <ul
        style={{
          margin: '26px 0 0',
          paddingLeft: 32,
          fontSize: 'calc(var(--osd-size-body) * 0.76)',
          lineHeight: 1.42,
          fontWeight: 720,
        }}
      >
        {items.map((item) => (
          <li key={item} style={{ marginBottom: 14 }}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

const Cover: Page = () => (
  <PageShell label="01" section="프롤로그">
    <div
      style={{
        position: 'absolute',
        right: 116,
        top: 156,
        width: 470,
        height: 670,
        border: `7px solid ${ink}`,
        boxShadow: `18px 18px 0 ${ink}`,
        transform: 'rotate(2deg)',
        overflow: 'hidden',
        background: cream,
      }}
    >
      <img
        src={poster}
        alt="AI 평준화 시대 포스터"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>
    <div style={{ position: 'absolute', left: 104, top: 172, width: 1100 }}>
      <Stamp>NEWS INSIGHT 2026</Stamp>
      <h1
        style={{
          margin: '58px 0 34px',
          fontFamily: 'var(--osd-font-display)',
          fontSize: 'var(--osd-size-hero)',
          lineHeight: 1.02,
          letterSpacing: '-0.035em',
          fontWeight: 950,
        }}
      >
        모두가 같은 AI를 쓰는 시대,
        <br />
        당신의 무기는?
      </h1>
      <p
        style={{
          width: 980,
          margin: 0,
          fontSize: 'calc(var(--osd-size-body) * 1.13)',
          lineHeight: 1.42,
          fontWeight: 760,
        }}
      >
        모델 경쟁이 끝난 자리에 남은 세 가지 질문:
        <span style={{ color: orange }}> 비용, 보안, 나의 일하는 방식.</span>
      </p>
    </div>
  </PageShell>
);

const SameModelDifferentResult: Page = () => (
  <PageShell label="02" section="문제 전환">
    <div style={{ paddingTop: 112 }}>
      <h2
        style={{
          margin: 0,
          fontSize: 'calc(var(--osd-size-hero) * 0.75)',
          lineHeight: 1.06,
          letterSpacing: '-0.035em',
          fontWeight: 950,
        }}
      >
        더 큰 모델보다
        <br />더 좋은 시스템
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 50, marginTop: 74 }}>
        <BigNumber
          value="52.8 → 66.5"
          label="같은 모델·같은 데이터, 둘러싼 방식만 바꿨을 때의 점수 상승"
          color={yellow}
        />
        <BigNumber
          value="최대 6배"
          label="모델 주변 환경을 정돈했을 때 벌어지는 성능 차이"
          color={mint}
        />
      </div>
      <p
        style={{
          width: 1220,
          margin: '70px 0 0',
          fontSize: 'calc(var(--osd-size-body) * 1.1)',
          lineHeight: 1.44,
          fontWeight: 780,
        }}
      >
        엔진이 같아도 차체·기어·운전석이 다르면 결과가 달라집니다. 이제 경쟁은 모델 그 자체가 아니라
        모델을 일에 연결하는 구조입니다.
      </p>
    </div>
  </PageShell>
);

const HarnessDefinition: Page = () => (
  <PageShell label="03" section="하네스 정의">
    <div style={{ paddingTop: 106 }}>
      <Stamp color={mint}>한 줄 정의</Stamp>
      <h2
        style={{
          margin: '42px 0 0',
          fontSize: 'calc(var(--osd-size-hero) * 0.73)',
          lineHeight: 1.06,
          letterSpacing: '-0.035em',
          fontWeight: 950,
        }}
      >
        하네스는
        <br />
        AI를 일에 묶는 장치
      </h2>
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 28, marginTop: 66 }}
      >
        {[
          ['Context', '자료를 먼저 건네기', yellow],
          ['Tool', '다른 프로그램 부르기', mint],
          ['Memory', '기록을 잊지 않기', blue],
          ['Eval Loop', '어제 답을 점검하기', purple],
          ['Guardrail', '하지 말아야 할 일 막기', orange],
        ].map(([title, body, color]) => (
          <BrutalCard
            key={title}
            title={title as string}
            body={body as string}
            color={color as string}
            minHeight={245}
          />
        ))}
      </div>
      <p
        style={{
          width: 1240,
          margin: '62px 0 0',
          fontSize: 'calc(var(--osd-size-body) * 1.08)',
          lineHeight: 1.42,
          fontWeight: 800,
        }}
      >
        모델은 연료입니다. 하네스는 자동차입니다. 연료만 사 모아서는 앞으로 가지 못합니다.
      </p>
    </div>
  </PageShell>
);

const ThreeCompetitions: Page = () => (
  <PageShell label="04" section="평준화의 의미">
    <div style={{ paddingTop: 116 }}>
      <h2
        style={{
          margin: 0,
          fontSize: 'calc(var(--osd-size-hero) * 0.68)',
          lineHeight: 1.08,
          letterSpacing: '-0.03em',
          fontWeight: 950,
        }}
      >
        모델은 평준화됐고,
        <br />
        진짜 경쟁은 세 갈래로 이동했습니다
      </h2>
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 42, marginTop: 72 }}
      >
        <Lane
          title="비용"
          color={yellow}
          items={['구독은 작아 보여도', '조직 단위에선 예산이 된다', '종량제 구조를 이해해야 한다']}
        />
        <Lane
          title="보안"
          color={red}
          items={['입력은 전송이다', '학생·상담·민원 데이터는 무겁다', '안전 기준이 격차를 만든다']}
        />
        <Lane
          title="워크플로우"
          color={mint}
          items={['도구보다 일의 순서', '반복 자료와 점검 루프', '같은 AI를 다르게 쓰는 힘']}
        />
      </div>
    </div>
  </PageShell>
);

const CostSecurity: Page = () => (
  <PageShell label="05" section="비용과 보안">
    <div
      style={{ display: 'grid', gridTemplateColumns: '0.95fr 1.05fr', gap: 66, paddingTop: 112 }}
    >
      <div>
        <h2
          style={{
            margin: 0,
            fontSize: 'calc(var(--osd-size-hero) * 0.65)',
            lineHeight: 1.05,
            letterSpacing: '-0.032em',
            fontWeight: 950,
          }}
        >
          청구서와
          <br />
          개인정보는
          <br />
          매달 돌아옵니다
        </h2>
        <p
          style={{
            margin: '52px 0 0',
            fontSize: 'var(--osd-size-body)',
            lineHeight: 1.45,
            fontWeight: 760,
          }}
        >
          학교 한 곳에서 교사 50명이 여러 AI 구독을 쓰면 연간 비용은 빠르게 커집니다. 더 큰 문제는
          상담 기록과 생활기록부 초안이 어디로 가는지 모른다는 점입니다.
        </p>
      </div>
      <div style={{ display: 'grid', gap: 30 }}>
        <BrutalCard
          title="COST"
          body="개인 월 3~5만 원은 작아 보여도, 조직에선 매년 반복되는 운영비가 됩니다."
          color={yellow}
        />
        <BrutalCard
          title="PRIVACY"
          body="AI에 붙여넣는 순간 데이터는 외부 서버로 이동할 수 있습니다. 학교 데이터는 특히 보수적으로 다뤄야 합니다."
          color={red}
        />
        <BrutalCard
          title="RULE"
          body="초록·노랑·빨강 신호등이 있어야 클라우드 AI도 안전하게 쓸 수 있습니다."
          color={mint}
        />
      </div>
    </div>
  </PageShell>
);

const LocalLLM: Page = () => (
  <PageShell label="06" section="로컬 LLM">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.95fr', gap: 58, paddingTop: 104 }}>
      <div>
        <Stamp color={blue}>내 노트북 안의 AI</Stamp>
        <h2
          style={{
            margin: '42px 0 0',
            fontSize: 'calc(var(--osd-size-hero) * 0.68)',
            lineHeight: 1.06,
            letterSpacing: '-0.035em',
            fontWeight: 950,
          }}
        >
          로컬 LLM은
          <br />
          목표가 아니라
          <br />
          선택지입니다
        </h2>
        <p
          style={{
            margin: '48px 0 0',
            fontSize: 'var(--osd-size-body)',
            lineHeight: 1.45,
            fontWeight: 760,
          }}
        >
          데이터는 노트북 밖으로 나가지 않고, 인터넷이 끊겨도 작동하며, 매달 청구서가 없습니다.
          하지만 먼저 필요한 것은 내 일을 설명할 지도입니다.
        </p>
      </div>
      <div
        style={{
          border: `6px solid ${ink}`,
          boxShadow: `16px 16px 0 ${ink}`,
          background: cream,
          padding: 26,
          transform: 'rotate(1deg)',
        }}
      >
        <img
          src={localAiWorkflow}
          alt="로컬 AI 워크플로우를 상징하는 네오브루탈리즘 일러스트"
          style={{
            display: 'block',
            width: 760,
            height: 520,
            objectFit: 'cover',
            border: `4px solid ${ink}`,
          }}
        />
        <div
          style={{
            marginTop: 24,
            fontFamily: mono,
            fontSize: 'calc(var(--osd-size-body) * 0.63)',
            fontWeight: 900,
          }}
        >
          IMAGE SLOT 1 / PRIVATE LOCAL AI WORKFLOW
        </div>
      </div>
    </div>
  </PageShell>
);

const PersonalStart: Page = () => (
  <PageShell label="07" section="개인이 시작하는 법">
    <div style={{ paddingTop: 116 }}>
      <h2
        style={{
          margin: 0,
          fontSize: 'calc(var(--osd-size-hero) * 0.69)',
          lineHeight: 1.07,
          letterSpacing: '-0.033em',
          fontWeight: 950,
        }}
      >
        오늘 시작할 일은
        <br />
        설치가 아니라 관찰입니다
      </h2>
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 42, marginTop: 72 }}
      >
        <Lane
          title="1. 관찰일기"
          color={yellow}
          items={['일주일간 내가 쓴 글', '반복해서 찾은 자료', '시간이 빠진 지점']}
        />
        <Lane
          title="2. 데이터 신호등"
          color={mint}
          items={['초록: 공개 자료', '노랑: 익명 처리 후', '빨강: 클라우드 금지']}
        />
        <Lane
          title="3. 작은 루프"
          color={blue}
          items={['하루 메모 모으기', '키워드와 할 일 정리', '30일 기록 쌓기']}
        />
      </div>
    </div>
  </PageShell>
);

const SchoolStart: Page = () => (
  <PageShell label="08" section="학교와 조직">
    <div
      style={{ display: 'grid', gridTemplateColumns: '0.92fr 1.08fr', gap: 58, paddingTop: 108 }}
    >
      <div>
        <h2
          style={{
            margin: 0,
            fontSize: 'calc(var(--osd-size-hero) * 0.65)',
            lineHeight: 1.07,
            letterSpacing: '-0.034em',
            fontWeight: 950,
          }}
        >
          서버보다 먼저
          <br />
          약속과
          <br />
          공용 자산
        </h2>
        <p
          style={{
            margin: '50px 0 0',
            fontSize: 'var(--osd-size-body)',
            lineHeight: 1.45,
            fontWeight: 760,
          }}
        >
          공용 AI 서버는 매력적이지만, 운영 책임과 보안 심의가 따라옵니다. 첫 단추는 A4 한 장의
          기준과 모두가 쓰는 프롬프트 폴더입니다.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30 }}>
        <BrutalCard
          title="AI 신호등"
          body="무엇을 입력해도 되는지 학교 차원에서 합의합니다."
          color={yellow}
          minHeight={220}
        />
        <BrutalCard
          title="프롬프트 도서관"
          body="잘 만든 한 문장이 동료 50명의 시간을 아낍니다."
          color={mint}
          minHeight={220}
        />
        <BrutalCard
          title="표준 워크플로우"
          body="가정통신문, 평가 피드백, 상담 요약의 순서를 정합니다."
          color={blue}
          minHeight={220}
        />
        <BrutalCard
          title="절충 도구 검증"
          body="학교 기준에 맞는 SaaS와 자체 인프라 사이의 다리를 고릅니다."
          color={purple}
          minHeight={220}
        />
      </div>
    </div>
  </PageShell>
);

const Roadmap: Page = () => (
  <PageShell label="09" section="로드맵">
    <div style={{ paddingTop: 106 }}>
      <Stamp color={orange}>순서를 거꾸로 가지 않기</Stamp>
      <h2
        style={{
          margin: '42px 0 0',
          fontSize: 'calc(var(--osd-size-hero) * 0.66)',
          lineHeight: 1.06,
          letterSpacing: '-0.035em',
          fontWeight: 950,
        }}
      >
        약속 → 자산 → 절충 도구 → 자체 인프라
      </h2>
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 30, marginTop: 72 }}
      >
        {[
          ['01', '가이드라인', '신호등 기준과 입력 금지선을 먼저 정합니다.', yellow],
          ['02', '공용 자산', '프롬프트와 워크플로우를 학교 전체 지식으로 만듭니다.', mint],
          ['03', '절충 도구', '국내 보관형·교육 특화 AI를 제한적으로 검증합니다.', blue],
          ['04', '로컬 인프라', '운영 부담이 낮아진 뒤 학교·지역 단위로 검토합니다.', orange],
        ].map(([step, title, body, color]) => (
          <div
            key={step}
            style={{
              border: `5px solid ${ink}`,
              background: color as string,
              boxShadow: `10px 10px 0 ${ink}`,
              padding: 26,
              minHeight: 370,
            }}
          >
            <div
              style={{
                fontFamily: mono,
                fontSize: 'calc(var(--osd-size-body) * 0.74)',
                fontWeight: 950,
              }}
            >
              {step}
            </div>
            <h3
              style={{
                margin: '44px 0 24px',
                fontSize: 'calc(var(--osd-size-body) * 1.1)',
                lineHeight: 1.1,
                fontWeight: 950,
              }}
            >
              {title}
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: 'calc(var(--osd-size-body) * 0.76)',
                lineHeight: 1.42,
                fontWeight: 740,
              }}
            >
              {body}
            </p>
          </div>
        ))}
      </div>
    </div>
  </PageShell>
);

const FinalQuestion: Page = () => (
  <PageShell label="10" section="에필로그">
    <div
      style={{
        position: 'absolute',
        right: 126,
        top: 176,
        width: 630,
        border: `6px solid ${ink}`,
        background: cream,
        boxShadow: `18px 18px 0 ${ink}`,
        padding: 28,
        transform: 'rotate(-1deg)',
      }}
    >
      <img
        src={modelFuelHarnessCar}
        alt="모델은 연료, 하네스는 자동차라는 비유를 담은 네오브루탈리즘 일러스트"
        style={{
          display: 'block',
          width: 570,
          height: 430,
          objectFit: 'cover',
          border: `4px solid ${ink}`,
        }}
      />
      <div
        style={{
          marginTop: 24,
          fontFamily: mono,
          fontSize: 'calc(var(--osd-size-body) * 0.63)',
          fontWeight: 900,
        }}
      >
        IMAGE SLOT 2 / MODEL IS FUEL, HARNESS IS CAR
      </div>
    </div>
    <div style={{ position: 'absolute', left: 108, top: 170, width: 1040 }}>
      <Stamp color={mint}>마지막 질문</Stamp>
      <h2
        style={{
          margin: '52px 0 34px',
          fontSize: 'calc(var(--osd-size-hero) * 0.93)',
          lineHeight: 1.02,
          letterSpacing: '-0.04em',
          fontWeight: 950,
        }}
      >
        모델을 기다리지 말고,
        <br />
        자동차를 만드세요
      </h2>
      <p
        style={{
          width: 950,
          margin: 0,
          fontSize: 'calc(var(--osd-size-body) * 1.13)',
          lineHeight: 1.42,
          fontWeight: 780,
        }}
      >
        모델은 연료입니다. 하네스는 자동차입니다. 당신은 지금 어떤 시스템을 만들고 있습니까?
      </p>
    </div>
  </PageShell>
);

export const meta: SlideMeta = {
  title: '모두가 같은 AI를 쓰는 시대, 당신의 무기는 무엇입니까',
};

export default [
  Cover,
  SameModelDifferentResult,
  HarnessDefinition,
  ThreeCompetitions,
  CostSecurity,
  LocalLLM,
  PersonalStart,
  SchoolStart,
  Roadmap,
  FinalQuestion,
] satisfies Page[];
