#!/usr/bin/env python3
"""
2-Loop Renormalization Group Running Implementation
Based on PyR@TE-style beta functions for Standard Model and beyond
"""

import math
import numpy as np
from typing import Dict, Tuple, Optional, List
from scipy.integrate import odeint
from scipy.optimize import brentq

class RGRunning:
    """
    Implements 2-loop RG running for gauge couplings and Yukawa couplings
    Following the structure of PyR@TE for systematic calculation
    """
    
    def __init__(self):
        # Standard Model gauge groups
        self.gauge_groups = ['U1', 'SU2', 'SU3']
        
        # SM particle content for beta functions
        self.N_gen = 3  # Number of generations
        
        # Boundary conditions at M_Z = 91.1876 GeV
        self.M_Z = 91.1876
        self.M_Pl = 1.2209e19
        
        # Experimental values at M_Z
        self.alpha_em_MZ = 1/127.955  # Running alpha_em at M_Z
        self.sin2_theta_W_MZ = 0.23121  # Weinberg angle at M_Z
        self.alpha_s_MZ = 0.1181  # Strong coupling at M_Z
        
        # Derived gauge couplings at M_Z
        self.g1_MZ = math.sqrt(5/3 * 4*math.pi*self.alpha_em_MZ / (1 - self.sin2_theta_W_MZ))
        self.g2_MZ = math.sqrt(4*math.pi*self.alpha_em_MZ / self.sin2_theta_W_MZ)
        self.g3_MZ = math.sqrt(4*math.pi*self.alpha_s_MZ)
        
        # Beta function coefficients (2-loop)
        self._compute_beta_coefficients()
        
    def _compute_beta_coefficients(self):
        """
        Compute 1-loop and 2-loop beta function coefficients
        For SM: U(1)_Y × SU(2)_L × SU(3)_C
        """
        # 1-loop coefficients b_i
        self.b1_1loop = 41/10  # U(1)_Y with GUT normalization
        self.b2_1loop = -19/6  # SU(2)_L
        self.b3_1loop = -7     # SU(3)_C
        
        # 2-loop coefficients b_ij (matrix form)
        # b_ij represents contribution of g_j to beta function of g_i
        self.b_2loop = np.array([
            [199/50, 27/10, 44/5],    # U(1)_Y row
            [9/10, 35/6, 12],          # SU(2)_L row
            [11/10, 9/2, -26]          # SU(3)_C row
        ])
        
        # Yukawa contributions to beta functions
        self.b_yukawa_1loop = {
            'top': -17/20,     # Top Yukawa contribution to g1
            'bottom': -1/4,    # Bottom Yukawa contribution
            'tau': -3/4        # Tau Yukawa contribution
        }
        
    def beta_gauge_1loop(self, g: np.ndarray, t: float) -> np.ndarray:
        """
        1-loop beta functions for gauge couplings
        g = [g1, g2, g3]
        t = log(μ/M_Z)
        """
        g1, g2, g3 = g
        
        beta_g1 = self.b1_1loop * g1**3 / (16 * math.pi**2)
        beta_g2 = self.b2_1loop * g2**3 / (16 * math.pi**2)
        beta_g3 = self.b3_1loop * g3**3 / (16 * math.pi**2)
        
        return np.array([beta_g1, beta_g2, beta_g3])
    
    def beta_gauge_2loop(self, g: np.ndarray, t: float) -> np.ndarray:
        """
        2-loop beta functions for gauge couplings
        Including both gauge and Yukawa contributions
        """
        g1, g2, g3 = g
        
        # 1-loop contribution
        beta_1loop = self.beta_gauge_1loop(g, t)
        
        # 2-loop gauge contributions
        beta_2loop_gauge = np.zeros(3)
        for i in range(3):
            for j in range(3):
                beta_2loop_gauge[i] += self.b_2loop[i,j] * g[i]**3 * g[j]**2
        beta_2loop_gauge /= (16 * math.pi**2)**2
        
        # Top Yukawa contribution (dominant)
        mu = self.M_Z * math.exp(t)
        y_t = self.yukawa_top(mu)
        
        # Yukawa contributions to gauge beta functions
        beta_2loop_yukawa = np.array([
            self.b_yukawa_1loop['top'] * g1**3 * y_t**2,
            -3 * g2**3 * y_t**2,
            -8 * g3**3 * y_t**2
        ]) / (16 * math.pi**2)**2
        
        return beta_1loop + beta_2loop_gauge + beta_2loop_yukawa
    
    def yukawa_top(self, mu: float) -> float:
        """
        Top Yukawa coupling at scale mu
        Using approximate solution including QCD corrections
        """
        # Tree-level relation: y_t = m_t * sqrt(2) / v
        m_t = 173.0  # GeV
        v = 246.22   # GeV
        y_t_0 = m_t * math.sqrt(2) / v
        
        # QCD correction factor
        alpha_s = self.alpha_s(mu)
        K_QCD = 1 - 4*alpha_s/(3*math.pi)
        
        return y_t_0 * K_QCD
    
    def alpha_s(self, mu: float) -> float:
        """
        Strong coupling at scale mu using 2-loop RGE
        """
        if mu <= self.M_Z:
            return self.alpha_s_MZ
        
        # 2-loop running
        t = math.log(mu / self.M_Z)
        b0 = -self.b3_1loop
        b1 = -self.b_2loop[2,2]
        
        # Solve 2-loop RGE analytically
        L = b0 * t / (4 * math.pi)
        alpha_s = self.alpha_s_MZ / (1 + self.alpha_s_MZ * L / (4*math.pi))
        
        # 2-loop correction
        alpha_s *= 1 - (b1/b0) * alpha_s * math.log(1 + self.alpha_s_MZ * L / (4*math.pi)) / (4*math.pi)
        
        return alpha_s
    
    def run_gauge_couplings(self, mu_initial: float, mu_final: float, 
                           g_initial: Optional[np.ndarray] = None) -> np.ndarray:
        """
        Run gauge couplings from mu_initial to mu_final using 2-loop RGE
        Returns [g1, g2, g3] at mu_final
        """
        if g_initial is None:
            if abs(mu_initial - self.M_Z) < 1e-6:
                g_initial = np.array([self.g1_MZ, self.g2_MZ, self.g3_MZ])
            else:
                # First run from M_Z to mu_initial
                g_initial = self.run_gauge_couplings(self.M_Z, mu_initial)
        
        # Set up ODE
        t_span = [0, math.log(mu_final / mu_initial)]
        
        # Solve RGE
        solution = odeint(self.beta_gauge_2loop, g_initial, t_span)
        
        return solution[-1]
    
    def find_unification_scale(self, threshold: float = 0.01) -> Tuple[float, np.ndarray]:
        """
        Find the scale where gauge couplings approximately unify
        Returns (M_GUT, [g1, g2, g3] at M_GUT)
        """
        def unification_measure(log_mu):
            mu = 10**log_mu
            g = self.run_gauge_couplings(self.M_Z, mu)
            # Measure of non-unification
            return (g[0] - g[1])**2 + (g[1] - g[2])**2 + (g[0] - g[2])**2
        
        # Search between 10^14 and 10^18 GeV
        log_mu_min = 14
        log_mu_max = 18
        
        # Find minimum
        from scipy.optimize import minimize_scalar
        result = minimize_scalar(unification_measure, bounds=(log_mu_min, log_mu_max), method='bounded')
        
        M_GUT = 10**result.x
        g_GUT = self.run_gauge_couplings(self.M_Z, M_GUT)
        
        return M_GUT, g_GUT
    
    def alpha_em(self, mu: float) -> float:
        """
        Electromagnetic coupling at scale mu
        """
        g = self.run_gauge_couplings(self.M_Z, mu)
        g1, g2 = g[0], g[1]
        
        # Relation: 1/alpha_em = 5/(3*g1^2) + 1/g2^2
        alpha_em = 1 / (5*g2**2/(3*g1**2*g2**2 + 5*g1**2))
        return alpha_em / (4 * math.pi)
    
    def sin2_theta_W(self, mu: float) -> float:
        """
        Weinberg angle at scale mu
        """
        g = self.run_gauge_couplings(self.M_Z, mu)
        g1, g2 = g[0], g[1]
        
        # Definition: sin^2(theta_W) = g1^2 / (g1^2 + g2^2) with GUT normalization
        return (3/5) * g1**2 / (g1**2 + g2**2)
    
    def plot_running(self, mu_min: float = 100, mu_max: float = 1e16):
        """
        Plot the running of gauge couplings from mu_min to mu_max
        """
        import matplotlib.pyplot as plt
        
        # Generate scale points (logarithmic)
        n_points = 100
        mu_values = np.logspace(math.log10(mu_min), math.log10(mu_max), n_points)
        
        # Calculate couplings at each scale
        g1_values = []
        g2_values = []
        g3_values = []
        alpha_values = []
        
        for mu in mu_values:
            g = self.run_gauge_couplings(self.M_Z, mu)
            g1_values.append(g[0])
            g2_values.append(g[1])
            g3_values.append(g[2])
            alpha_values.append(4*math.pi/g[0]**2 * 3/5)  # 1/alpha_1 with GUT normalization
        
        # Convert to inverse couplings for better visualization
        alpha1_inv = [4*math.pi/g**2 * 3/5 for g in g1_values]
        alpha2_inv = [4*math.pi/g**2 for g in g2_values]
        alpha3_inv = [4*math.pi/g**2 for g in g3_values]
        
        # Plot
        plt.figure(figsize=(10, 6))
        plt.semilogx(mu_values, alpha1_inv, 'b-', label=r'$\alpha_1^{-1}$ (U(1))')
        plt.semilogx(mu_values, alpha2_inv, 'r-', label=r'$\alpha_2^{-1}$ (SU(2))')
        plt.semilogx(mu_values, alpha3_inv, 'g-', label=r'$\alpha_3^{-1}$ (SU(3))')
        
        plt.xlabel(r'Energy Scale $\mu$ [GeV]')
        plt.ylabel(r'$\alpha_i^{-1}$')
        plt.title('2-Loop RG Running of Gauge Couplings')
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.xlim(mu_min, mu_max)
        plt.ylim(0, 60)
        
        # Mark special scales
        plt.axvline(self.M_Z, color='gray', linestyle='--', alpha=0.5, label='M_Z')
        plt.axvline(173, color='orange', linestyle='--', alpha=0.5, label='m_t')
        
        # Find and mark unification scale
        M_GUT, g_GUT = self.find_unification_scale()
        plt.axvline(M_GUT, color='purple', linestyle='--', alpha=0.5, label=f'M_GUT = {M_GUT:.2e} GeV')
        
        plt.legend()
        plt.tight_layout()
        plt.savefig('rg_running_2loop.png', dpi=150)
        plt.show()
        
        return mu_values, alpha1_inv, alpha2_inv, alpha3_inv
    
    def get_couplings_at_scale(self, mu: float) -> Dict[str, float]:
        """
        Get all relevant couplings at a given scale
        """
        g = self.run_gauge_couplings(self.M_Z, mu)
        
        return {
            'scale': mu,
            'g1': g[0],
            'g2': g[1],
            'g3': g[2],
            'alpha_em': self.alpha_em(mu),
            'alpha_s': self.alpha_s(mu),
            'sin2_theta_W': self.sin2_theta_W(mu),
            'alpha_1_inv': 4*math.pi/(g[0]**2) * 3/5,
            'alpha_2_inv': 4*math.pi/(g[1]**2),
            'alpha_3_inv': 4*math.pi/(g[2]**2),
            'y_top': self.yukawa_top(mu)
        }
    
    def find_special_scales(self) -> Dict[str, float]:
        """
        Find special scales in the RG flow
        """
        from topological_constants import TopologicalConstants
        tc = TopologicalConstants()
        
        special_scales = {}
        
        # Scale where alpha_s = phi_0
        def alpha_s_phi0(log_mu):
            return self.alpha_s(10**log_mu) - tc.phi0
        
        try:
            log_mu = brentq(alpha_s_phi0, 2, 8)  # Search between 100 GeV and 100 TeV
            special_scales['alpha_s_equals_phi0'] = 10**log_mu
        except:
            pass
        
        # Scale where alpha_s = c_3
        def alpha_s_c3(log_mu):
            return self.alpha_s(10**log_mu) - tc.c3
        
        try:
            log_mu = brentq(alpha_s_c3, 2, 10)
            special_scales['alpha_s_equals_c3'] = 10**log_mu
        except:
            pass
        
        # Scale where sin^2(theta_W) = phi_0
        def sin2tw_phi0(log_mu):
            return self.sin2_theta_W(10**log_mu) - tc.phi0
        
        try:
            log_mu = brentq(sin2tw_phi0, 10, 16)
            special_scales['sin2_theta_W_equals_phi0'] = 10**log_mu
        except:
            pass
        
        # GUT scale
        M_GUT, g_GUT = self.find_unification_scale()
        special_scales['M_GUT'] = M_GUT
        special_scales['g_GUT'] = (g_GUT[0] + g_GUT[1] + g_GUT[2]) / 3
        
        return special_scales


