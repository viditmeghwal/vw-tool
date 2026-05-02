import React, { useState, useEffect, useMemo } from 'react';
import ExamplesPage from "./components/ExamplesPage";
import { FieldHelper, AIGenerateButton, AI_PROMPTS } from "./components/AIHelpers";

/**
 * V&W Brand Strategy Tool — 9-step flow
 *
 * Architecture:
 *   - Single React component, parent-controlled state
 *   - localStorage persistence (key: "vw_brand_strategy")
 *   - Steps 1–6 free; paywall sits between step 6 and step 7
 *   - Steps 7–9 still rendered but blurred until `unlocked === true`
 *   - On unlock, redirects to /report.html (carry state via localStorage)
 *
 * Integration notes for your developer:
 *   - Replace the mock `handleUnlock` with a real Stripe Checkout redirect
 *   - On Stripe success webhook, set localStorage.vw_unlocked = "true"
 *     and forward user to /report.html
 *   - For multi-device persistence, swap localStorage with a backend write
 *     keyed on email at the unlock moment
 */

// ─── Constants ──────────────────────────────────────────────────────────

const ARCHETYPES = [
  { id: 'innocent',  desire: 'Safety',           label: 'Innocent' },
  { id: 'sage',      desire: 'Knowledge',        label: 'Sage' },
  { id: 'explorer',  desire: 'Freedom',          label: 'Explorer' },
  { id: 'outlaw',    desire: 'Liberation',       label: 'Outlaw' },
  { id: 'magician',  desire: 'Power',            label: 'Magician' },
  { id: 'hero',      desire: 'Mastery',          label: 'Hero' },
  { id: 'lover',     desire: 'Intimacy',         label: 'Lover' },
  { id: 'jester',    desire: 'Enjoyment',        label: 'Jester' },
  { id: 'everyman',  desire: 'Belonging',        label: 'Everyman' },
  { id: 'caregiver', desire: 'Service',          label: 'Caregiver' },
  { id: 'ruler',     desire: 'Control',          label: 'Ruler' },
  { id: 'creator',   desire: 'Innovation',       label: 'Creator' }
];

const TAGLINE_TYPES = [
  { id: 'imperative', label: 'Imperative',  hint: 'Commands action. Starts with a verb.', example: 'Just Do It.' },
  { id: 'descriptive', label: 'Descriptive', hint: 'Describes the service or promise.',    example: 'Save money. Live better.' },
  { id: 'superlative', label: 'Superlative', hint: 'Positions you as best in class.',      example: "The world's local bank." },
  { id: 'provocative', label: 'Provocative', hint: 'A question. Thought-provoking.',       example: "Got Milk?" },
  { id: 'specific',    label: 'Specific',    hint: 'Reveals the business category.',       example: 'Melts in your mouth, not in your hands.' }
];

const SDG_CAUSES = [
  'End extreme poverty', 'End hunger & improve nutrition', 'Healthy lives & well-being',
  'Quality education for all', 'Gender equality', 'Clean water & sanitation',
  'Affordable & sustainable energy', 'Economic growth & employment', 'Build infrastructure & industrialisation',
  'Reduce inequality', 'Sustainable cities & communities', 'Responsible consumption',
  'Climate action', 'Conserve oceans', 'Sustainable use of land',
  'Peace, justice & inclusive institutions', 'Global partnership for development'
];

const ACTION_VERBS = {
  Knowledge: ['Define', 'Identify', 'Describe', 'Explain', 'Recognise', 'Illustrate'],
  Understand: ['Interpret', 'Classify', 'Compare', 'Discuss', 'Translate', 'Predict'],
  Apply: ['Solve', 'Use', 'Teach', 'Demonstrate', 'Articulate', 'Discover'],
  Analyse: ['Connect', 'Relate', 'Distill', 'Categorise', 'Differentiate', 'Calculate'],
  Evaluate: ['Refine', 'Argue', 'Defend', 'Prioritise', 'Decide', 'Reframe'],
  Create: ['Design', 'Develop', 'Invent', 'Imagine', 'Inspire', 'Formulate']
};
const API_BASE = 'https://vw-tool-api.vercel.app/api';
const TOTAL_STEPS = 9;
const FREE_STEPS = 6;

// ─── Default empty state ───────────────────────────────────────────────

const initialState = {
  brandName: '',
  // Step 1 — Purpose
  purposeWhat: '',
  purposeHow: '',
  purposeWhy: '',
  purposeContribution: '',
  purposeImpact: '',
  // Step 2 — Vision
  visionNow: '',
  vision5: '',
  vision10: '',
  vision15: '',
  visionAspirations: '',
  visionIdeal: '',
  // Step 3 — Values
  valuesNegativeExp: '',
  valuesPositiveExp: '',
  valuesNegativeFeel: '',
  valuesPositiveFeel: '',
  values: ['', '', ''],
  // Step 4 — Audience
  audienceLabel: '',
  audienceGoals: '',
  audienceProblems: '',
  audienceImpact: '',
  audienceDesires: '',
  // Step 5 — Market
  marketX: '',
  marketY: '',
  marketDifference: '',
  marketBenefit: '',
  marketCompetitors: '',
  // Step 6 — Awareness Goals
  awareness: [{ name: '', impact: 50, ease: 50 }],
  // Step 7 — Personality (LOCKED)
  archetypePrimary: '',
  archetypeSecondary: '',
  attitudeLove: '',
  attitudeHate: '',
  // Step 8 — Voice (LOCKED)
  voiceHumour: 50,
  voiceFormality: 50,
  voiceRespect: 50,
  voiceEnthusiasm: 50,
  voiceAreA: '',
  voiceNotA: '',
  voiceAreB: '',
  voiceNotB: '',
  // Step 9 — Tagline (LOCKED)
  taglineType: '',
  taglineDrafts: ''
};

// ─── Component ──────────────────────────────────────────────────────────

export default function BrandStrategyTool() {
  const [step, setStep] = useState(0); // 0 = welcome, 1–9 = steps, 10 = report
  const [data, setData] = useState(initialState);
  const [unlocked, setUnlocked] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [aiLoading, setAiLoading] = useState({});

  // Persistence
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vw_brand_strategy');
      if (saved) setData({ ...initialState, ...JSON.parse(saved) });

      // Verify unlock against backend (don't trust localStorage alone)
      const orderId = localStorage.getItem('vw_order_id');
      const email = localStorage.getItem('vw_email');
      if (orderId && email) {
        fetch(`${API_BASE}/verify-unlock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, email })
        })
          .then(r => r.json())
          .then(data => {
            if (data.unlocked === true) {
              setUnlocked(true);
              localStorage.setItem('vw_unlocked', 'true');
            } else {
              setUnlocked(false);
              localStorage.removeItem('vw_unlocked');
            }
          })
          .catch(() => {
            setUnlocked(false);
          });
      } else {
        // No order info saved — definitely not unlocked
        setUnlocked(false);
        localStorage.removeItem('vw_unlocked');
      }
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem('vw_brand_strategy', JSON.stringify(data)); } catch {}
  }, [data]);

  const update = (patch) => setData(prev => ({ ...prev, ...patch }));

  const handleAIGenerate = async (field, prompt) => {
    setAiLoading(prev => ({ ...prev, [field]: true }));
    try {
      const response = await fetch(`${API_BASE}/ai-generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, brand: data.brandName || '' })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'AI generation failed');
      if (result.text) update({ [field]: result.text });
    } catch (e) { alert(e.message || 'AI generation failed'); }
    finally { setAiLoading(prev => ({ ...prev, [field]: false })); }
  };

  const loadExample = (exampleData) => { update(exampleData); setStep(1); };

  const handleNext = () => {
    if (step === FREE_STEPS && !unlocked) {
      setShowPaywall(true);
      return;
    }
    if (step < TOTAL_STEPS) setStep(step + 1);
    else setStep(10);
  };

