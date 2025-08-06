#!/usr/bin/env python3
"""
Corrected formulas for all constants based on Topological Fixed Point Theory
This replaces the old formula definitions with the correct theoretical structure
"""

# FUNDAMENTAL THEORY CONSTANTS (only true inputs)
FUNDAMENTAL_CONSTANTS = {
    "c_3": {
        "formula": "1/(8*pi)",
        "latex": "c_3 = \\frac{1}{8\\pi}",
        "description": "Topological fixed point from 11D",
        "value": 0.0397887357729738,
        "category": "fundamental_theory"
    },
    "phi_0": {
        "formula": "0.053171",
        "latex": "\\varphi_0 = 0.053171",
        "description": "Fundamental VEV from RG self-consistency",
        "value": 0.053171,
        "category": "fundamental_theory"
    },
    "m_planck": {
        "formula": "1.2209e19",
        "latex": "M_{Pl} = 1.2209 \\times 10^{19} \\text{ GeV}",
        "description": "Planck mass",
        "value": 1.2209e19,
        "unit": "GeV",
        "category": "fundamental_theory"
    }
}

# CASCADE STRUCTURE
CASCADE_FORMULAS = {
    "gamma_function": {
        "formula": "gamma(n) = 0.834 + 0.108*n + 0.0105*n^2",
        "latex": "\\gamma(n) = 0.834 + 0.108n + 0.0105n^2",
        "description": "E8 cascade attenuation function",
        "category": "cascade"
    },
    "phi_n": {
        "formula": "phi_n(n) = phi_0 * exp(-sum(gamma(i), i=0..n-1))",
        "latex": "\\varphi_n = \\varphi_0 e^{-\\sum_{i=0}^{n-1} \\gamma(i)}",
        "description": "Cascade VEV at level n",
        "category": "cascade"
    }
}

# PRIMARY PREDICTIONS (direct from c₃ and φ₀)
PRIMARY_PREDICTIONS = {
    "alpha_g": {
        "formula": "phi_0^30",
        "latex": "\\alpha_G = \\varphi_0^{30}",
        "description": "Gravitational coupling",
        "category": "primary"
    },
    "sin2_theta_w": {
        "formula": "phi_0",
        "latex": "\\sin^2\\theta_W = \\varphi_0",
        "description": "Weinberg angle (tree level)",
        "category": "primary"
    },
    "m_p": {
        "formula": "M_Pl * phi_0^15",
        "latex": "m_p = M_{Pl} \\varphi_0^{15}",
        "description": "Proton mass",
        "unit": "MeV",
        "category": "primary"
    },
    "theta_c": {
        "formula": "arcsin(phi_0/(1+phi_0))",
        "latex": "\\theta_c = \\arcsin\\left(\\frac{\\varphi_0}{1+\\varphi_0}\\right)",
        "description": "Cabibbo angle",
        "unit": "radians",
        "category": "primary"
    },
    "v_cb": {
        "formula": "(3/4)*phi_0",
        "latex": "V_{cb} = \\frac{3}{4}\\varphi_0",
        "description": "CKM matrix element V_cb",
        "category": "primary"
    },
    "v_us_v_ud": {
        "formula": "phi_0",
        "latex": "|V_{us}/V_{ud}| = \\varphi_0",
        "description": "CKM matrix element ratio",
        "category": "primary"
    },
    "v_td_v_ts": {
        "formula": "phi_0",
        "latex": "|V_{td}/V_{ts}| = \\varphi_0",
        "description": "CKM matrix element ratio",
        "category": "primary"
    },
    "m_s_m_d_ratio": {
        "formula": "1/phi_0",
        "latex": "m_s/m_d = 1/\\varphi_0",
        "description": "Strange/down quark mass ratio",
        "category": "primary"
    },
    "r_tensor": {
        "formula": "phi_0^2",
        "latex": "r = \\varphi_0^2",
        "description": "Tensor-to-scalar ratio",
        "category": "primary"
    },
    "eta_b": {
        "formula": "4*c_3^7",
        "latex": "\\eta_B = 4c_3^7",
        "description": "Baryon asymmetry",
        "category": "primary"
    },
    "theta_qcd": {
        "formula": "c_3 * phi_0^7",
        "latex": "\\bar{\\theta}_{QCD} = c_3 \\varphi_0^7",
        "description": "Strong CP angle",
        "category": "primary"
    }
}