class YukawaRunning:
    """
    RG running for Yukawa couplings including threshold corrections
    """
    
    def __init__(self, rg: RGRunning):
        self.rg = rg
        
        # Yukawa matrices at M_Z (diagonal basis)
        self.y_u = np.diag([2.2e-6, 0.0012, 0.994])  # up, charm, top
        self.y_d = np.diag([4.7e-6, 0.000095, 0.024])  # down, strange, bottom
        self.y_e = np.diag([2.8e-6, 0.00059, 0.0102])  # electron, muon, tau
        
    def beta_yukawa_1loop(self, y_u, y_d, y_e, g):
        """
        1-loop beta functions for Yukawa matrices
        """
        g1, g2, g3 = g
        
        # Yukawa traces
        T_u = np.trace(y_u @ y_u.T)
        T_d = np.trace(y_d @ y_d.T)
        T_e = np.trace(y_e @ y_e.T)
        
        # Beta functions
        beta_yu = y_u * (3*T_u + T_d - 17/20*g1**2 - 9/4*g2**2 - 8*g3**2)
        beta_yd = y_d * (T_u + 3*T_d + T_e - 1/4*g1**2 - 9/4*g2**2 - 8*g3**2)
        beta_ye = y_e * (3*T_e + 3*T_d - 9/4*g1**2 - 9/4*g2**2)
        
        return beta_yu/(16*math.pi**2), beta_yd/(16*math.pi**2), beta_ye/(16*math.pi**2)


