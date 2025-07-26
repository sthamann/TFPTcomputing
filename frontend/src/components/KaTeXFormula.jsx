import { InlineMath, BlockMath } from 'react-katex'

const KaTeXFormula = ({ formula, block = false }) => {
  // Convert formula syntax to LaTeX
  const latexFormula = formula
    .replace(/φ₀/g, '\\varphi_0')
    .replace(/φ/g, '\\varphi')
    .replace(/α/g, '\\alpha')
    .replace(/π/g, '\\pi')
    .replace(/√/g, '\\sqrt')
    .replace(/arccos/g, '\\arccos')
    .replace(/arcsin/g, '\\arcsin')
    .replace(/arctan/g, '\\arctan')

  if (block) {
    return <BlockMath math={latexFormula} />
  }

  return <InlineMath math={latexFormula} />
}

export default KaTeXFormula 