const handleUnlock = async ({ couponCode, isFree, finalPriceINR, email }) => {
    if (isFree && couponCode) {
      // Free unlock via 100% coupon — backend creates order with status='paid'
      const res = await fetch(`${API_BASE}/unlock-with-coupon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, email })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Unlock failed.');
      }

      localStorage.setItem('vw_unlocked', 'true');
      localStorage.setItem('vw_coupon_used', couponCode);
      localStorage.setItem('vw_email', email);
      localStorage.setItem('vw_order_id', data.merchantOrderId);
      setUnlocked(true);
      setShowPaywall(false);
      setStep(7);
      return;
    }

    // Paid path — create PhonePe order, redirect to checkout
    const amountInPaise = finalPriceINR * 100;

    const res = await fetch(`${API_BASE}/phonepe/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amountInPaise,
        email,
        coupon_code: couponCode || null
      })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Could not start checkout.');
    }

    // Save context before leaving so we can verify on return
    localStorage.setItem('vw_pending_order', data.merchantOrderId);
    localStorage.setItem('vw_email', email);
    if (couponCode) localStorage.setItem('vw_coupon_used', couponCode);

    // Redirect to PhonePe
    window.location.href = data.redirectUrl;
  };
  // ─── Synthesis (the magic) ─────────────────────────────────────────

  const synthesis = useMemo(() => ({
    purpose: data.purposeContribution && data.purposeImpact
      ? `To ${data.purposeContribution.trim()}, so that ${data.purposeImpact.trim()}.`
      : '',
    vision: data.visionAspirations && data.visionIdeal
      ? `To be ${data.visionAspirations.trim()}, of ${data.visionIdeal.trim()}.`
      : '',
    positioning: data.audienceLabel && data.audienceProblems && data.marketBenefit && data.marketDifference
      ? `We help ${data.audienceLabel.trim()} who ${data.audienceProblems.trim()} to achieve ${data.marketBenefit.trim()}, unlike ${data.marketCompetitors.split(',')[0]?.trim() || 'the alternatives'} our solutions ${data.marketDifference.trim()}.`
      : '',
    voice: [data.voiceAreA && `We are ${data.voiceAreA}, but we're not ${data.voiceNotA}.`, data.voiceAreB && `We are ${data.voiceAreB}, but we're not ${data.voiceNotB}.`].filter(Boolean).join(' '),
    archetype: data.archetypePrimary && data.archetypeSecondary
      ? `70% ${data.archetypePrimary} · 30% ${data.archetypeSecondary}`
      : ''
  }), [data]);

  // ─── Render ─────────────────────────────────────────────────────────

  return (
    <div className="vw-tool">
      <style>{styles}</style>

      <Header step={step} unlocked={unlocked} onJump={(s) => s <= FREE_STEPS || unlocked ? setStep(s) : setShowPaywall(true)} brandName={data.brandName} onShowExamples={() => setStep(11)} />

      <main className="container">
        {step === 0 && <Welcome data={data} update={update} onStart={() => setStep(1)} />}
        {step === 1 && <StepPurpose data={data} update={update} synthesis={synthesis} />}
        {step === 2 && <StepVision data={data} update={update} synthesis={synthesis} />}
        {step === 3 && <StepValues data={data} update={update} />}
        {step === 4 && <StepAudience data={data} update={update} />}
        {step === 5 && <StepMarket data={data} update={update} synthesis={synthesis} />}
        {step === 6 && <StepAwareness data={data} update={update} />}
        {step === 7 && <StepPersonality data={data} update={update} unlocked={unlocked} />}
        {step === 8 && <StepVoice data={data} update={update} unlocked={unlocked} synthesis={synthesis} />}
        {step === 9 && <StepTagline data={data} update={update} unlocked={unlocked} />}
        {step === 10 && <FinalReport data={data} synthesis={synthesis} unlocked={unlocked} />}
        {step === 11 && <ExamplesPage onLoadExample={loadExample} onBack={() => setStep(0)} />}
      </main>

      {step >= 1 && step <= TOTAL_STEPS && (
        <Footer
          step={step}
          onBack={() => setStep(s => Math.max(0, s - 1))}
          onNext={handleNext}
          unlocked={unlocked}
          isLastFree={step === FREE_STEPS && !unlocked}
        />
      )}

      {showPaywall && (
        <Paywall onUnlock={handleUnlock} onCancel={() => setShowPaywall(false)} synthesis={synthesis} />
      )}
    </div>
  );
}

// ─── Header / progress ──────────────────────────────────────────────────

