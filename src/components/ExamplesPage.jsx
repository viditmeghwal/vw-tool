// ═══════════════════════════════════════════════════════════════════════
// EXAMPLES PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════

import React from 'react';

// Brand Examples Data
const EXAMPLES = [
  {
    id: 'ekowear',
    category: 'Fashion',
    name: 'Eko Wear',
    tagline: 'Wear the change',
    purpose: 'We create sustainable fashion that doesn\'t compromise on style',
    vision: 'Global brand known for making eco-fashion accessible and desirable',
    values: ['Transparency', 'Innovation', 'Care'],
    fullData: {
      purposeWhat: 'We create sustainable fashion that doesn\'t compromise on style',
      purposeWhy: 'Because the fashion industry is the second-largest polluter globally',
      purposeContribution: 'By using 100% organic and recycled materials in every piece',
      purposeImpact: 'Reducing textile waste and creating a circular fashion economy',
      visionNow: 'A small online sustainable clothing brand with 500 loyal customers',
      vision5: 'Leading sustainable fashion brand in India with 50,000+ customers',
      vision10: 'Global brand known for making eco-fashion accessible and desirable',
      vision15: 'Transform industry standards — make sustainable the default, not premium',
      values: ['Transparency', 'Innovation', 'Care'],
      audienceLabel: 'Conscious Millennials',
      audienceGoals: 'Look good, feel good, do good — style without environmental guilt',
      audienceProblems: 'Sustainable fashion is expensive, boring, or hard to find',
      marketX: 'Fast fashion',
      marketY: 'Luxury eco-brands',
      marketDifference: 'Affordable sustainability without sacrificing design',
      marketBenefit: 'Style-first sustainable clothing at accessible prices',
      archetypePrimary: 'creator',
      archetypeSecondary: 'caregiver',
      attitudeLove: 'Innovation, transparency, authentic connection',
      attitudeHate: 'Greenwashing, waste, empty promises'
    }
  },
  {
    id: 'beanhouse',
    category: 'Cafe',
    name: 'Bean House',
    tagline: 'Your third place',
    purpose: 'We brew exceptional coffee and create warm gathering spaces',
    vision: 'Regional chain known for community-first cafe culture',
    values: ['Warmth', 'Quality', 'Connection'],
    fullData: {
      purposeWhat: 'We brew exceptional coffee and create warm gathering spaces',
      purposeWhy: 'Because everyone deserves a place to belong outside home and work',
      purposeContribution: 'By sourcing ethically and training baristas as community builders',
      purposeImpact: 'Bringing neighborhoods together, one cup at a time',
      visionNow: 'A beloved neighborhood cafe with a loyal morning crowd',
      vision5: '10 locations across the city, each a neighborhood anchor',
      vision10: 'Regional chain known for community-first cafe culture',
      vision15: 'Redefining what coffee shops mean to communities nationwide',
      values: ['Warmth', 'Quality', 'Connection'],
      audienceLabel: 'Community Seekers',
      audienceGoals: 'Find their "third place" — a familiar spot between home and work',
      audienceProblems: 'Coffee shops feel corporate, rushed, or pretentious',
      marketX: 'Chain cafes',
      marketY: 'Hipster coffee bars',
      marketDifference: 'Neighborhood warmth meets specialty quality',
      marketBenefit: 'Great coffee in a space that actually feels like home',
      archetypePrimary: 'everyman',
      archetypeSecondary: 'caregiver',
      attitudeLove: 'Familiar faces, real conversations, daily rituals',
      attitudeHate: 'Pretension, rushing, treating people like transactions'
    }
  },
  {
    id: 'mindflow',
    category: 'SaaS',
    name: 'MindFlow',
    tagline: 'Think clearly. Work better.',
    purpose: 'We build tools that help knowledge workers think and collaborate',
    vision: 'The standard for thought-work — as essential as email',
    values: ['Clarity', 'Focus', 'Craft'],
    fullData: {
      purposeWhat: 'We build tools that help knowledge workers think and collaborate',
      purposeWhy: 'Because information overload is killing productivity and creativity',
      purposeContribution: 'By creating calm, focused workspaces that connect ideas naturally',
      purposeImpact: 'Helping teams think clearer and work smarter without the chaos',
      visionNow: 'A productivity tool with 5,000 power users in tech and research',
      vision5: '500k users across industries trusting us for knowledge work',
      vision10: 'The standard for thought-work — as essential as email or spreadsheets',
      vision15: 'Fundamentally change how knowledge work happens in organizations',
      values: ['Clarity', 'Focus', 'Craft'],
      audienceLabel: 'Deep Workers',
      audienceGoals: 'Do meaningful work without constant context-switching',
      audienceProblems: 'Tools are bloated, distracting, built for "productivity theater"',
      marketX: 'Feature-bloated project tools',
      marketY: 'Minimalist note apps',
      marketDifference: 'Powerful without overwhelming — designed for focus',
      marketBenefit: 'Everything you need for knowledge work, nothing you don't',
      archetypePrimary: 'sage',
      archetypeSecondary: 'creator',
      attitudeLove: 'Deep work, thoughtful design, respect for users',
      attitudeHate: 'Feature bloat, dark patterns, treating attention as exploitable'
    }
  },
  {
    id: 'zenspace',
    category: 'Wellness',
    name: 'ZenSpace',
    tagline: 'Find your center',
    purpose: 'We create holistic wellness through yoga and mindfulness',
    vision: 'A wellness movement transforming how people approach health',
    values: ['Presence', 'Authenticity', 'Balance'],
    fullData: {
      purposeWhat: 'We create holistic wellness experiences through yoga and mindfulness',
      purposeWhy: 'Because modern life leaves people disconnected from themselves',
      purposeContribution: 'By making ancient practices accessible and relevant to today',
      purposeImpact: 'Helping people rediscover balance, peace, and authentic wellbeing',
      visionNow: 'A wellness studio serving 200 members in the heart of the city',
      vision5: 'Five studios and a thriving online community of 10,000 members',
      vision10: 'A wellness movement transforming how people approach health',
      vision15: 'Redefining wellness from reactive to proactive and holistic',
      values: ['Presence', 'Authenticity', 'Balance'],
      audienceLabel: 'Stressed Professionals',
      audienceGoals: 'Find lasting calm and energy, not just temporary relief',
      audienceProblems: 'Wellness feels inaccessible, woo-woo, or like another chore',
      marketX: 'Gym fitness',
      marketY: 'Spiritual retreats',
      marketDifference: 'Modern wellness grounded in ancient wisdom',
      marketBenefit: 'Accessible mindfulness that fits real life',
      archetypePrimary: 'sage',
      archetypeSecondary: 'caregiver',
      attitudeLove: 'Authenticity, growth, meeting people where they are',
      attitudeHate: 'Spiritual bypassing, elitism, quick-fix gimmicks'
    }
  },
  {
    id: 'craftkit',
    category: 'Education',
    name: 'CraftKit',
    tagline: 'Make with your hands. Learn with your heart.',
    purpose: 'We teach traditional crafts through hands-on workshops',
    vision: 'The go-to destination for learning traditional crafts globally',
    values: ['Heritage', 'Patience', 'Making'],
    fullData: {
      purposeWhat: 'We teach traditional crafts through hands-on workshops and kits',
      purposeWhy: 'Because making things by hand connects us to heritage and ourselves',
      purposeContribution: 'By preserving artisan skills and making them accessible to all',
      purposeImpact: 'Keeping traditional crafts alive while creating mindful makers',
      visionNow: 'A small studio offering weekend pottery and weaving workshops',
      vision5: 'Craft education platform with 50+ artisans and 20k students',
      vision10: 'The go-to destination for learning traditional crafts globally',
      vision15: 'Spark a global handmade renaissance and preserve artisan heritage',
      values: ['Heritage', 'Patience', 'Making'],
      audienceLabel: 'Creative Seekers',
      audienceGoals: 'Learn something real with their hands, not just screens',
      audienceProblems: 'Traditional crafts seem difficult, expensive, or old-fashioned',
      marketX: 'Online tutorials',
      marketY: 'Exclusive artisan apprenticeships',
      marketDifference: 'Guided hands-on craft learning for modern makers',
      marketBenefit: 'Learn timeless skills in a supportive, accessible way',
      archetypePrimary: 'creator',
      archetypeSecondary: 'sage',
      attitudeLove: 'Patience, mastery, passing down knowledge',
      attitudeHate: 'Rushed perfection, disposable culture, losing heritage'
    }
  }
];

