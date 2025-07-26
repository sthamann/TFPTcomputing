// Declarative constant evaluation engine
// Safely evaluates formula strings with variable substitution

import { evaluate, parse, MathNode } from 'mathjs';
import type { ConstantDefinition, ConstantResult } from './types';

/**
 * Convert a formula string to LaTeX notation
 */
function convertToLatex(formula: string): string {
  return formula
    // Handle exponents
    .replace(/\^(\d+)/g, '^{$1}')
    .replace(/\^([A-Za-z_][A-Za-z0-9_]*)/g, '^{$1}')
    // Handle fractions
    .replace(/([^/]+)\/([^/]+)/g, '\\frac{$1}{$2}')
    // Handle Greek letters and special symbols
    .replace(/PHI0/g, '\\phi_0')
    .replace(/PI/g, '\\pi')
    .replace(/ALPHA/g, '\\alpha')
    .replace(/HBAR/g, '\\hbar')
    .replace(/G_FERMI/g, 'G_F')
    .replace(/M_PLANCK_GEV/g, 'M_{Pl}')
    .replace(/M_MUON/g, 'm_\\mu')
    .replace(/M_TAU/g, 'm_\\tau')
    .replace(/M_ELECTRON/g, 'm_e')
    .replace(/M_W/g, 'M_W')
    .replace(/M_Z/g, 'M_Z')
    .replace(/C3/g, 'c_3');
}

/**
 * Convert variable names to LaTeX
 */
function latexifyVariableName(varName: string): string {
  const latexMap: Record<string, string> = {
    PHI0: '\\phi_0',
    PI: '\\pi',
    ALPHA: '\\alpha',
    HBAR: '\\hbar',
    G_FERMI: 'G_F',
    M_PLANCK_GEV: 'M_{Pl}',
    M_MUON: 'm_\\mu',
    M_TAU: 'm_\\tau',
    M_ELECTRON: 'm_e',
    M_W: 'M_W',
    M_Z: 'M_Z',
    C3: 'c_3'
  };
  
  return latexMap[varName] || varName;
}

/**
 * Format numbers for scientific display
 */
function formatScientific(value: number): string {
  if (Math.abs(value) > 1000 || (Math.abs(value) < 0.001 && value !== 0)) {
    const exp = value.toExponential(3);
    const [mantissa, exponent] = exp.split('e');
    return `${mantissa} \\times 10^{${parseInt(exponent)}}`;
  } else {
    return value.toPrecision(6);
  }
}

/**
 * Substitute variables in formula for display
 */
function substituteVariables(formula: string, variables: Record<string, any>): string {
  let substituted = formula;
  
  // Sort by length (longest first) to avoid partial replacements
  const sortedVars = Object.keys(variables).sort((a, b) => b.length - a.length);
  
  sortedVars.forEach(varName => {
    const value = variables[varName];
    if (typeof value === 'number') {
      const formattedValue = formatScientific(value);
      substituted = substituted.replace(new RegExp(varName, 'g'), formattedValue);
    } else if (typeof value === 'function') {
      // Handle function variables like sqrt
      substituted = substituted.replace(new RegExp(varName, 'g'), varName);
    }
  });
  
  return convertToLatex(substituted);
}

/**
 * Safely evaluate a constant's formula with its variables
 */
export function evaluateConstant(constant: ConstantDefinition): number {
  try {
    // Create a scope with variables, including Math functions
    const scope = {
      ...constant.variables,
      sqrt: Math.sqrt,
      exp: Math.exp,
      log: Math.log,
      ln: Math.log,
      PI: Math.PI,
      E: Math.E,
    };
    
    return evaluate(constant.formula, scope);
  } catch (error) {
    console.error(`Error evaluating ${constant.symbol}:`, error);
    return NaN;
  }
}

/**
 * Generate real-time calculation steps with LaTeX formatting
 */
export function buildCalculationSteps(constant: ConstantDefinition): string[] {
  const steps: string[] = [];
  
  try {
    // Header
    steps.push(`### ${constant.name} Calculation`);
    steps.push('');
    
    // Description
    steps.push('**Theory:**');
    steps.push(constant.description);
    steps.push('');
    
    // Variable definitions with live values
    steps.push('**Input Parameters:**');
    Object.entries(constant.variables).forEach(([varName, value]) => {
      if (typeof value === 'number') {
        const formattedValue = formatScientific(value);
        steps.push(`- $${latexifyVariableName(varName)} = ${formattedValue}$`);
      }
    });
    
    steps.push('');
    
    // Formula in LaTeX (use custom LaTeX if available, otherwise convert)
    const latexFormula = (constant as any).latexFormula || convertToLatex(constant.formula);
    steps.push('**Formula:**');
    steps.push(`$$${latexFormula}$$`);
    steps.push('');
    
    // Live calculation result
    const result = evaluateConstant(constant);
    steps.push('**Calculation:**');
    if (isNaN(result)) {
      steps.push('*Error: Could not evaluate formula*');
    } else {
      const formattedResult = formatScientific(result);
      steps.push(`$$${constant.symbol} = ${formattedResult}\\text{ ${constant.unit}}$$`);
    }
    
    // Comparison with measurement
    if (constant.measured !== undefined && !isNaN(result)) {
      steps.push('');
      steps.push('**Comparison with Experiment:**');
      const formattedMeasured = formatScientific(constant.measured);
      steps.push(`- Experimental: $${formattedMeasured}\\text{ ${constant.unit}}$`);
      steps.push(`- Theoretical: $${formatScientific(result)}\\text{ ${constant.unit}}$`);
      
      const deviation = ((result - constant.measured) / constant.measured) * 100;
      const deviationColor = Math.abs(deviation) < 1 ? 'green' : Math.abs(deviation) < 10 ? 'orange' : 'red';
      steps.push(`- Deviation: $\\color{${deviationColor}}{${deviation.toFixed(3)}\\%}$`);
    }
    
  } catch (error) {
    steps.push('*Error generating calculation steps*');
    steps.push(`\`${error}\``);
  }
  
  return steps;
}

/**
 * Calculate a constant with full result including steps and deviation
 */
export function calculateConstantWithSteps(constant: ConstantDefinition): ConstantResult {
  const value = evaluateConstant(constant);
  const steps = buildCalculationSteps(constant);
  
  let deviation: number | undefined;
  let deviationPercent: number | undefined;
  
  if (constant.measured !== undefined && !isNaN(value)) {
    deviation = value - constant.measured;
    deviationPercent = (deviation / constant.measured) * 100;
  }
  
  return {
    value,
    steps,
    deviation,
    deviationPercent
  };
}

/**
 * Validate that all variables in a formula are defined
 */
export function validateConstant(constant: ConstantDefinition): string[] {
  const errors: string[] = [];
  
  try {
    const tree = parse(constant.formula);
    const usedVariables = new Set<string>();
    
    tree.traverse((node: MathNode) => {
      if (node.isSymbolNode) {
        usedVariables.add(node.name);
      }
    });
    
    // Check for undefined variables
    usedVariables.forEach(varName => {
      if (!(varName in constant.variables)) {
        errors.push(`Undefined variable: ${varName}`);
      }
    });
    
    // Check for unused variables
    Object.keys(constant.variables).forEach(varName => {
      if (!usedVariables.has(varName)) {
        errors.push(`Unused variable: ${varName}`);
      }
    });
    
  } catch (error) {
    errors.push(`Formula parsing error: ${error}`);
  }
  
  return errors;
}