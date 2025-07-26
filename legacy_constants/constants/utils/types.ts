// New declarative constant definition system
// Single source of truth with formula strings instead of calculate functions

export interface ConstantDefinition {
  symbol: string;
  name: string;
  description: string;
  formula: string;          // executable formula string
  variables: Record<string, number>; // all variables used in formula
  unit: string;
  measured?: number;
  uncertainty?: number;
  source?: string;
  category: string;
  note?: string;            // optional note for display (e.g., "≈ 7 % high; RG + pole-shift expected")
}

// Enhanced constant with calculated value and additional properties
export interface EnhancedConstantDefinition extends ConstantDefinition {
  value?: number;           // calculated value
  latexFormula?: string;    // LaTeX representation for display
}

export interface CalculationStep {
  variable: string;
  value: number;
  description?: string;
}

export interface ConstantResult {
  value: number;
  steps: string[];
  deviation?: number;
  deviationPercent?: number;
}