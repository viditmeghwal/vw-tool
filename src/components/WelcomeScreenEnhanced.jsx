// ═══════════════════════════════════════════════════════════════════════
// ENHANCED WELCOME SCREEN WITH VIDEO (Like BrandStrategist.ai)
// ═══════════════════════════════════════════════════════════════════════
// Add this to your App.jsx to replace the existing renderWelcome function

import { HeroVideo, FeatureDemo } from './VideoDemo';

const renderWelcome = () => (
  <div className="welcome-screen">
    <div className="welcome-hero">
      <h1 className="welcome-title">
        Build Your Brand Strategy in <em>20 Minutes</em>
      </h1>
      <p className="welcome-subtitle">
        The same nine-step framework we use inside Virtue & Wisdom,
        now self-serve. First six steps free.
      </p>
      
      {/* HERO VIDEO - Record 30sec demo of tool flow */}
      <HeroVideo src="/videos/hero-demo" />
      
      <div className="welcome-actions">
        <button 
          className="btn-primary-large"
          onClick={() => setStep(1)}
        >
          Start Building Your Strategy
        </button>
        <button 
          className="btn-secondary-large"
          onClick={() => setStep(11)}
        >
          See Examples
        </button>
      </div>
    </div>

    {/* HOW IT WORKS SECTION */}
    <section className="how-it-works">
      <h2 className="section-title">How it <em>works</em></h2>
      
      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-number">1</div>
          <h3>Answer Guided Questions</h3>
          <p>Walk through nine strategic steps designed by brand strategists</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-number">2</div>
          <h3>Get AI Assistance</h3>
          <p>Generate suggestions with one click, then edit to match your vision</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-number">3</div>
          <h3>Export Your Strategy</h3>
          <p>Download a complete one-page strategy document</p>
        </div>
      </div>
    </section>

    {/* FEATURE DEMOS */}
    <section className="feature-demos">
      {/* AI GENERATION DEMO */}
      <FeatureDemo
        title="AI-Powered Generation"
        description="Click ✨ Generate with AI and watch your brand strategy come to life"
        videoSrc="/videos/ai-generation"
        poster="/videos/ai-generation-poster.jpg"
      />
      
      {/* EXAMPLES DEMO */}
      <FeatureDemo
        title="Start from Examples"
        description="Browse real brand strategies and use any as a starting template"
        videoSrc="/videos/examples-loading"
        poster="/videos/examples-loading-poster.jpg"
      />
    </section>

    {/* PRICING PREVIEW */}
    <section className="pricing-preview">
      <div className="pricing-card">
        <div className="pricing-badge">Launch Offer</div>
        <div className="pricing-amount">
          <span className="currency">₹</span>
          <span className="price">349</span>
          <span className="original">₹449</span>
        </div>
        <p className="pricing-description">
          First 6 steps free • Full strategy for ₹349 • No subscription
        </p>
        <ul className="pricing-features">
          <li>Nine-step strategic framework</li>
          <li>AI-powered generation</li>
          <li>Example templates</li>
          <li>One-page strategy document</li>
        </ul>
        <button 
          className="btn-primary-large"
          onClick={() => setStep(1)}
        >
          Start Free
        </button>
      </div>
    </section>

    <style jsx>{`
      .welcome-screen {
        max-width: 1200px;
        margin: 0 auto;
        padding: 60px 40px 100px;
      }
      
      .welcome-hero {
        text-align: center;
        margin-bottom: 100px;
      }
      
      .welcome-title {
        font-family: var(--serif);
        font-size: clamp(40px, 6vw, 72px);
        font-weight: 400;
        line-height: 1.1;
        margin-bottom: 24px;
      }
      
      .welcome-title em {
        font-style: italic;
      }
      
      .welcome-subtitle {
        font-size: 18px;
        line-height: 1.6;
        color: var(--muted);
        max-width: 600px;
        margin: 0 auto 60px;
      }
      
      .welcome-actions {
        display: flex;
        gap: 16px;
        justify-content: center;
        flex-wrap: wrap;
        margin-top: 40px;
      }
      
      .btn-primary-large {
        background: var(--ink);
        color: var(--paper);
        border: none;
        padding: 16px 32px;
        font-size: 16px;
        font-family: var(--sans);
        cursor: pointer;
        transition: all 0.2s;
        font-weight: 500;
      }
      
      .btn-primary-large:hover {
        background: rgba(14, 14, 12, 0.85);
        transform: translateY(-2px);
      }
      
      .btn-secondary-large {
        background: transparent;
        color: var(--ink);
        border: 0.5px solid var(--ink);
        padding: 16px 32px;
        font-size: 16px;
        font-family: var(--sans);
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .btn-secondary-large:hover {
        background: var(--ink);
        color: var(--paper);
      }
      
      .how-it-works {
        margin: 100px 0;
        text-align: center;
      }
      
      .section-title {
        font-family: var(--serif);
        font-size: clamp(32px, 4vw, 48px);
        font-weight: 400;
        margin-bottom: 60px;
      }
      
      .section-title em {
        font-style: italic;
      }
      
      .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 40px;
        max-width: 1000px;
        margin: 0 auto;
      }
      
      .feature-card {
        text-align: center;
        padding: 32px;
      }
      
      .feature-number {
        width: 56px;
        height: 56px;
        border: 0.5px solid var(--ink);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 20px;
        font-family: var(--serif);
        font-size: 24px;
      }
      
      .feature-card h3 {
        font-family: var(--serif);
        font-size: 22px;
        font-weight: 400;
        margin-bottom: 12px;
      }
      
      .feature-card p {
        font-size: 14px;
        line-height: 1.6;
        color: var(--muted);
      }
      
      .feature-demos {
        margin: 100px 0;
      }
      
      .pricing-preview {
        margin: 100px 0;
        display: flex;
        justify-content: center;
      }
      
      .pricing-card {
        max-width: 450px;
        border: 0.5px solid var(--rule-strong);
        padding: 48px 40px;
        text-align: center;
        background: var(--paper);
      }
      
      .pricing-badge {
        font-size: 11px;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: var(--muted);
        margin-bottom: 24px;
      }
      
      .pricing-amount {
        display: flex;
        align-items: baseline;
        justify-content: center;
        gap: 12px;
        margin-bottom: 16px;
      }
      
      .currency {
        font-family: var(--serif);
        font-size: 24px;
      }
      
      .price {
        font-family: var(--serif);
        font-size: 64px;
        line-height: 1;
      }
      
      .original {
        font-size: 20px;
        color: var(--muted);
        text-decoration: line-through;
      }
      
      .pricing-description {
        font-size: 14px;
        color: var(--muted);
        margin-bottom: 32px;
        padding-bottom: 24px;
        border-bottom: 0.5px solid var(--rule);
      }
      
      .pricing-features {
        list-style: none;
        padding: 0;
        margin: 0 0 32px;
        text-align: left;
      }
      
      .pricing-features li {
        padding: 10px 0;
        font-size: 14px;
        border-bottom: 0.5px solid var(--rule);
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .pricing-features li::before {
        content: "✓";
        color: var(--ink);
        font-weight: 500;
      }
      
      @media (max-width: 720px) {
        .welcome-screen {
          padding: 40px 20px 60px;
        }
        
        .welcome-hero {
          margin-bottom: 60px;
        }
        
        .features-grid {
          grid-template-columns: 1fr;
        }
        
        .pricing-card {
          padding: 32px 24px;
        }
        
        .how-it-works,
        .feature-demos,
        .pricing-preview {
          margin: 60px 0;
        }
      }
    `}</style>
  </div>
);

export default renderWelcome;
