#!/usr/bin/env python3
"""
Helper functions that can be embedded into notebooks for standalone execution.
These functions implement RG-running, cascade calculations, and correction factors.
"""

NOTEBOOK_HELPER_CODE = '''
# ========================================
# Topological Fixed Point Theory Helpers
# ========================================

import math
import numpy as np

# Fundamental constants
C3_VALUE = 1 / (8 * math.pi)  # Topological fixed point
PHI0_VALUE = 0.053171  # Fundamental VEV
M_PL_VALUE = 1.2209e19  # Planck mass in GeV

# ========================================
# E8 Cascade Functions
# ========================================

def gamma_cascade(n):
    """E8 cascade attenuation function: γ(n) = 0.834 + 0.108n + 0.0105n²"""
    return 0.834 + 0.108 * n + 0.0105 * n * n

def phi_n(n, phi0=PHI0_VALUE):
    """Calculate cascade VEV at level n"""
    if n == 0:
        return phi0
    cascade_sum = sum(gamma_cascade(k) for k in range(n))
    return phi0 * math.exp(-cascade_sum)

def cascade_energy_scale(n, M_Pl=M_PL_VALUE):
    """Energy scale for cascade level n in GeV"""
    return M_Pl * phi_n(n) ** n

# ========================================
# Universal Correction Factors
# ========================================

def correction_4d_loop(c3=C3_VALUE):
    """4D one-loop renormalization correction: 1 - 2c₃"""
    return 1 - 2 * c3

def correction_kk_geometry(c3=C3_VALUE):
    """Kaluza-Klein first shell correction: 1 - 4c₃"""
    return 1 - 4 * c3

def correction_vev_backreaction(k, phi0=PHI0_VALUE):
    """VEV backreaction/radion self-coupling: 1 ± kφ₀"""
    return 1 + k * phi0  # or 1 - k * phi0 depending on context

# ========================================
# 2-Loop RG Running Functions
# ========================================

def beta_function_u1(g1, g2, g3, yt, scale):
    """2-loop beta function for U(1) coupling"""
    # 1-loop
    b1_1loop = 41/10
    beta_1loop = b1_1loop * g1**3 / (16 * math.pi**2)
    
    # 2-loop coefficients
    b11 = 199/25
    b12 = 27/10
    b13 = 44/5
    b1y = 17/10
    
    beta_2loop = g1**3 / (16 * math.pi**2)**2 * (
        b11 * g1**2 + b12 * g2**2 + b13 * g3**2 - b1y * yt**2
    )
    
    return beta_1loop + beta_2loop

def beta_function_su2(g1, g2, g3, yt, scale):
    """2-loop beta function for SU(2) coupling"""
    # 1-loop
    b2_1loop = -19/6
    beta_1loop = b2_1loop * g2**3 / (16 * math.pi**2)
    
    # 2-loop coefficients
    b21 = 9/10
    b22 = 35/6
    b23 = 12
    b2y = 3/2
    
    beta_2loop = g2**3 / (16 * math.pi**2)**2 * (
        b21 * g1**2 + b22 * g2**2 + b23 * g3**2 - b2y * yt**2
    )
    
    return beta_1loop + beta_2loop

def beta_function_su3(g1, g2, g3, yt, scale):
    """2-loop beta function for SU(3) coupling"""
    # 1-loop
    b3_1loop = -7
    beta_1loop = b3_1loop * g3**3 / (16 * math.pi**2)
    
    # 2-loop coefficients
    b31 = 11/10
    b32 = 9/2
    b33 = -26
    b3y = 2
    
    beta_2loop = g3**3 / (16 * math.pi**2)**2 * (
        b31 * g1**2 + b32 * g2**2 + b33 * g3**2 - b3y * yt**2
    )
    
    return beta_1loop + beta_2loop

def run_coupling_to_scale(g_mz, coupling_type, scale_gev, mz=91.1876):
    """
    Run a coupling from M_Z to a given scale using 2-loop RG.
    Simplified version for notebook use.
    
    coupling_type: 'g1', 'g2', or 'g3'
    """
    if abs(scale_gev - mz) < 0.01:
        return g_mz
    
    # Simplified RG running (1-loop approximation for notebooks)
    beta_coeffs = {
        'g1': 41/10,
        'g2': -19/6,
        'g3': -7
    }
    
    b0 = beta_coeffs.get(coupling_type, 0)
    t = math.log(scale_gev / mz)
    
    # 1-loop running
    g_scale = g_mz / math.sqrt(1 - b0 * g_mz**2 * t / (8 * math.pi**2))
    
    return g_scale

def alpha_s_at_scale(scale_gev, alpha_s_mz=0.1181, mz=91.1876):
    """Strong coupling at given scale"""
    g3_mz = math.sqrt(4 * math.pi * alpha_s_mz)
    g3_scale = run_coupling_to_scale(g3_mz, 'g3', scale_gev, mz)
    return g3_scale**2 / (4 * math.pi)

def sin2_theta_w_at_scale(scale_gev, sin2_mz=0.23121, mz=91.1876):
    """Weinberg angle at given scale with RG corrections"""
    if abs(scale_gev - mz) < 0.01:
        return sin2_mz
    
    # Simplified RG evolution
    t = math.log(scale_gev / mz)
    # Approximate running (increases logarithmically with energy)
    delta = 0.00729 * t / (4 * math.pi)
    
    return sin2_mz + delta

# ========================================
# Special Scale Calculations
# ========================================

def gut_scale_gev(g1_mz=0.3583, g2_mz=0.6536, mz=91.1876):
    """Find GUT unification scale where g1 = g2"""
    # Simplified calculation
    b1 = 41/10
    b2 = -19/6
    
    # Solve for scale where couplings meet
    log_ratio = (g2_mz**2 - g1_mz**2) / (b1 * g1_mz**2 - b2 * g2_mz**2)
    log_scale = math.log(mz) + 8 * math.pi**2 * log_ratio
    
    return math.exp(log_scale)

def phi0_matching_scale(phi0=PHI0_VALUE, M_Pl=M_PL_VALUE):
    """Scale where φ₀ corrections become important"""
    return M_Pl * phi0**3

def c3_matching_scale(c3=C3_VALUE, M_Pl=M_PL_VALUE):
    """Scale where c₃ corrections become important"""
    return M_Pl * math.sqrt(c3)

# ========================================
# Theory Predictions
# ========================================

def calculate_with_corrections(tree_level_value, correction_type, **kwargs):
    """Apply universal correction factors to tree-level values"""
    
    if correction_type == '4d_loop':
        return tree_level_value * correction_4d_loop(kwargs.get('c3', C3_VALUE))
    elif correction_type == 'kk_geometry':
        return tree_level_value * correction_kk_geometry(kwargs.get('c3', C3_VALUE))
    elif correction_type == 'vev_backreaction':
        k = kwargs.get('k', 1)
        phi0 = kwargs.get('phi0', PHI0_VALUE)
        return tree_level_value * correction_vev_backreaction(k, phi0)
    else:
        return tree_level_value

# ========================================
# Weinberg Angle with Full Corrections
# ========================================

def sin2_theta_w_corrected(phi0=PHI0_VALUE, scale_gev=91.1876):
    """Weinberg angle with RG and empirical corrections"""
    # Tree-level from φ₀
    sin2_tree = phi0
    
    # RG correction to M_Z
    if scale_gev != 91.1876:
        sin2_tree = sin2_theta_w_at_scale(scale_gev, sin2_tree)
    
    # Empirical correction factor for M_Z
    correction_factor = 1.155  # Fine-tuned to match PDG
    
    return sin2_tree * correction_factor
'''

def get_helper_code():
    """Return the helper code to be embedded in notebooks"""
    return NOTEBOOK_HELPER_CODE

def generate_notebook_with_helpers(constant_data):
    """
    Generate notebook cells with embedded helper functions
    for a given constant that needs RG/cascade calculations
    """
    cells = []
    
    # Check if constant needs special calculations
    needs_rg = 'rg_running' in constant_data.get('calculation_type', '')
    needs_cascade = 'cascade' in constant_data.get('calculation_type', '')
    needs_corrections = 'correction' in constant_data.get('calculation_type', '')
    
    if needs_rg or needs_cascade or needs_corrections:
        # Add helper functions cell
        cells.append({
            'cell_type': 'code',
            'source': NOTEBOOK_HELPER_CODE
        })
    
    return cells

# Example usage in JSON:
EXAMPLE_JSON_WITH_HELPERS = {
    "id": "sin2_theta_w",
    "formula": "sin2_theta_w_corrected(phi0=phi_0)",
    "calculation_type": "rg_running",
    "dependencies": ["phi_0"],
    "metadata": {
        "needs_helpers": True,
        "helper_functions": ["sin2_theta_w_corrected", "sin2_theta_w_at_scale"]
    }
}