def test_rg_running():
    """
    Test the RG running implementation
    """
    rg = RGRunning()
    
    print("="*60)
    print("2-LOOP RG RUNNING TEST")
    print("="*60)
    
    # Test at various scales
    test_scales = [91.2, 173, 1000, 1e4, 1e10, 1e16]
    
    for mu in test_scales:
        couplings = rg.get_couplings_at_scale(mu)
        print(f"\nScale μ = {mu:.2e} GeV:")
        print(f"  α₁⁻¹ = {couplings['alpha_1_inv']:.2f}")
        print(f"  α₂⁻¹ = {couplings['alpha_2_inv']:.2f}")
        print(f"  α₃⁻¹ = {couplings['alpha_3_inv']:.2f}")
        print(f"  α_s = {couplings['alpha_s']:.4f}")
        print(f"  sin²θ_W = {couplings['sin2_theta_W']:.4f}")
    
    # Find special scales
    print("\n" + "="*60)
    print("SPECIAL SCALES IN RG FLOW")
    print("="*60)
    
    special = rg.find_special_scales()
    for name, scale in special.items():
        if 'equals' in name:
            print(f"{name}: μ = {scale:.2e} GeV")
        elif name == 'g_GUT':
            print(f"Unified coupling: g = {scale:.4f}")
        else:
            print(f"{name}: {scale:.2e} GeV")
    
    # Generate plot
    print("\nGenerating RG flow plot...")
    rg.plot_running()
    print("Plot saved as 'rg_running_2loop.png'")
    
    return rg


if __name__ == "__main__":
    test_rg_running()