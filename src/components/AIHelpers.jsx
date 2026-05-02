// ═══════════════════════════════════════════════════════════════════════
// AI HELPER COMPONENT - Drop this into your existing App.jsx
// ═══════════════════════════════════════════════════════════════════════

// Add this function near the top of App.jsx, after your constants
async function generateWithClaude(prompt, currentData) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `${prompt}\n\nCurrent brand context:\n- Brand: ${currentData.brandName || 'Not set'}\n- Purpose: ${currentData.purposeWhat || 'Not set'}\n- Vision: ${currentData.vision10 || 'Not set'}\n- Values: ${currentData.values?.filter(Boolean).join(', ') || 'Not set'}\n\nProvide ONLY the generated content, no preamble or explanation.`
        }]
      })
    });

    const data = await response.json();
    return data.content?.find(b => b.type === 'text')?.text?.trim() || '';
  } catch (error) {
    console.error('AI error:', error);
    throw new Error('AI generation failed. Please try again.');
  }
}

// AI Button Component
export function AIGenerateButton({ field, label = "✨ Generate with AI", onGenerate, loading, disabled }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleClick = async () => {
    if (disabled || isGenerating) return;
    setIsGenerating(true);
    try {
      await onGenerate();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button 
      className="btn-ai-generate"
      onClick={handleClick}
      disabled={disabled || isGenerating || loading}
      type="button"
    >
      {isGenerating || loading ? '⏳ Generating...' : label}
    </button>
  );
}

// Field Helper Component
export function FieldHelper({ fieldKey, helpers }) {
  const [isOpen, setIsOpen] = useState(false);
  const helper = helpers[fieldKey];
  
  if (!helper) return null;

  return (
    <div className="field-helper">
      <button 
        type="button"
        className="helper-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '▼' : '▶'} How to fill this
      </button>
      
      {isOpen && (
        <div className="helper-content">
          <p className="helper-hint">{helper.hint}</p>
          <div className="helper-example">
            <strong>Good:</strong> {helper.good}
          </div>
          <div className="helper-avoid">
            <strong>Avoid:</strong> {helper.avoid}
          </div>
        </div>
      )}
    </div>
  );
}

// AI Prompt Templates
export const AI_PROMPTS = {
  purposeWhat: 'Write a clear 1-sentence "what we do" statement for this brand. Make it specific, jargon-free, and compelling.',
  
  purposeWhy: 'Write a compelling "why it matters" statement explaining the problem this brand solves in the world.',
  
  purposeContribution: 'Write a "how we do it" statement explaining the unique approach or method this brand uses.',
  
  purposeImpact: 'Write the ultimate impact or change this brand wants to create in the world.',
  
  vision5: 'Write a concrete, measurable 5-year vision with specific numbers or milestones.',
  
  vision10: 'Write an ambitious but believable 10-year vision that expands reach and impact.',
  
  vision15: 'Write a transformative 15-year vision about changing the industry or category itself.',
  
  values: 'Based on the negative and positive experiences shared, suggest 3 core values (single powerful words) that would guide this brand. Return ONLY the 3 words, one per line.',
  
  audienceGoals: 'Describe what the target audience wants to achieve or become, based on the brand purpose.',
  
  audienceProblems: 'Describe the specific problems preventing the audience from achieving their goals.',
  
  marketDifference: 'Write a unique positioning statement that bridges the gap between the two market extremes.',
  
  marketBenefit: 'Write a clear benefit statement explaining why customers should care about this unique position.',
  
  archetypes: `Based on the brand's purpose, values, and positioning, suggest TWO archetypes:
1. Primary archetype (70%) 
2. Secondary archetype (30%)

Choose ONLY from these: Innocent, Sage, Explorer, Outlaw, Magician, Hero, Lover, Jester, Everyman, Caregiver, Ruler, Creator

Return ONLY two archetype names, one per line, no explanations.`,
  
  attitudeLove: 'Based on the brand personality, write what this brand loves and stands for (3-5 things).',
  
  attitudeHate: 'Based on the brand personality, write what this brand hates and fights against (3-5 things).',
  
  taglineDrafts: `Generate 5 tagline options in different styles:
1. Imperative (commands action, starts with verb)
2. Descriptive (describes the promise)
3. Superlative (positions as best)
4. Provocative (asks a question)
5. Specific (reveals the category)

Format as:
1. [tagline]
2. [tagline]
3. [tagline]
4. [tagline]
5. [tagline]`
};

// CSS Styles - Add these to your existing styles
export const AI_STYLES = `
/* AI Generate Button */
.btn-ai-generate {
  background: var(--ink);
  color: var(--paper);
  border: none;
  padding: 10px 18px;
  font-size: 13px;
  font-family: var(--sans);
  cursor: pointer;
  margin-top: 8px;
  transition: all 0.2s;
  font-weight: 500;
}
.btn-ai-generate:hover:not(:disabled) {
  background: rgba(14, 14, 12, 0.85);
  transform: translateY(-1px);
}
.btn-ai-generate:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Field Helper */
.field-helper {
  margin: 8px 0 12px;
}
.helper-toggle {
  background: transparent;
  border: none;
  color: var(--muted);
  font-size: 12px;
  cursor: pointer;
  padding: 4px 0;
  text-align: left;
  font-family: var(--sans);
  transition: color 0.2s;
}
.helper-toggle:hover {
  color: var(--ink);
}
.helper-content {
  background: var(--paper-warm);
  padding: 16px;
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.6;
  border-left: 2px solid var(--ink);
}
.helper-hint {
  margin-bottom: 12px;
  color: var(--ink);
  font-weight: 500;
}
.helper-example, .helper-avoid {
  padding: 8px 12px;
  margin: 8px 0;
  background: rgba(255, 255, 255, 0.5);
}
.helper-example strong {
  color: rgba(14, 14, 12, 0.8);
  font-weight: 500;
}
.helper-avoid {
  opacity: 0.75;
}
.helper-avoid strong {
  color: var(--muted);
}
`;
