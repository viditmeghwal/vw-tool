import React from 'react';

// Field Helper Component
export function FieldHelper({ fieldKey, helpers }) {
  const helper = helpers[fieldKey];
  if (!helper) return null;

  return (
    <div className="field-helper">
      <div className="helper-hint">💡 {helper.hint}</div>
      {helper.good && <div className="helper-good">✓ Good: {helper.good}</div>}
      {helper.avoid && <div className="helper-avoid">✗ Avoid: {helper.avoid}</div>}
    </div>
  );
}

// AI Generate Button
export function AIGenerateButton({ field, onGenerate, loading }) {
  return (
    <button
      type="button"
      className="ai-generate-btn"
      onClick={onGenerate}
      disabled={loading}
    >
      {loading ? '⏳ Generating...' : '✨ AI Generate'}
    </button>
  );
}

// AI Prompts
export const AI_PROMPTS = {
  purposeWhat: 'Generate a clear, compelling "what we do" statement for this brand in 1-2 sentences.',
  purposeWhy: 'Explain why this brand exists and what problem it solves in 2-3 sentences.',
  purposeContribution: 'Describe how this brand uniquely contributes to solving the problem.',
  purposeImpact: 'Describe the ultimate positive impact this brand aims to create.',
  vision5: 'Write a concrete 5-year vision milestone for this brand.',
  vision10: 'Write an ambitious but achievable 10-year vision for this brand.',
  vision15: 'Write a transformative 15-year vision for this brand.',
  audienceGoals: 'Describe what the target audience wants to achieve.',
  audienceProblems: 'Describe the problems preventing the audience from their goals.',
  marketDifference: 'Explain what makes this brand different from competitors.',
  marketBenefit: 'Describe the key benefit customers get from this brand.'
};