export function ExamplesPage({ onLoadExample, onBack }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const categories = ['All', ...new Set(EXAMPLES.map(ex => ex.category))];
  
  const filteredExamples = selectedCategory === 'All' 
    ? EXAMPLES 
    : EXAMPLES.filter(ex => ex.category === selectedCategory);

  return (
    <div className="examples-page">
      <div className="examples-header">
        <button onClick={onBack} className="back-link">
          ← Back to tool
        </button>
        
        <h1 className="display">Brand Strategy <em>Examples</em></h1>
        
        <p className="lede">
          Real brand strategies across industries. Use these for inspiration
          or load one as a starting template for your own brand.
        </p>
        
        <div className="category-filters">
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="examples-grid">
        {filteredExamples.map(example => (
          <div key={example.id} className="example-card">
            <div className="example-header">
              <span className="example-category">{example.category}</span>
              <h3 className="example-name">{example.name}</h3>
              <p className="example-tagline">"{example.tagline}"</p>
            </div>
            
            <div className="example-preview">
              <div className="preview-row">
                <span className="preview-label">Purpose</span>
                <p className="preview-value">{example.purpose}</p>
              </div>
              <div className="preview-row">
                <span className="preview-label">Vision (10yr)</span>
                <p className="preview-value">{example.vision}</p>
              </div>
              <div className="preview-row">
                <span className="preview-label">Values</span>
                <p className="preview-value">{example.values.join(' · ')}</p>
              </div>
            </div>
            
            <button 
              className="btn-load-example"
              onClick={() => onLoadExample(example.fullData)}
            >
              Use as template →
            </button>
          </div>
        ))}
      </div>

      <style jsx>{`
        .examples-page {
          max-width: 1400px;
          margin: 0 auto;
          padding: 60px 40px 100px;
        }
        
        .examples-header {
          text-align: center;
          margin-bottom: 60px;
        }
        
        .back-link {
          background: transparent;
          border: none;
          color: var(--muted);
          font-size: 14px;
          cursor: pointer;
          margin-bottom: 24px;
          font-family: var(--sans);
          transition: color 0.2s;
        }
        .back-link:hover {
          color: var(--ink);
        }
        
        .examples-header h1 {
          font-size: clamp(40px, 5vw, 64px);
          margin: 16px 0 20px;
        }
        
        .examples-header .lede {
          max-width: 600px;
          margin: 0 auto 32px;
          font-size: 15px;
          line-height: 1.6;
          color: var(--muted);
        }
        
        .category-filters {
          display: flex;
          gap: 8px;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .filter-btn {
          background: transparent;
          border: 0.5px solid var(--rule-strong);
          padding: 8px 16px;
          font-size: 13px;
          font-family: var(--sans);
          cursor: pointer;
          transition: all 0.2s;
        }
        .filter-btn:hover {
          border-color: var(--ink);
        }
        .filter-btn.active {
          background: var(--ink);
          color: var(--paper);
          border-color: var(--ink);
        }
        
        .examples-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 32px;
        }
        
        .example-card {
          background: var(--paper);
          border: 0.5px solid var(--rule-strong);
          padding: 28px;
          transition: border-color 0.2s;
        }
        .example-card:hover {
          border-color: var(--ink);
        }
        
        .example-header {
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 0.5px solid var(--rule);
        }
        
        .example-category {
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--muted);
        }
        
        .example-name {
          font-family: var(--serif);
          font-size: 28px;
          font-weight: 400;
          margin: 8px 0 6px;
        }
        
        .example-tagline {
          font-family: var(--serif);
          font-style: italic;
          font-size: 15px;
          color: var(--muted);
        }
        
        .example-preview {
          margin-bottom: 24px;
        }
        
        .preview-row {
          padding: 12px 0;
          border-bottom: 0.5px solid var(--rule);
        }
        .preview-row:last-child {
          border-bottom: none;
        }
        
        .preview-label {
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--muted);
          display: block;
          margin-bottom: 6px;
        }
        
        .preview-value {
          font-size: 13px;
          line-height: 1.5;
        }
        
        .btn-load-example {
          width: 100%;
          background: transparent;
          border: 0.5px solid var(--ink);
          padding: 12px;
          cursor: pointer;
          font-size: 13px;
          font-family: var(--sans);
          transition: all 0.2s;
        }
        .btn-load-example:hover {
          background: var(--ink);
          color: var(--paper);
        }
        
        @media (max-width: 720px) {
          .examples-page {
            padding: 40px 20px 80px;
          }
          .examples-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default ExamplesPage;
export { EXAMPLES };