# SECONDARY PREDICTIONS (with correction factors)
SECONDARY_PREDICTIONS = {
    "omega_b": {
        "formula": "phi_0 * (1 - 2*c_3)",
        "latex": "\\Omega_b = \\varphi_0 (1 - 2c_3)",
        "description": "Baryon density with 4D loop correction",
        "correction": "4D-Loop",
        "category": "secondary"
    },
    "m_mu": {
        "formula": "(v_H/sqrt(2)) * phi_0^2.5 * (1 - 2*c_3) * 1e3",
        "latex": "m_\\mu = \\frac{v_H}{\\sqrt{2}} \\varphi_0^{2.5} (1 - 2c_3)",
        "description": "Muon mass with 4D loop correction",
        "unit": "MeV",
        "correction": "4D-Loop",
        "category": "secondary"
    },
    "m_u": {
        "formula": "M_Pl * phi_0^17 * (1 - 4*c_3) * 1e3",
        "latex": "m_u = M_{Pl} \\varphi_0^{17} (1 - 4c_3)",
        "description": "Up quark mass with KK geometry correction",
        "unit": "MeV",
        "correction": "KK-Geometry",
        "category": "secondary"
    },
    "m_b": {
        "formula": "M_Pl * phi_0^15 / sqrt(c_3) * (1 - 2*phi_0)",
        "latex": "m_b = \\frac{M_{Pl} \\varphi_0^{15}}{\\sqrt{c_3}} (1 - 2\\varphi_0)",
        "description": "Bottom quark mass with VEV backreaction",
        "unit": "GeV",
        "correction": "VEV-Backreaction",
        "category": "secondary"
    },
    "epsilon_k": {
        "formula": "phi_0^2/2 * (1 + 2*phi_0)",
        "latex": "\\epsilon_K = \\frac{\\varphi_0^2}{2} (1 + 2\\varphi_0)",
        "description": "CP violation parameter with VEV backreaction",
        "correction": "VEV-Backreaction",
        "category": "secondary"
    },
    "m_e": {
        "formula": "(v_H/sqrt(2)) * alpha * phi_0^5 * (1 - phi_0) * 1e6 * 1e3",
        "latex": "m_e = \\frac{v_H}{\\sqrt{2}} \\alpha \\varphi_0^5 (1 - \\varphi_0)",
        "description": "Electron mass with loop correction",
        "unit": "MeV",
        "correction": "4D-Loop",
        "category": "secondary"
    },
    "m_tau": {
        "formula": "(v_H/sqrt(2)) * (5/6) * phi_0^1.5",
        "latex": "m_\\tau = \\frac{v_H}{\\sqrt{2}} \\cdot \\frac{5}{6} \\varphi_0^{1.5}",
        "description": "Tau mass from E8 structure",
        "unit": "GeV",
        "category": "secondary"
    },
    "m_c": {
        "formula": "M_Pl * phi_0^16 / c_3",
        "latex": "m_c = \\frac{M_{Pl} \\varphi_0^{16}}{c_3}",
        "description": "Charm quark mass",
        "unit": "GeV",
        "category": "secondary"
    },
    "m_w": {
        "formula": "M_Z * sqrt(1 - sin2_theta_w)",
        "latex": "M_W = M_Z \\sqrt{1 - \\sin^2\\theta_W}",
        "description": "W boson mass",
        "unit": "GeV",
        "category": "secondary"
    },
    "m_z": {
        "formula": "91.1876",
        "latex": "M_Z = 91.1876 \\text{ GeV}",
        "description": "Z boson mass (experimental input)",
        "unit": "GeV",
        "category": "secondary"
    },
    "alpha_s": {
        "formula": "phi_0/2",
        "latex": "\\alpha_s(M_Z) = \\varphi_0/2",
        "description": "Strong coupling at M_Z",
        "category": "secondary"
    },
    "g_f": {
        "formula": "1/(sqrt(2) * v_H^2)",
        "latex": "G_F = \\frac{1}{\\sqrt{2} v_H^2}",
        "description": "Fermi constant",
        "unit": "GeV^-2",
        "category": "secondary"
    },
    "v_h": {
        "formula": "c_3 * M_Pl * phi_0^12",
        "latex": "v_H = c_3 M_{Pl} \\varphi_0^{12}",
        "description": "Higgs VEV",
        "unit": "GeV",
        "category": "secondary"
    },
    "n_s": {
        "formula": "1 - phi_0 - 1.5*phi_0*c_3",
        "latex": "n_s = 1 - \\varphi_0 - 1.5\\varphi_0 c_3",
        "description": "Scalar spectral index",
        "category": "secondary"
    }
}