function Header({ step, unlocked, onJump, brandName, onShowExamples }) {
  return (
    <header className="vw-header">
      <div className="vw-header-inner">
        <a href="/" className="wordmark">V<span>&amp;</span>W</a>
        <div className="brand-tag">
          {brandName ? <em>{brandName}</em> : <span className="muted">Brand strategy in session</span>}
        </div>
        <button className="btn-examples" onClick={() => onShowExamples && onShowExamples()}>See Examples</button>
        <div className="step-indicator">
          {step === 0 ? 'Begin' : step <= TOTAL_STEPS ? `Step ${step} of ${TOTAL_STEPS}` : 'Report'}
        </div>
      </div>

      {step >= 1 && step <= TOTAL_STEPS && (
        <div className="progress">
          {[...Array(TOTAL_STEPS)].map((_, i) => {
            const n = i + 1;
            const isLocked = n > FREE_STEPS && !unlocked;
            return (
              <button
                key={n}
                className={`tick ${n === step ? 'current' : ''} ${n < step ? 'done' : ''} ${isLocked ? 'locked' : ''}`}
                onClick={() => onJump(n)}
                aria-label={`Go to step ${n}`}
              >
                <span className="tick-num">{n}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}

// ─── Welcome ────────────────────────────────────────────────────────────

function Welcome({ data, update, onStart }) {
  return (
    <div className="welcome">
      <div className="eyebrow">A V<em>&amp;</em>W instrument · Brand Strategy Tool</div>
      <h1 className="display">
        Let's begin with<br />the brand's <em>name</em>.
      </h1>
      <p className="lede">
        We'll move through nine short steps, in three acts: Brand Core, Brand Positioning, Brand Persona. The first six are yours, free. The synthesis — the document that pulls it all into one page — unlocks at the end.
      </p>
      <div className="welcome-input">
        <label>Brand name</label>
        <input
          type="text"
          value={data.brandName}
          onChange={(e) => update({ brandName: e.target.value })}
          placeholder="The name people will say out loud"
          autoFocus
        />
      </div>
      <button className="btn-primary large" onClick={onStart} disabled={!data.brandName.trim()}>
        Begin →
      </button>
      <p className="muted small" style={{ marginTop: '24px' }}>
        Your inputs save automatically. You can leave and come back.
      </p>
    </div>
  );
}

// ─── Step 1: Purpose ────────────────────────────────────────────────────

function StepPurpose({ data, update, synthesis }) {
  return (
    <StepFrame act="Brand Core" stepNum="01" title={<>Brand <em>purpose</em></>} subtitle="Why you do what you do — beyond making money.">
      <Quote attribution="Simon Sinek">
        Why does your company exist? Why do you get out of bed every morning? And why should anyone care?
      </Quote>

      <div className="grid-2">
        <Field label="What" hint="The products you sell, services you offer, jobs you perform.">
          <textarea value={data.purposeWhat} onChange={(e) => update({ purposeWhat: e.target.value })} rows="3" placeholder="e.g. We design and manufacture marble surfaces for premium homes." />
        </Field>
        <Field label="How" hint="The values, actions, and guiding principles that make you stand out.">
          <textarea value={data.purposeHow} onChange={(e) => update({ purposeHow: e.target.value })} rows="3" placeholder="e.g. Direct from quarry, transparent sourcing, design-led service." />
        </Field>
      </div>

      <Field label="Why" hint="What your brand stands for. The cause, the belief.">
        <textarea value={data.purposeWhy} onChange={(e) => update({ purposeWhy: e.target.value })} rows="2" placeholder="e.g. Marble buying should feel human, not transactional." />
      </Field>

      <Divider label="Now we synthesize" />

      <Field label="Contribution" hint="The specific contribution you make. Start with an action verb.">
        <input type="text" value={data.purposeContribution} onChange={(e) => update({ purposeContribution: e.target.value })} placeholder="e.g. inspire others to do the things that inspire them" />
        <ActionVerbHelper onPick={(v) => update({ purposeContribution: v + ' ' })} />
      </Field>

      <Field label="Impact" hint="The result of that contribution. What you allow others to do or to be.">
        <input type="text" value={data.purposeImpact} onChange={(e) => update({ purposeImpact: e.target.value })} placeholder="e.g. together we can change the world for the better" />
      </Field>

      <SynthesisCard
        label="Your purpose statement"
        formula="To [contribution], so that [impact]."
        value={synthesis.purpose}
        example="To inspire others to do the things that inspire them, so that together we can change the world for the better."
      />
    </StepFrame>
  );
}

function ActionVerbHelper({ onPick }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="verb-helper">
      <button type="button" className="link-btn" onClick={() => setOpen(!open)}>
        {open ? 'Hide' : 'Need a verb?'} {open ? '↑' : '↓'}
      </button>
      {open && (
        <div className="verb-grid">
          {Object.entries(ACTION_VERBS).map(([cat, verbs]) => (
            <div key={cat} className="verb-col">
              <div className="verb-cat">{cat}</div>
              {verbs.map(v => (
                <button key={v} type="button" className="verb-pill" onClick={() => onPick(v.toLowerCase())}>{v}</button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Step 2: Vision ─────────────────────────────────────────────────────

function StepVision({ data, update, synthesis }) {
  return (
    <StepFrame act="Brand Core" stepNum="02" title={<>Brand <em>vision</em></>} subtitle="A vivid description of where you're going.">
      <Quote attribution="John C. Maxwell">
        A vision statement is a vivid idealised description of a desired outcome that inspires, energises, and helps you create a mental picture of your target.
      </Quote>

      <div className="timeline">
        <TimelineCol label="Now" hint="Where are you today?">
          <textarea value={data.visionNow} onChange={(e) => update({ visionNow: e.target.value })} rows="3" placeholder="The current state of the business." />
        </TimelineCol>
        <TimelineCol label="5 years" hint="What you want to achieve. Growth.">
          <textarea value={data.vision5} onChange={(e) => update({ vision5: e.target.value })} rows="3" placeholder="In 5 years…" />
        </TimelineCol>
        <TimelineCol label="10 years" hint="How big. Market share.">
          <textarea value={data.vision10} onChange={(e) => update({ vision10: e.target.value })} rows="3" placeholder="In 10 years…" />
        </TimelineCol>
        <TimelineCol label="15 years" hint="The impact. The category change.">
          <textarea value={data.vision15} onChange={(e) => update({ vision15: e.target.value })} rows="3" placeholder="In 15 years…" />
        </TimelineCol>
      </div>

      <Divider label="Now we synthesize" />

      <div className="grid-2">
        <Field label="Aspirations" hint="Use superlatives. 'The industry's best.' 'The world's first.'">
          <input type="text" value={data.visionAspirations} onChange={(e) => update({ visionAspirations: e.target.value })} placeholder="e.g. world's first zero-cholesterol oil company" />
        </Field>
        <Field label="Ideal / Category" hint="The category you're reshaping.">
          <input type="text" value={data.visionIdeal} onChange={(e) => update({ visionIdeal: e.target.value })} placeholder="e.g. cooking oils, vegan leather, marble surfaces" />
        </Field>
      </div>

      <SynthesisCard
        label="Your vision statement"
        formula="To be [aspirations], of [category]."
        value={synthesis.vision}
        example="To be the first pioneer of vegan leather bags."
      />
    </StepFrame>
  );
}

function TimelineCol({ label, hint, children }) {
  return (
    <div className="timeline-col">
      <div className="timeline-label">{label}</div>
      <div className="timeline-hint">{hint}</div>
      {children}
    </div>
  );
}

// ─── Step 3: Values ─────────────────────────────────────────────────────

function StepValues({ data, update }) {
  const setValue = (i, v) => {
    const next = [...data.values];
    next[i] = v;
    update({ values: next });
  };
  const addValue = () => update({ values: [...data.values, ''] });

  return (
    <StepFrame act="Brand Core" stepNum="03" title={<>Brand <em>values</em></>} subtitle="The guiding principles. Not words on a wall — decisions, made repeatedly.">
      <Quote attribution="Denise Lee Yohn">
        Core values are not just a list of niche-sounding words on a page. They are the guiding principles that define how a company behaves and makes decisions.
      </Quote>

      <div className="quad">
        <div className="quad-cell">
          <div className="quad-label">Negative experiences</div>
          <div className="quad-hint">Bad experiences with brands in your category. What goes wrong?</div>
          <textarea value={data.valuesNegativeExp} onChange={(e) => update({ valuesNegativeExp: e.target.value })} rows="4" />
        </div>
        <div className="quad-cell">
          <div className="quad-label">Positive experiences</div>
          <div className="quad-hint">The opposite. The desirable experience you wish you had.</div>
          <textarea value={data.valuesPositiveExp} onChange={(e) => update({ valuesPositiveExp: e.target.value })} rows="4" />
        </div>
        <div className="quad-cell">
          <div className="quad-label">Negative feelings</div>
          <div className="quad-hint">How that bad experience made you feel inside.</div>
          <textarea value={data.valuesNegativeFeel} onChange={(e) => update({ valuesNegativeFeel: e.target.value })} rows="4" />
        </div>
        <div className="quad-cell">
          <div className="quad-label">Positive feelings</div>
          <div className="quad-hint">The desirable feeling. The internal opposite.</div>
          <textarea value={data.valuesPositiveFeel} onChange={(e) => update({ valuesPositiveFeel: e.target.value })} rows="4" />
        </div>
      </div>

      <Divider label="Pick three to five values that make those positive feelings real" />

      <div className="values-list">
        {data.values.map((v, i) => (
          <div key={i} className="value-row">
            <span className="value-num"><em>{String(i + 1).padStart(2, '0')}</em></span>
            <input
              type="text"
              value={v}
              onChange={(e) => setValue(i, e.target.value)}
              placeholder={i === 0 ? 'e.g. Leadership — the courage to shape a better future.' : 'Value — what it stands for.'}
            />
          </div>
        ))}
        {data.values.length < 5 && (
          <button type="button" className="link-btn" onClick={addValue}>+ Add another value</button>
        )}
      </div>
    </StepFrame>
  );
}

// ─── Step 4: Audience ───────────────────────────────────────────────────

function StepAudience({ data, update }) {
  return (
    <StepFrame act="Brand Positioning" stepNum="04" title={<>Target <em>audience</em></>} subtitle="The more specific, the more they'll invest in you.">
      <Quote attribution="Donald Miller">
        The more specific you get with your audience, the more you'll be able to connect with them emotionally and the more they'll be willing to invest in your product or service.
      </Quote>

      <Field label="Label" hint="The most common customer. Demographics. One sentence.">
        <input type="text" value={data.audienceLabel} onChange={(e) => update({ audienceLabel: e.target.value })} placeholder="e.g. First-home buyers, 28–40, premium tier, design-led couples in metro India." />
      </Field>

      <div className="grid-2">
        <Field label="Goals" hint="Their objectives. Strategic aspirations. What they hope for.">
          <textarea value={data.audienceGoals} onChange={(e) => update({ audienceGoals: e.target.value })} rows="4" />
        </Field>
        <Field label="Problems" hint="Pain points. Core challenges. What blocks them.">
          <textarea value={data.audienceProblems} onChange={(e) => update({ audienceProblems: e.target.value })} rows="4" />
        </Field>
        <Field label="Impact" hint="What they fear because of those problems. The internal cost.">
          <textarea value={data.audienceImpact} onChange={(e) => update({ audienceImpact: e.target.value })} rows="4" />
        </Field>
        <Field label="Desires" hint="The best case. The opposite of their problems. What they secretly want.">
          <textarea value={data.audienceDesires} onChange={(e) => update({ audienceDesires: e.target.value })} rows="4" />
        </Field>
      </div>
    </StepFrame>
  );
}

// ─── Step 5: Market ─────────────────────────────────────────────────────

function StepMarket({ data, update, synthesis }) {
  return (
    <StepFrame act="Brand Positioning" stepNum="05" title={<>Market <em>analysis</em></>} subtitle="Choose to stand for something. Not everything.">
      <Quote attribution="Al Ries">
        Positioning is not what you do to a product. Positioning is what you do to the mind of the prospect.
      </Quote>

      <div className="grid-2">
        <Field label="Extreme X" hint="Something the audience cares about.">
          <input type="text" value={data.marketX} onChange={(e) => update({ marketX: e.target.value })} placeholder="e.g. Convenience" />
        </Field>
        <Field label="Extreme Y" hint="Another thing they care about. Often in tension with X.">
          <input type="text" value={data.marketY} onChange={(e) => update({ marketY: e.target.value })} placeholder="e.g. Craft" />
        </Field>
      </div>

      <Field label="Direct competitors" hint="At least 5–10 names. Comma-separated.">
        <textarea value={data.marketCompetitors} onChange={(e) => update({ marketCompetitors: e.target.value })} rows="2" placeholder="e.g. Brand A, Brand B, Brand C…" />
      </Field>

      <Field label="Difference" hint="The gap in the market. How you stand out.">
        <textarea value={data.marketDifference} onChange={(e) => update({ marketDifference: e.target.value })} rows="3" placeholder="e.g. meets you in your home, not at the showroom" />
      </Field>

      <Field label="Benefit" hint="The end benefit. Emotional, intangible.">
        <textarea value={data.marketBenefit} onChange={(e) => update({ marketBenefit: e.target.value })} rows="3" placeholder="e.g. confidence in a decision they'll live with for thirty years" />
      </Field>

      <SynthesisCard
        label="Your positioning statement"
        formula="We help [audience] who [problem] to achieve [benefit], unlike [competitor] our solutions [difference]."
        value={synthesis.positioning}
        example="We help first-home buyers who fear getting marble wrong to achieve confidence in a 30-year decision, unlike traditional showrooms our solutions meet you in your home."
      />
    </StepFrame>
  );
}

// ─── Step 6: Awareness ─────────────────────────────────────────────────

function StepAwareness({ data, update }) {
  const updateInit = (i, patch) => {
    const next = [...data.awareness];
    next[i] = { ...next[i], ...patch };
    update({ awareness: next });
  };
  const add = () => update({ awareness: [...data.awareness, { name: '', impact: 50, ease: 50 }] });
  const remove = (i) => update({ awareness: data.awareness.filter((_, idx) => idx !== i) });

  return (
    <StepFrame act="Brand Positioning" stepNum="06" title={<>Awareness <em>goals</em></>} subtitle="Plot every initiative against impact and ease. Then prioritise.">
      <Quote attribution="Philip Kotler">
        Awareness is the first step in the customer's journey to purchase. It's the foundation upon which all other advertising efforts are built.
      </Quote>

      <p className="muted" style={{ marginBottom: '32px' }}>
        Common starting points: PR, blogging, social media, SEO, influencer marketing, media buying, partnerships, events, podcasts. Add your own. Drag the sliders to estimate impact (1–100) and ease (1 = hard, 100 = easy).
      </p>

      <div className="awareness-list">
        {data.awareness.map((item, i) => (
          <div key={i} className="awareness-row">
            <div className="awareness-name">
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateInit(i, { name: e.target.value })}
                placeholder="e.g. SEO, PR, Influencer marketing…"
              />
            </div>
            <div className="slider-group">
              <label>Impact <span className="slider-val">{item.impact}</span></label>
              <input type="range" min="0" max="100" value={item.impact} onChange={(e) => updateInit(i, { impact: parseInt(e.target.value) })} />
            </div>
            <div className="slider-group">
              <label>Ease <span className="slider-val">{item.ease}</span></label>
              <input type="range" min="0" max="100" value={item.ease} onChange={(e) => updateInit(i, { ease: parseInt(e.target.value) })} />
            </div>
            {data.awareness.length > 1 && (
              <button type="button" className="x-btn" onClick={() => remove(i)} aria-label="Remove">×</button>
            )}
          </div>
        ))}
        <button type="button" className="link-btn" onClick={add}>+ Add another initiative</button>
      </div>

      <ImpactQuadrant items={data.awareness} />

      <div className="paywall-tease">
        <div className="paywall-tease-line" />
        <div className="paywall-tease-text">
          <em>Three steps remaining</em> — personality, voice, tagline — and the synthesized one-page strategy.
        </div>
      </div>
    </StepFrame>
  );
}

function ImpactQuadrant({ items }) {
  const valid = items.filter(i => i.name.trim());
  if (valid.length === 0) return null;
  return (
    <div className="quadrant">
      <div className="quadrant-y-label">High impact</div>
      <div className="quadrant-y-label bottom">Low impact</div>
      <div className="quadrant-x-label left">Difficult</div>
      <div className="quadrant-x-label right">Easy</div>
      <div className="quadrant-grid">
        <div className="q-line-h" />
        <div className="q-line-v" />
        {valid.map((item, i) => (
          <div
            key={i}
            className="q-dot"
            style={{ left: `${item.ease}%`, bottom: `${item.impact}%` }}
            title={item.name}
          >
            <span>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step 7: Personality (LOCKED) ──────────────────────────────────────

function StepPersonality({ data, update, unlocked }) {
  return (
    <StepFrame act="Brand Persona" stepNum="07" title={<>Brand <em>personality</em></>} subtitle="Universal patterns of human behaviour. The archetypal mix.">
      <LockOverlay locked={!unlocked}>
        <Quote attribution="Carol Pearson">
          Archetypes are universal patterns of human behaviour that are deeply ingrained in our psyche. They are the foundation of your brand's personality.
        </Quote>

        <p className="muted">Pick a primary archetype (70%) and a secondary (30%). Most strong brands hold the tension between two.</p>

        <div className="archetype-grid">
          {ARCHETYPES.map(a => (
            <button
              key={a.id}
              type="button"
              className={`archetype-card ${data.archetypePrimary === a.id ? 'primary' : ''} ${data.archetypeSecondary === a.id ? 'secondary' : ''}`}
              onClick={() => {
                if (data.archetypePrimary === a.id) update({ archetypePrimary: '' });
                else if (data.archetypeSecondary === a.id) update({ archetypeSecondary: '' });
                else if (!data.archetypePrimary) update({ archetypePrimary: a.id });
                else if (!data.archetypeSecondary && a.id !== data.archetypePrimary) update({ archetypeSecondary: a.id });
                else update({ archetypePrimary: a.id, archetypeSecondary: '' });
              }}
            >
              <div className="archetype-name">{a.label}</div>
              <div className="archetype-desire">{a.desire}</div>
              {data.archetypePrimary === a.id && <span className="archetype-tag">70%</span>}
              {data.archetypeSecondary === a.id && <span className="archetype-tag">30%</span>}
            </button>
          ))}
        </div>

        <Divider label="With that mix in mind" />

        <div className="grid-2">
          <Field label="What do you love, and why?">
            <textarea value={data.attitudeLove} onChange={(e) => update({ attitudeLove: e.target.value })} rows="3" placeholder="We love revolution because we want to change the world for the better." />
          </Field>
          <Field label="What do you hate, and why?">
            <textarea value={data.attitudeHate} onChange={(e) => update({ attitudeHate: e.target.value })} rows="3" placeholder="We hate regulations because they restrain our freedom of choice." />
          </Field>
        </div>
      </LockOverlay>
    </StepFrame>
  );
}

// ─── Step 8: Voice (LOCKED) ────────────────────────────────────────────

function StepVoice({ data, update, unlocked, synthesis }) {
  return (
    <StepFrame act="Brand Persona" stepNum="08" title={<>Brand <em>voice</em></>} subtitle="The personality, tone, and language of every line you write.">
      <LockOverlay locked={!unlocked}>
        <Quote attribution="Neil Patel">
          Your brand voice is the personality, tone and language that you use when communicating with your customers. It should reflect your brand's values and be consistent across all channels.
        </Quote>

        <div className="dial-list">
          <Dial label="Humour" leftLabel="Funny" rightLabel="Serious" value={data.voiceHumour} onChange={v => update({ voiceHumour: v })} />
          <Dial label="Formality" leftLabel="Casual" rightLabel="Formal" value={data.voiceFormality} onChange={v => update({ voiceFormality: v })} />
          <Dial label="Respect" leftLabel="Sassy" rightLabel="Respectful" value={data.voiceRespect} onChange={v => update({ voiceRespect: v })} />
          <Dial label="Enthusiasm" leftLabel="Enthusiastic" rightLabel="Matter-of-fact" value={data.voiceEnthusiasm} onChange={v => update({ voiceEnthusiasm: v })} />
        </div>

        <Divider label="Now project the tone" />

        <div className="voice-formula">
          <div className="vf-row">
            <span>We are</span>
            <input value={data.voiceAreA} onChange={e => update({ voiceAreA: e.target.value })} placeholder="funny" />
            <span>, but we're not</span>
            <input value={data.voiceNotA} onChange={e => update({ voiceNotA: e.target.value })} placeholder="sarcastic" />
            <span>.</span>
          </div>
          <div className="vf-row">
            <span>We are</span>
            <input value={data.voiceAreB} onChange={e => update({ voiceAreB: e.target.value })} placeholder="authoritative" />
            <span>, but we're not</span>
            <input value={data.voiceNotB} onChange={e => update({ voiceNotB: e.target.value })} placeholder="bossy" />
            <span>.</span>
          </div>
        </div>

        <SynthesisCard
          label="Your tone profile"
          value={synthesis.voice}
          example="We are funny, but we're not sarcastic. We are authoritative, but we're not bossy."
        />
      </LockOverlay>
    </StepFrame>
  );
}

function Dial({ label, leftLabel, rightLabel, value, onChange }) {
  return (
    <div className="dial">
      <div className="dial-header">
        <span className="dial-label">{label}</span>
        <span className="dial-position">{value < 33 ? leftLabel : value > 66 ? rightLabel : 'Centre'}</span>
      </div>
      <div className="dial-track">
        <span className="dial-end left">{leftLabel}</span>
        <input type="range" min="0" max="100" value={value} onChange={e => onChange(parseInt(e.target.value))} />
        <span className="dial-end right">{rightLabel}</span>
      </div>
    </div>
  );
}

// ─── Step 9: Tagline (LOCKED) ──────────────────────────────────────────

function StepTagline({ data, update, unlocked }) {
  return (
    <StepFrame act="Brand Persona" stepNum="09" title={<>Brand <em>tagline</em></>} subtitle="The single most important expression of the brand.">
      <LockOverlay locked={!unlocked}>
        <Quote attribution="David Ogilvy">
          A brand tagline is the single most important expression of your brand. It should be a memorable and powerful as possible, as it will stick with your customers forever.
        </Quote>

        <p className="muted">Pick the kind of tagline that fits the brand. Then draft as many as you can — quantity unlocks quality.</p>

        <div className="tagline-types">
          {TAGLINE_TYPES.map(t => (
            <button
              key={t.id}
              type="button"
              className={`tagline-type ${data.taglineType === t.id ? 'active' : ''}`}
              onClick={() => update({ taglineType: t.id })}
            >
              <div className="tt-label">{t.label}</div>
              <div className="tt-hint">{t.hint}</div>
              <div className="tt-eg"><em>{t.example}</em></div>
            </button>
          ))}
        </div>

        <Field label="Your drafts" hint="Write at least five. One per line. Don't edit yet — just generate.">
          <textarea
            value={data.taglineDrafts}
            onChange={e => update({ taglineDrafts: e.target.value })}
            rows="8"
            placeholder={"Stone, at home.\nMarble, met halfway.\nThe quarry comes to you.\n…"}
          />
        </Field>
      </LockOverlay>
    </StepFrame>
  );
}

// ─── Final Report (placeholder — links to dashboard) ───────────────────

function FinalReport({ data, synthesis, unlocked }) {
  if (!unlocked) {
    return (
      <div className="welcome">
        <h1 className="display">Almost <em>there.</em></h1>
        <p className="lede">The report unlocks once you've completed the framework.</p>
      </div>
    );
  }
  return (
    <div className="welcome">
      <div className="eyebrow">Complete</div>
      <h1 className="display">Your one-page <em>strategy</em></h1>
      <p className="lede">Open the dashboard to view, edit and export.</p>
      <a className="btn-primary large" href="/report.html">View dashboard →</a>
    </div>
  );
}

// ─── Paywall ───────────────────────────────────────────────────────────

function Paywall({ onUnlock, onCancel, synthesis }) {
  const BASE_PRICE_INR = 2000;
  const BASE_PRICE_USD = 25;

  const [couponCode, setCouponCode] = useState('');
  const [email, setEmail] = useState('');
  const [emailValid, setEmailValid] = useState(false);
  const [unlockState, setUnlockState] = useState({ status: 'idle', message: '' });
  const [couponState, setCouponState] = useState({ status: 'idle', discount: 0, message: '' });
  // status: 'idle' | 'checking' | 'valid' | 'invalid'

  const finalPriceINR = Math.round(BASE_PRICE_INR * (1 - couponState.discount / 100));
  const finalPriceUSD = Math.round(BASE_PRICE_USD * (1 - couponState.discount / 100));
  const isFree = couponState.status === 'valid' && couponState.discount === 100;

  const validateCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    setCouponState({ status: 'checking', discount: 0, message: '' });

    // PRODUCTION: replace this with a real API call to /api/validate-coupon
    // The backend validates against the DB, checks usage caps, returns:
    //   { valid: true, discount: 100, message: "100% off applied" }
    // OR { valid: false, message: "Coupon not found" / "Coupon limit reached" }
    //
    // Frontend-only validation is BYPASSABLE. This mock is for prototyping only.
    try {
      const res = await mockValidateCoupon(code);
      if (res.valid) {
        setCouponState({ status: 'valid', discount: res.discount, message: res.message });
      } else {
        setCouponState({ status: 'invalid', discount: 0, message: res.message });
      }
    } catch (err) {
      setCouponState({ status: 'invalid', discount: 0, message: 'Could not check coupon. Try again.' });
    }
  };

  const clearCoupon = () => {
    setCouponCode('');
    setCouponState({ status: 'idle', discount: 0, message: '' });
  };

 const handleClick = async () => {
    if (!emailValid) {
      setUnlockState({ status: 'error', message: 'Please enter a valid email.' });
      return;
    }

    setUnlockState({ status: 'loading', message: '' });

    try {
      await onUnlock({
        couponCode: couponState.status === 'valid' ? couponCode.trim().toUpperCase() : null,
        isFree,
        finalPriceINR,
        email: email.trim()
      });
    } catch (err) {
      setUnlockState({ status: 'error', message: err.message || 'Something went wrong. Try again.' });
    }
  };

  return (
    <div className="paywall-overlay">
      <div className="paywall-card">
        <button className="paywall-close" onClick={onCancel} aria-label="Close">×</button>

        <div className="eyebrow">Step 6 complete</div>
        <h2 className="display">The <em>shape</em> of your strategy<br />is on the page.</h2>
        <p className="lede">
          You've answered the hardest questions. What's left is synthesis — the personality, voice, and tagline that turn the answers into a one-page document. Plus the dashboard to live with it.
        </p>

        <div className="locked-preview">
          <div className="lp-label">Your synthesized strategy — preview</div>
          <div className="lp-content">
            <div className="lp-row">
              <span className="lp-key">Purpose</span>
              <span className="lp-val">{synthesis.purpose ? synthesis.purpose : <em className="muted">Will appear here</em>}</span>
            </div>
            <div className="lp-row">
              <span className="lp-key">Vision</span>
              <span className="lp-val">{synthesis.vision ? synthesis.vision : <em className="muted">Will appear here</em>}</span>
            </div>
            <div className="lp-row blurred">
              <span className="lp-key">Positioning</span>
              <span className="lp-val">A clear, ownable position will appear here based on your answers from steps 4 and 5.</span>
            </div>
            <div className="lp-row blurred">
              <span className="lp-key">Personality</span>
              <span className="lp-val">Your archetypal mix will appear here.</span>
            </div>
            <div className="lp-row blurred">
              <span className="lp-key">Voice</span>
              <span className="lp-val">Your tone profile will appear here.</span>
            </div>
            <div className="lp-row blurred">
              <span className="lp-key">Tagline</span>
              <span className="lp-val">Your drafted taglines will appear here.</span>
            </div>
          </div>
        </div>

        <div className="paywall-pricing">
          {/* Price block */}
          <div className="pp-price-row">
            {couponState.discount > 0 && (
              <span className="pp-original">₹{BASE_PRICE_INR.toLocaleString('en-IN')}</span>
            )}
            <span className="pp-amount">{isFree ? 'Free' : `₹${finalPriceINR.toLocaleString('en-IN')}`}</span>
            {!isFree && <span className="pp-usd"><em>≈ ${finalPriceUSD}</em></span>}
          </div>
          <div className="pp-sub">
            <em>{isFree ? 'On us. With our compliments.' : 'One-time. No subscription.'}</em>
          </div>

          <ul>
            <li>The remaining three steps</li>
            <li>One-page strategy as a PDF</li>
            <li>Editable dashboard you can return to</li>
            <li>Synthesized statements you can copy into any deck</li>
          </ul>
{/* Email input */}
          <div className="coupon-block">
            <label className="coupon-label">Email <span className="muted">(for receipt and access)</span></label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                const v = e.target.value;
                setEmail(v);
                setEmailValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
              }}
              placeholder="you@brand.com"
              className={email && !emailValid ? 'has-error' : ''}
              required
            />
          </div>
          {/* Coupon section */}
          <div className="coupon-block">
            {couponState.status === 'valid' ? (
              <div className="coupon-applied">
                <div className="coupon-applied-info">
                  <span className="coupon-tag">{couponCode.toUpperCase()}</span>
                  <span className="coupon-message"><em>{couponState.message}</em></span>
                </div>
                <button type="button" className="link-btn" onClick={clearCoupon}>Remove</button>
              </div>
            ) : (
              <div className="coupon-input-row">
                <label className="coupon-label">Coupon code <span className="muted">(optional)</span></label>
                <div className="coupon-input-group">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      if (couponState.status === 'invalid') {
                        setCouponState({ status: 'idle', discount: 0, message: '' });
                      }
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') validateCoupon(); }}
                    placeholder="Enter code"
                    className={couponState.status === 'invalid' ? 'has-error' : ''}
                    disabled={couponState.status === 'checking'}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={validateCoupon}
                    disabled={!couponCode.trim() || couponState.status === 'checking'}
                  >
                    {couponState.status === 'checking' ? 'Checking…' : 'Apply'}
                  </button>
                </div>
                {couponState.status === 'invalid' && (
                  <div className="coupon-error">{couponState.message}</div>
                )}
              </div>
            )}
          </div>

          <button className="btn-primary large full" onClick={handleClick}>
            {isFree ? 'Unlock the report — Free →' : `Unlock the report — ₹${finalPriceINR.toLocaleString('en-IN')} →`}
          </button>
          <p className="muted small" style={{ textAlign: 'center', marginTop: '12px' }}>
            {isFree ? 'No payment needed. Going straight to your report.' : 'Secure checkout via PhonePe — UPI, cards, netbanking.'}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Coupon validation (mock — replace with real API call) ────────────
//
// PRODUCTION: this entire function should be a fetch() to your backend.
// The backend validates against a database of coupons + usage counts.
//
//   async function validateCoupon(code) {
//     const res = await fetch('/api/validate-coupon', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ code })
//     });
//     return res.json();
//   }
//
// Frontend-only validation is BYPASSABLE — anyone can read the JS and
// reverse-engineer the codes. Always validate on the server before
// granting unlock or skipping payment.

async function mockValidateCoupon(code) {
  // Real backend call — kept the function name for compatibility
  try {
    const res = await fetch('https://vw-tool-api.vercel.app/api/validate-coupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });

    const data = await res.json();

    if (!res.ok) {
      return { valid: false, message: data.error || "Could not validate coupon." };
    }

    if (data.valid) {
      return {
        valid: true,
        discount: data.discount_value,
        message: data.description
      };
    }

    return { valid: false, message: data.error || "That code doesn't look right. Check and try again." };
  } catch (err) {
    return { valid: false, message: 'Could not check coupon. Try again.' };
  }
}

// ─── Reusable bits ─────────────────────────────────────────────────────

function StepFrame({ act, stepNum, title, subtitle, children }) {
  return (
    <div className="step-frame">
      <div className="step-meta">
        <div className="step-act">{act}</div>
        <div className="step-num"><em>{stepNum}</em></div>
      </div>
      <h1 className="display step-title">{title}</h1>
      <p className="lede step-subtitle">{subtitle}</p>
      <div className="step-body">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      {hint && <div className="field-hint">{hint}</div>}
      {children}
    </div>
  );
}

function Quote({ attribution, children }) {
  return (
    <blockquote className="vw-quote">
      <p>{children}</p>
      <footer>— <em>{attribution}</em></footer>
    </blockquote>
  );
}

function Divider({ label }) {
  return (
    <div className="divider">
      <span className="divider-line" />
      <span className="divider-label"><em>{label}</em></span>
      <span className="divider-line" />
    </div>
  );
}

function SynthesisCard({ label, formula, value, example }) {
  return (
    <div className="synthesis-card">
      <div className="sc-label">{label}</div>
      {formula && <div className="sc-formula">{formula}</div>}
      <div className={`sc-value ${value ? '' : 'empty'}`}>
        {value ? <em>{value}</em> : <span className="muted">Fill in the fields above to see this assemble itself.</span>}
      </div>
      {example && <div className="sc-example">e.g. <em>{example}</em></div>}
    </div>
  );
}

function LockOverlay({ locked, children }) {
  return (
    <div className={`lock-wrapper ${locked ? 'is-locked' : ''}`}>
      {children}
      {locked && (
        <div className="lock-veil">
          <div className="lock-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4"/></svg>
          </div>
          <div className="lock-msg">Unlocks with the report — $25</div>
        </div>
      )}
    </div>
  );
}

// ─── Footer (back/next) ───────────────────────────────────────────────

function Footer({ step, onBack, onNext, unlocked, isLastFree }) {
  return (
    <footer className="vw-footer">
      <div className="vw-footer-inner">
        <button className="btn-ghost" onClick={onBack}>← Back</button>
        <div className="footer-meta">
          {isLastFree ? <em>Step 6 of 9 — last free step</em> : <em>Auto-saved</em>}
        </div>
        <button className="btn-primary" onClick={onNext}>
          {isLastFree ? 'Unlock the rest — $25 →' : step === TOTAL_STEPS ? 'See the report →' : 'Next →'}
        </button>
      </div>
    </footer>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────

const styles = `
  .vw-tool {
    --ink: #0E0E0C;
    --paper: #F6F4EE;
    --paper-warm: #EFEBE0;
    --rule: rgba(14, 14, 12, 0.12);
    --rule-strong: rgba(14, 14, 12, 0.28);
    --muted: rgba(14, 14, 12, 0.62);
    --serif: "Cormorant Garamond", Georgia, serif;
    --sans: "Inter", system-ui, sans-serif;

    background: var(--paper);
    color: var(--ink);
    font-family: var(--sans);
    min-height: 100vh;
    padding-bottom: 120px;
  }
  .vw-tool * { box-sizing: border-box; }
  .vw-tool em { font-family: var(--serif); font-style: italic; font-weight: 400; }
  .vw-tool .display { font-family: var(--serif); font-weight: 400; line-height: 1.05; letter-spacing: -0.015em; }
  .vw-tool h1.display { font-size: clamp(40px, 5vw, 64px); }
  .vw-tool h2.display { font-size: clamp(32px, 4vw, 48px); }
  .vw-tool .lede { font-size: 18px; line-height: 1.6; color: rgba(14,14,12,0.78); }
  .vw-tool .muted { color: var(--muted); }
  .vw-tool .small { font-size: 13px; }
  .vw-tool .eyebrow { font-size: 11px; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted); }

  /* Header */
  .vw-header { border-bottom: 0.5px solid var(--rule); }
  .vw-header-inner {
    display: flex; justify-content: space-between; align-items: center;
    padding: 20px 40px;
  }
  .wordmark { font-family: var(--serif); font-size: 22px; font-style: italic; text-decoration: none; color: var(--ink); }
  .wordmark span { font-style: normal; }
  .brand-tag { font-family: var(--serif); font-size: 16px; }
  .step-indicator { font-size: 12px; color: var(--muted); letter-spacing: 0.05em; }
  .progress {
    display: flex; gap: 8px; padding: 16px 40px 20px;
    border-top: 0.5px solid var(--rule);
  }
  .tick {
    flex: 1; height: 28px;
    background: transparent;
    border: 0.5px solid var(--rule);
    cursor: pointer; padding: 0;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--serif); font-style: italic; font-size: 12px;
    color: var(--muted);
    transition: all 0.2s;
  }
  .tick.done { background: var(--ink); color: var(--paper); border-color: var(--ink); }
  .tick.current { background: var(--paper-warm); color: var(--ink); border-color: var(--ink); }
  .tick.locked { opacity: 0.4; cursor: not-allowed; }
  .tick:hover:not(.locked):not(.current) { border-color: var(--ink); color: var(--ink); }

  /* Examples button */
  .btn-examples {
    background: transparent;
    border: 0.5px solid var(--ink);
    padding: 8px 16px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-examples:hover {
    background: var(--ink);
    color: var(--paper);
  }

  /* Container */
  .container { max-width: 800px; margin: 0 auto; padding: 80px 40px 40px; }

  /* Welcome */
  .welcome { text-align: center; padding: 60px 0; }
  .welcome h1 { margin: 32px 0; }
  .welcome .lede { max-width: 560px; margin: 0 auto 48px; }
  .welcome-input { max-width: 480px; margin: 0 auto 32px; text-align: left; }
  .welcome-input label { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted); display: block; margin-bottom: 8px; }
  .welcome-input input {
    width: 100%; padding: 16px 0; border: none; border-bottom: 0.5px solid var(--ink);
    font-family: var(--serif); font-size: 24px; background: transparent; color: var(--ink); outline: none;
  }

  /* Step frame */
  .step-frame { padding-top: 20px; }
  .step-meta {
    display: flex; justify-content: space-between; align-items: baseline;
    border-top: 0.5px solid var(--rule); padding-top: 16px; margin-bottom: 32px;
  }
  .step-act { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted); }
  .step-num { font-family: var(--serif); font-style: italic; font-size: 24px; }
  .step-title { margin-bottom: 16px; }
  .step-subtitle { margin-bottom: 48px; max-width: 600px; }

  /* Quote */
  .vw-quote {
    border-left: 0.5px solid var(--rule-strong);
    padding: 4px 0 4px 24px;
    margin: 32px 0 48px;
    font-family: var(--serif); font-size: 19px; line-height: 1.5;
    color: rgba(14,14,12,0.78);
  }
  .vw-quote p { font-style: italic; margin: 0 0 8px; }
  .vw-quote footer { font-size: 13px; color: var(--muted); font-style: normal; }
  .vw-quote footer em { font-size: 14px; }

  /* Field */
  .field { margin-bottom: 28px; }
  .field-label { display: block; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--ink); margin-bottom: 6px; font-weight: 500; }
  .field-hint { font-size: 13px; color: var(--muted); margin-bottom: 12px; line-height: 1.5; }
  .vw-tool input[type="text"], .vw-tool textarea {
    width: 100%; padding: 12px 16px;
    border: 0.5px solid var(--rule-strong);
    background: var(--paper);
    font-family: var(--sans); font-size: 15px; line-height: 1.5;
    color: var(--ink); outline: none;
    transition: border-color 0.2s;
    resize: vertical;
  }
  .vw-tool input[type="text"]:focus, .vw-tool textarea:focus { border-color: var(--ink); }
  .vw-tool input::placeholder, .vw-tool textarea::placeholder { color: rgba(14,14,12,0.35); font-style: italic; }

  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 16px; }

  /* Buttons */
  .btn-primary {
    background: var(--ink); color: var(--paper);
    padding: 14px 28px; font-size: 13px; font-weight: 500;
    border: none; cursor: pointer; font-family: var(--sans);
    text-decoration: none; display: inline-flex; align-items: center; gap: 8px;
    transition: opacity 0.2s;
  }
  .btn-primary:hover:not(:disabled) { opacity: 0.85; }
  .btn-primary:disabled { opacity: 0.3; cursor: not-allowed; }
  .btn-primary.large { padding: 18px 40px; font-size: 14px; }
  .btn-primary.full { width: 100%; justify-content: center; }
  .btn-ghost {
    background: transparent; color: var(--ink); border: none; cursor: pointer;
    font-size: 13px; font-family: var(--sans); padding: 10px 0;
    border-bottom: 0.5px solid var(--ink);
  }
  .link-btn {
    background: transparent; border: none; cursor: pointer;
    font-family: var(--serif); font-style: italic; font-size: 14px;
    color: var(--muted); padding: 8px 0; text-decoration: underline;
  }
  .link-btn:hover { color: var(--ink); }

  /* Action verb helper */
  .verb-helper { margin-top: 8px; }
  .verb-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding: 16px; background: var(--paper-warm); margin-top: 12px; }
  .verb-cat { font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; }
  .verb-pill {
    display: block; width: 100%; text-align: left;
    background: transparent; border: none; padding: 4px 0;
    font-size: 13px; font-family: var(--sans); color: var(--ink); cursor: pointer;
  }
  .verb-pill:hover { font-style: italic; }

  /* Timeline */
  .timeline { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 32px 0 48px; }
  .timeline-col { padding-top: 16px; border-top: 1px solid var(--ink); }
  .timeline-label { font-family: var(--serif); font-size: 18px; margin-bottom: 4px; }
  .timeline-hint { font-size: 12px; color: var(--muted); margin-bottom: 12px; line-height: 1.4; }

  /* Quad (values exercise) */
  .quad { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--rule-strong); margin: 32px 0 48px; }
  .quad-cell { background: var(--paper); padding: 24px; }
  .quad-label { font-family: var(--serif); font-size: 18px; margin-bottom: 4px; }
  .quad-hint { font-size: 13px; color: var(--muted); margin-bottom: 12px; line-height: 1.5; }

  /* Values list */
  .values-list { margin-top: 24px; }
  .value-row { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
  .value-num { font-family: var(--serif); font-size: 20px; min-width: 40px; }
  .value-row input { flex: 1; }

  /* Divider */
  .divider { display: flex; align-items: center; gap: 16px; margin: 48px 0 32px; }
  .divider-line { flex: 1; height: 0.5px; background: var(--rule); }
  .divider-label { font-family: var(--serif); font-style: italic; font-size: 14px; color: var(--muted); }

  /* Synthesis card */
  .synthesis-card {
    background: var(--paper-warm); border: 0.5px solid var(--rule-strong);
    padding: 28px 32px; margin-top: 32px;
  }
  .sc-label { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; }
  .sc-formula { font-family: monospace; font-size: 12px; color: var(--muted); margin-bottom: 16px; }
  .sc-value { font-family: var(--serif); font-size: 22px; line-height: 1.4; min-height: 60px; }
  .sc-value em { font-style: italic; }
  .sc-value.empty { font-family: var(--sans); font-size: 14px; min-height: auto; }
  .sc-example { font-size: 13px; color: var(--muted); margin-top: 16px; padding-top: 16px; border-top: 0.5px solid var(--rule); }

  /* Awareness */
  .awareness-list { margin: 24px 0 32px; }
  .awareness-row {
    display: grid; grid-template-columns: 2fr 1.2fr 1.2fr 32px;
    gap: 16px; align-items: center; padding: 16px 0;
    border-bottom: 0.5px solid var(--rule);
  }
  .slider-group label { display: flex; justify-content: space-between; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; }
  .slider-val { font-family: var(--serif); font-style: italic; font-size: 14px; color: var(--ink); }
  .vw-tool input[type="range"] { width: 100%; }
  .x-btn { background: transparent; border: 0.5px solid var(--rule); width: 28px; height: 28px; cursor: pointer; font-size: 18px; color: var(--muted); }
  .x-btn:hover { border-color: var(--ink); color: var(--ink); }

  /* Quadrant */
  .quadrant { position: relative; height: 360px; margin: 48px 0; padding: 24px 60px; }
  .quadrant-grid { position: absolute; inset: 24px 60px; border: 0.5px solid var(--rule); background: var(--paper-warm); }
  .q-line-h { position: absolute; left: 0; right: 0; top: 50%; height: 0.5px; background: var(--rule-strong); }
  .q-line-v { position: absolute; top: 0; bottom: 0; left: 50%; width: 0.5px; background: var(--rule-strong); }
  .q-dot {
    position: absolute; width: 10px; height: 10px; background: var(--ink); border-radius: 50%;
    transform: translate(-50%, 50%);
  }
  .q-dot span {
    position: absolute; left: 14px; top: -4px; white-space: nowrap;
    font-family: var(--serif); font-style: italic; font-size: 12px; color: var(--ink);
  }
  .quadrant-y-label, .quadrant-x-label {
    position: absolute; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted);
  }
  .quadrant-y-label { left: 0; top: 24px; }
  .quadrant-y-label.bottom { top: auto; bottom: 0; }
  .quadrant-x-label.left { left: 60px; bottom: -2px; }
  .quadrant-x-label.right { right: 60px; bottom: -2px; }

  /* Paywall tease */
  .paywall-tease { margin-top: 48px; padding-top: 32px; border-top: 0.5px solid var(--ink); text-align: center; }
  .paywall-tease-text { font-family: var(--serif); font-size: 18px; color: var(--muted); }
  .paywall-tease-text em { color: var(--ink); }

  /* Archetype */
  .archetype-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 24px 0; }
  .archetype-card {
    background: var(--paper); border: 0.5px solid var(--rule-strong);
    padding: 16px; cursor: pointer; text-align: left; position: relative;
    transition: all 0.2s;
  }
  .archetype-card:hover { border-color: var(--ink); }
  .archetype-card.primary { background: var(--ink); color: var(--paper); border-color: var(--ink); }
  .archetype-card.secondary { background: var(--paper-warm); border-color: var(--ink); }
  .archetype-name { font-family: var(--serif); font-size: 18px; margin-bottom: 4px; }
  .archetype-desire { font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; opacity: 0.6; }
  .archetype-tag {
    position: absolute; top: 8px; right: 8px;
    font-family: var(--serif); font-style: italic; font-size: 12px;
  }

  /* Voice dials */
  .dial-list { margin: 32px 0; }
  .dial { padding: 20px 0; border-bottom: 0.5px solid var(--rule); }
  .dial-header { display: flex; justify-content: space-between; margin-bottom: 12px; }
  .dial-label { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--ink); font-weight: 500; }
  .dial-position { font-family: var(--serif); font-style: italic; font-size: 14px; color: var(--muted); }
  .dial-track { display: flex; align-items: center; gap: 16px; }
  .dial-end { font-size: 13px; color: var(--muted); min-width: 80px; }
  .dial-end.right { text-align: right; }
  .dial-track input[type="range"] { flex: 1; }

  /* Voice formula */
  .voice-formula { background: var(--paper-warm); padding: 24px; margin: 24px 0; }
  .vf-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 16px; font-family: var(--serif); font-size: 18px; }
  .vf-row:last-child { margin-bottom: 0; }
  .vf-row input { flex: 1; min-width: 120px; max-width: 200px; padding: 6px 10px !important; font-family: var(--serif) !important; font-style: italic; font-size: 18px !important; border-bottom: 0.5px solid var(--ink) !important; border-top: none !important; border-left: none !important; border-right: none !important; background: transparent !important; }

  /* Tagline types */
  .tagline-types { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin: 24px 0; }
  .tagline-type {
    background: var(--paper); border: 0.5px solid var(--rule-strong);
    padding: 16px; cursor: pointer; text-align: left;
    transition: all 0.2s; font-family: var(--sans);
  }
  .tagline-type:hover { border-color: var(--ink); }
  .tagline-type.active { background: var(--ink); color: var(--paper); border-color: var(--ink); }
  .tt-label { font-family: var(--serif); font-size: 16px; margin-bottom: 4px; }
  .tt-hint { font-size: 11px; opacity: 0.7; line-height: 1.4; margin-bottom: 8px; }
  .tt-eg { font-size: 12px; font-family: var(--serif); font-style: italic; opacity: 0.85; }

  /* Lock overlay */
  .lock-wrapper { position: relative; }
  .lock-wrapper.is-locked > *:not(.lock-veil) { filter: blur(4px); pointer-events: none; user-select: none; }
  .lock-veil {
    position: absolute; inset: 0;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 12px; z-index: 10;
    background: rgba(246, 244, 238, 0.5);
  }
  .lock-icon { width: 48px; height: 48px; border: 0.5px solid var(--ink); border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--paper); }
  .lock-msg { font-family: var(--serif); font-style: italic; font-size: 18px; }

  /* Paywall */
  .paywall-overlay {
    position: fixed; inset: 0; background: rgba(14, 14, 12, 0.7);
    display: flex; align-items: center; justify-content: center;
    z-index: 100; padding: 24px;
  }
  .paywall-card {
    background: var(--paper); max-width: 640px; width: 100%; max-height: 90vh; overflow-y: auto;
    padding: 48px 56px; position: relative;
  }
  .paywall-close { position: absolute; top: 16px; right: 16px; background: transparent; border: none; font-size: 24px; cursor: pointer; color: var(--muted); }
  .paywall-card h2 { margin: 16px 0 24px; }
  .paywall-card .lede { margin-bottom: 32px; }

  .locked-preview { background: var(--paper-warm); padding: 24px; margin-bottom: 32px; }
  .lp-label { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted); margin-bottom: 16px; }
  .lp-row { display: grid; grid-template-columns: 100px 1fr; gap: 16px; padding: 12px 0; border-top: 0.5px solid var(--rule); }
  .lp-key { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted); }
  .lp-val { font-family: var(--serif); font-size: 14px; line-height: 1.5; }
  .lp-row.blurred .lp-val { filter: blur(5px); user-select: none; }

  .paywall-pricing { text-align: center; padding-top: 32px; border-top: 0.5px solid var(--rule-strong); }

  /* Price block */
  .pp-price-row { display: flex; align-items: baseline; justify-content: center; gap: 14px; margin-bottom: 8px; flex-wrap: wrap; }
  .pp-original { font-family: var(--serif); font-size: 22px; color: var(--muted); text-decoration: line-through; }
  .pp-amount { font-family: var(--serif); font-size: 56px; line-height: 1; letter-spacing: -0.01em; }
  .pp-usd { font-family: var(--serif); font-style: italic; font-size: 18px; color: var(--muted); }
  .pp-sub { font-family: var(--serif); font-size: 14px; color: var(--muted); margin-bottom: 24px; }

  .paywall-pricing ul { list-style: none; padding: 0; margin: 0 0 24px; text-align: left; }
  .paywall-pricing ul li { padding: 10px 0; border-bottom: 0.5px solid var(--rule); font-size: 14px; display: flex; gap: 12px; }
  .paywall-pricing ul li::before { content: "—"; color: var(--muted); }

  /* Coupon block */
  .coupon-block {
    margin: 0 0 24px;
    padding: 16px 0;
    border-top: 0.5px solid var(--rule);
    border-bottom: 0.5px solid var(--rule);
    text-align: left;
  }
  .coupon-label {
    display: block;
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--ink);
    font-weight: 500;
    margin-bottom: 8px;
  }
  .coupon-input-group { display: flex; gap: 8px; }
  .coupon-input-group input {
    flex: 1;
    padding: 10px 12px !important;
    font-family: var(--sans) !important;
    font-size: 14px !important;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    border: 0.5px solid var(--rule-strong) !important;
    background: var(--paper) !important;
    color: var(--ink) !important;
    outline: none;
  }
  .coupon-input-group input::placeholder { text-transform: none; letter-spacing: normal; }
  .coupon-input-group input:focus { border-color: var(--ink) !important; }
  .coupon-input-group input.has-error { border-color: rgba(180, 30, 30, 0.6) !important; }
  .coupon-input-group input:disabled { opacity: 0.6; }

  .btn-secondary {
    background: transparent;
    color: var(--ink);
    border: 0.5px solid var(--ink);
    padding: 10px 18px;
    font-size: 13px;
    font-weight: 500;
    font-family: var(--sans);
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
    white-space: nowrap;
  }
  .btn-secondary:hover:not(:disabled) { background: var(--ink); color: var(--paper); }
  .btn-secondary:disabled { opacity: 0.4; cursor: not-allowed; }

  .coupon-error {
    margin-top: 8px;
    font-size: 12px;
    color: rgba(180, 30, 30, 0.85);
    font-family: var(--serif);
    font-style: italic;
  }

  .coupon-applied {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }
  .coupon-applied-info { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
  .coupon-tag {
    background: var(--ink);
    color: var(--paper);
    padding: 6px 12px;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.12em;
    flex-shrink: 0;
  }
  .coupon-message { font-size: 13px; color: var(--ink); }
  .coupon-message em { font-style: italic; }

  /* Footer */
  .vw-footer {
    position: fixed; bottom: 0; left: 0; right: 0;
    background: var(--paper); border-top: 0.5px solid var(--rule);
    padding: 16px 40px;
  }
  .vw-footer-inner {
    max-width: 800px; margin: 0 auto;
    display: flex; justify-content: space-between; align-items: center;
  }
  .footer-meta { font-size: 12px; color: var(--muted); font-family: var(--serif); }

  /* Mobile */
  @media (max-width: 720px) {
    .vw-header-inner, .progress { padding: 16px 20px; }
    .container { padding: 40px 20px 20px; }
    .grid-2, .timeline, .quad { grid-template-columns: 1fr; }
    .archetype-grid { grid-template-columns: repeat(2, 1fr); }
    .tagline-types { grid-template-columns: 1fr; }
    .awareness-row { grid-template-columns: 1fr; gap: 8px; }
    .paywall-card { padding: 32px 24px; }
    .vw-footer { padding: 12px 20px; }
    .footer-meta { display: none; }
  }
`;