# DERIVED CONSTANTS (calculated from other constants)
DERIVED_CONSTANTS = {
    "alpha": {
        "formula": "solveCubic(1, -A, 0, -A*c_3^2*kappa)",
        "latex": "\\alpha^3 - A\\alpha^2 - Ac_3^2\\kappa = 0",
        "description": "Fine structure constant from cubic equation",
        "dependencies": ["c_3", "phi_0"],
        "category": "derived"
    },
    "lambda_qcd": {
        "formula": "M_Z * exp(-2*pi/(b_Y*alpha_s))",
        "latex": "\\Lambda_{QCD} = M_Z e^{-2\\pi/(b_Y\\alpha_s)}",
        "description": "QCD confinement scale",
        "unit": "MeV",
        "dependencies": ["alpha_s", "m_z"],
        "category": "derived"
    },
    "delta_m_n_p": {
        "formula": "m_e * phi_0 * 48",
        "latex": "\\Delta m_{n-p} = 48 m_e \\varphi_0",
        "description": "Neutron-proton mass difference",
        "unit": "MeV",
        "dependencies": ["m_e", "phi_0"],
        "category": "derived"
    },
    "mu_p": {
        "formula": "67/24",
        "latex": "\\mu_p = \\frac{67}{24} \\mu_N",
        "description": "Proton magnetic moment",
        "unit": "nuclear_magneton",
        "category": "derived"
    },
    "mu_p_mu_n": {
        "formula": "67/24",
        "latex": "\\mu_p/\\mu_N = 67/24",
        "description": "Proton g-factor",
        "category": "derived"
    }
}

# NEW PHYSICS PREDICTIONS
NEW_PHYSICS = {
    "f_a": {
        "formula": "phi_4 * M_Pl",
        "latex": "f_a = \\varphi_4 M_{Pl}",
        "description": "Peccei-Quinn scale (axion decay constant)",
        "unit": "GeV",
        "dependencies": ["phi_0", "m_planck"],
        "category": "new_physics"
    },
    "m_axion": {
        "formula": "(f_pi * m_pi) / f_a",
        "latex": "m_a = \\frac{f_\\pi m_\\pi}{f_a}",
        "description": "Axion mass",
        "unit": "μeV",
        "dependencies": ["f_a"],
        "category": "new_physics"
    },
    "tau_proton": {
        "formula": "(phi_3 * M_Pl)^4 / m_p^5",
        "latex": "\\tau_p = \\frac{(\\varphi_3 M_{Pl})^4}{m_p^5}",
        "description": "Proton lifetime",
        "unit": "years",
        "dependencies": ["phi_0", "m_planck", "m_p"],
        "category": "new_physics"
    },
    "lambda_qg": {
        "formula": "2*pi*c_3*phi_0*M_Pl",
        "latex": "\\Lambda_{QG} = 2\\pi c_3 \\varphi_0 M_{Pl}",
        "description": "Quantum gravity threshold",
        "unit": "GeV",
        "dependencies": ["c_3", "phi_0", "m_planck"],
        "category": "new_physics"
    }
}

# CORRECTION FACTORS
CORRECTION_FACTORS = {
    "4D-Loop": {
        "formula": "1 - 2*c_3",
        "value": 0.920423,
        "description": "One-loop renormalization in 4D"
    },
    "KK-Geometry": {
        "formula": "1 - 4*c_3",
        "value": 0.840845,
        "description": "First Kaluza-Klein shell on S¹"
    },
    "VEV-Backreaction": {
        "formula": "1 ± k*phi_0",
        "description": "VEV backreaction or radion self-coupling, k=1,2,..."
    }
}

def get_all_formulas():
    """Return all formulas organized by category"""
    return {
        "fundamental": FUNDAMENTAL_CONSTANTS,
        "cascade": CASCADE_FORMULAS,
        "primary": PRIMARY_PREDICTIONS,
        "secondary": SECONDARY_PREDICTIONS,
        "derived": DERIVED_CONSTANTS,
        "new_physics": NEW_PHYSICS,
        "corrections": CORRECTION_FACTORS
    }

def get_formula_for_constant(constant_id):
    """Get the formula for a specific constant"""
    all_formulas = get_all_formulas()
    for category in all_formulas.values():
        if constant_id in category:
            return category[constant_id]
    return None