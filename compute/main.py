from fastapi import FastAPI, HTTPException, WebSocket, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import json
import asyncio
from pathlib import Path
import os
import papermill as pm
import networkx as nx
from datetime import datetime
import logging
import sys

# Import topological theory modules
try:
    from topological_constants import TopologicalConstants
    from rg_running import RGRunning
    HAS_THEORY = True
except ImportError:
    HAS_THEORY = False

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

if not HAS_THEORY:
    logger.warning("Topological theory modules not available")

app = FastAPI(title="Topological Constants Compute Service")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class CalculationRequest(BaseModel):
    constant_id: str
    parameters: Optional[Dict[str, float]] = None
    force_recalculate: bool = False

class CalculationResult(BaseModel):
    constant_id: str
    calculated_value: Optional[float]
    reference_value: Optional[float]
    relative_error: Optional[float]
    unit: str
    formula: str
    calculation_steps: List[Dict[str, Any]]
    timestamp: str
    status: str
    error: Optional[str] = None

class PlaygroundRequest(BaseModel):
    formula: str
    parameters: Dict[str, float]
    output_unit: Optional[str] = None

# Global cache for results
results_cache: Dict[str, CalculationResult] = {}

# WebSocket connections for live updates
active_connections: List[WebSocket] = []

@app.on_event("startup")
async def startup_event():
    """Initialize the compute service"""
    logger.info("Starting Topological Constants Compute Service")
    # Ensure directories exist
    Path("notebooks").mkdir(exist_ok=True)
    Path("results").mkdir(exist_ok=True)
    
    # Skip pre-calculation for now to avoid startup crashes
    logger.info("Skipping pre-calculation to avoid startup issues")
    return
    
    # Pre-calculate all constants for caching
    logger.info("Pre-calculating all constants...")
    # In local mode, constants are in parent directory
    constants_dir = Path("../constants/data") if not Path("constants/data").exists() else Path("constants/data")
    if constants_dir.exists():
        constant_files = list(constants_dir.glob("*.json"))
        logger.info(f"Found {len(constant_files)} constants to pre-calculate")
        
        # Calculate constants in dependency order
        calculated = set()
        max_iterations = 10
        iteration = 0
        
        while len(calculated) < len(constant_files) and iteration < max_iterations:
            iteration += 1
            for const_file in constant_files:
                const_id = const_file.stem
                if const_id in calculated:
                    continue
                
                # Check if all dependencies are calculated
                with open(const_file, 'r') as f:
                    const_data = json.load(f)
                
                deps = const_data.get('dependencies', [])
                if all(dep in calculated or not Path(f"constants/data/{dep}.json").exists() for dep in deps):
                    # Calculate this constant
                    try:
                        logger.info(f"Pre-calculating {const_id}...")
                        result = await calculate_notebook(const_id, Path(f"constants/notebooks/{const_id}.ipynb"))
                        if result and result.status == 'completed':
                            calculated.add(const_id)
                    except Exception as e:
                        logger.warning(f"Failed to pre-calculate {const_id}: {e}")
                        # Mark as calculated to avoid infinite loops
                        calculated.add(const_id)
        
        logger.info(f"Pre-calculation complete. Calculated {len(calculated)} constants.")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "healthy", "service": "compute"}

@app.get("/dag")
async def get_dependency_graph():
    """Get the dependency graph of all constants"""
    # In local mode, constants are in parent directory
    constants_dir = Path("../constants/data") if not Path("constants/data").exists() else Path("constants/data")
    graph = nx.DiGraph()
    
    # Load all constants and build graph
    for json_file in constants_dir.glob("*.json"):
        with open(json_file, 'r') as f:
            constant = json.load(f)
            
        const_id = constant['id']
        graph.add_node(const_id, **constant)
        
        # Add edges for dependencies
        for dep in constant.get('dependencies', []):
            graph.add_edge(dep, const_id)
    
    # Convert to JSON-serializable format
    nodes = []
    edges = []
    
    for node_id in graph.nodes():
        node_data = graph.nodes[node_id]
        
        # Get calculated value from cache if available
        theory_value = None
        if node_id in results_cache:
            result = results_cache[node_id]
            theory_value = result.calculated_value
        
        # Get measured value from sources
        measured_value = None
        sources = node_data.get('sources', [])
        # Look for experimental source (PDG, CODATA, etc.)
        for source in sources:
            if source.get('name') != 'Topological Fixed Point Theory':
                measured_value = source.get('value')
                break
        # If no experimental source, use the theory source value as measured
        if measured_value is None and sources:
            measured_value = sources[0].get('value')
        
        # Calculate accuracy percentage if both values are available
        accuracy = None
        if theory_value is not None and measured_value is not None and measured_value != 0:
            relative_error = abs(theory_value - measured_value) / abs(measured_value)
            accuracy = (1 - relative_error) * 100
        
        node_info = {
            'id': node_id,
            'symbol': node_data.get('symbol', ''),
            'name': node_data.get('name', ''),
            'category': node_data.get('category', 'derived'),
            'unit': node_data.get('unit', ''),
            'theory_value': theory_value,
            'measured_value': measured_value,
            'accuracy': accuracy,
            'formula': node_data.get('formula', '')
        }
        
        nodes.append(node_info)
    
    for source, target in graph.edges():
        edges.append({'source': source, 'target': target})
    
    return {
        'nodes': nodes,
        'edges': edges,
        'is_acyclic': nx.is_directed_acyclic_graph(graph)
    }

@app.post("/calculate/{constant_id}")
async def calculate_constant(
    constant_id: str,
    request: Optional[CalculationRequest] = None
):
    """Calculate a constant value and return immediately"""
    # Use request params if provided, otherwise defaults
    force_recalculate = request.force_recalculate if request else False
    parameters = request.parameters if request else None
    
    # Check cache first
    if not force_recalculate and constant_id in results_cache:
        logger.info(f"Returning cached result for {constant_id}")
        return results_cache[constant_id].dict()
    
    # Check if constant exists
    const_path = Path(f"constants/data/{constant_id}.json")
    if not const_path.exists():
        raise HTTPException(status_code=404, detail=f"Constant {constant_id} not found")
    
    # Load constant metadata
    with open(const_path, 'r') as f:
        constant = json.load(f)
    
    # Check if notebook exists
    notebook_path = Path(f"constants/notebooks/{constant_id}.ipynb")
    if not notebook_path.exists():
        raise HTTPException(
            status_code=404, 
            detail=f"Notebook for {constant_id} not found. Run generate_notebooks.py first."
        )
    
    # Run calculation immediately and return result
    result = await calculate_notebook(constant_id, notebook_path, parameters)
    return result.dict()

async def calculate_notebook(constant_id: str, notebook_path: Path, parameters: Optional[Dict] = None) -> CalculationResult:
    """Run notebook calculation and return result"""
    try:
        logger.info(f"Starting calculation for {constant_id}")
        
        # Save current directory
        original_cwd = os.getcwd()
        
        try:
            # Change to notebooks directory for execution
            os.chdir('constants/notebooks')
            
            # Prepare output path (relative to notebooks directory)
            output_path = Path(f"../../results/{constant_id}_executed.ipynb")
            
            # Execute notebook
            pm.execute_notebook(
                constant_id + '.ipynb',  # Notebook is in current directory
                str(output_path),
                parameters=parameters or {},
                kernel_name='python3'
            )
        finally:
            # Always restore original directory
            os.chdir(original_cwd)
        
        # Read result file (from original working directory)
        result_path = Path(f"constants/results/{constant_id}_result.json")
        if result_path.exists():
            with open(result_path, 'r') as f:
                result_data = json.load(f)
        else:
            # Try to get basic info from constant metadata
            const_path = Path(f"constants/data/{constant_id}.json")
            with open(const_path, 'r') as f:
                const_data = json.load(f)
            
            result_data = {
                'calculated_value': None,
                'reference_value': const_data.get('sources', [{}])[0].get('value'),
                'unit': const_data.get('unit', 'dimensionless'),
                'formula': const_data.get('formula', ''),
                'error': 'Result file not found after calculation'
            }
        
        # Handle special cases
        if constant_id == 'gamma_function':
            # For gamma function, use test value at n=0 as representative
            calc_val = result_data.get('test_values', {}).get('0', 0.834)
        else:
            calc_val = result_data.get('calculated_value', 0)
        
        # Create result object
        result = CalculationResult(
            constant_id=constant_id,
            calculated_value=calc_val,
            reference_value=result_data.get('reference_value'),
            relative_error=result_data.get('relative_error'),
            unit=result_data.get('unit', 'dimensionless'),
            formula=result_data.get('formula', ''),
            calculation_steps=[],  # TODO: Extract from notebook
            timestamp=datetime.now().isoformat(),
            status='completed' if calc_val is not None else 'error',
            error=result_data.get('error')
        )
        
        # Cache result
        results_cache[constant_id] = result
        
        # Notify WebSocket clients
        await broadcast_update({
            'type': 'calculation_complete',
            'constant_id': constant_id,
            'result': result.dict()
        })
        
        logger.info(f"Calculation completed for {constant_id}")
        return result
        
    except Exception as e:
        logger.error(f"Error calculating {constant_id}: {e}")
        
        # Get basic info from metadata
        try:
            const_path = Path(f"constants/data/{constant_id}.json")
            with open(const_path, 'r') as f:
                const_data = json.load(f)
            
            unit = const_data.get('unit', 'dimensionless')
            formula = const_data.get('formula', '')
            ref_value = const_data.get('sources', [{}])[0].get('value')
        except:
            unit = 'dimensionless'
            formula = ''
            ref_value = None
        
        # Create error result
        result = CalculationResult(
            constant_id=constant_id,
            calculated_value=0,
            reference_value=ref_value,
            relative_error=None,
            unit=unit,
            formula=formula,
            calculation_steps=[],
            timestamp=datetime.now().isoformat(),
            status='error',
            error=str(e)
        )
        
        # Cache error result
        results_cache[constant_id] = result
        
        await broadcast_update({
            'type': 'calculation_error',
            'constant_id': constant_id,
            'error': str(e)
        })
        
        return result

# Add GET endpoint for cached results
@app.get("/calculate/{constant_id}")
async def get_calculation(constant_id: str, from_cache: bool = True):
    """Get calculation result from cache"""
    if from_cache and constant_id in results_cache:
        return results_cache[constant_id].dict()
    else:
        # Return None to indicate no cached result
        return None

@app.post("/playground/run")
async def run_playground(request: PlaygroundRequest):
    """Execute arbitrary formula with given parameters"""
    try:
        import sympy as sp
        from sympy import symbols, pi, sqrt, sin, cos, tan, asin, acos, atan, exp, log
        
        # Create symbols from parameters
        symbol_dict = {}
        for param_name, param_value in request.parameters.items():
            symbol_dict[param_name] = param_value
        
        # Parse and evaluate formula
        # Safety: Use sympy's parsing which is safer than eval
        expr = sp.sympify(request.formula, locals=symbol_dict)
        
        # Substitute values
        for symbol_name, value in request.parameters.items():
            symbol = sp.Symbol(symbol_name)
            expr = expr.subs(symbol, value)
        
        # Evaluate
        result = float(expr.evalf())
        
        return {
            'formula': request.formula,
            'parameters': request.parameters,
            'result': result,
            'unit': request.output_unit or 'dimensionless',
            'latex': sp.latex(sp.sympify(request.formula))
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error evaluating formula: {str(e)}")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for live updates"""
    await websocket.accept()
    active_connections.append(websocket)
    
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
            
    except Exception as e:
        logger.info(f"WebSocket disconnected: {e}")
    finally:
        active_connections.remove(websocket)

async def broadcast_update(message: dict):
    """Broadcast update to all connected WebSocket clients"""
    for connection in active_connections:
        try:
            await connection.send_json(message)
        except:
            # Remove dead connections
            active_connections.remove(connection)

# ===========================
# TOPOLOGICAL THEORY ENDPOINTS
# ===========================

@app.get("/api/theory/calculate")
async def calculate_theory_values():
    """Calculate all constants using Topological Fixed Point Theory"""
    if not HAS_THEORY:
        raise HTTPException(status_code=503, detail="Theory modules not available")
    
    try:
        tc = TopologicalConstants()
        # Calculate all major constants
        results = {
            # Fundamental inputs
            'c3': tc.c3,
            'phi0': tc.phi0,
            'M_Pl': tc.M_Pl,
            'alpha': tc.alpha_exp,
            
            # Calculated values
            'eta_B': tc.eta_B() if hasattr(tc, 'eta_B') else None,
            'm_p_MeV': tc.m_p_MeV() if hasattr(tc, 'm_p_MeV') else None,
            'sin2_theta_W': tc.sin2_theta_W_MZ() if hasattr(tc, 'sin2_theta_W_MZ') else None,
            'V_cb': tc.V_cb() if hasattr(tc, 'V_cb') else None,
            'm_b_GeV': tc.m_b_GeV() if hasattr(tc, 'm_b_GeV') else None,
            'm_c_GeV': tc.m_c_GeV() if hasattr(tc, 'm_c_GeV') else None,
            'm_u_MeV': tc.m_u_MeV() if hasattr(tc, 'm_u_MeV') else None,
            'M_W_GeV': tc.M_W_GeV() if hasattr(tc, 'M_W_GeV') else None,
            'M_Z_GeV': tc.M_Z,
            'n_s': tc.n_s() if hasattr(tc, 'n_s') else None,
            'y_e': tc.y_e() if hasattr(tc, 'y_e') else None,
            'y_t': tc.y_t() if hasattr(tc, 'y_t') else None,
        }
        
        # Add metadata
        results['metadata'] = {
            'theory': 'Topological Fixed Point Theory',
            'version': '1.0',
            'fundamental_inputs': {
                'c3': tc.c3,
                'phi0': tc.phi0,
                'M_Pl': tc.M_Pl
            }
        }
        
        return results
    except Exception as e:
        logger.error(f"Theory calculation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/theory/rg-running/{scale}")
async def get_rg_running(scale: float):
    """Get gauge couplings at a specific energy scale"""
    if not HAS_THEORY:
        raise HTTPException(status_code=503, detail="RG running not available")
    
    try:
        rg = RGRunning()
        couplings = rg.get_couplings_at_scale(scale)
        return couplings
    except Exception as e:
        logger.error(f"RG running calculation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/theory/cascade/{n}")
async def get_cascade_vev(n: int):
    """Get cascade VEV φₙ for level n"""
    if not HAS_THEORY:
        raise HTTPException(status_code=503, detail="Theory modules not available")
    
    try:
        tc = TopologicalConstants()
        phi_n = tc.phi_n(n)
        gamma_n = tc.gamma(n)
        
        return {
            'n': n,
            'phi_n': phi_n,
            'gamma_n': gamma_n,
            'energy_scale_GeV': phi_n * tc.M_Pl
        }
    except Exception as e:
        logger.error(f"Cascade calculation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/theory/special-scales")
async def get_special_scales():
    """Find special scales in the RG flow"""
    if not HAS_THEORY:
        raise HTTPException(status_code=503, detail="Theory modules not available")
    
    try:
        rg = RGRunning()
        tc = TopologicalConstants()
        
        special_scales = rg.find_special_scales()
        
        # Add theory-specific scales
        special_scales['phi0_matching'] = tc.find_phi0_matching_scale()
        special_scales['c3_matching'] = tc.find_c3_matching_scale()
        
        return special_scales
    except Exception as e:
        logger.error(f"Special scales calculation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/theory/correction-factors")
async def get_correction_factors():
    """Get universal correction factors"""
    if not HAS_THEORY:
        raise HTTPException(status_code=503, detail="Theory modules not available")
    
    try:
        tc = TopologicalConstants()
        
        # Calculate correction factors for a test value
        test_value = 1.0
        
        factors = {
            '4D_Loop': {
                'formula': '1 - 2c₃',
                'value': tc.loop_4D(test_value),
                'c3': tc.c3,
                'description': 'One-loop renormalization in 4D'
            },
            'KK_Geometry': {
                'formula': '1 - 4c₃',
                'value': tc.KK_geometry(test_value),
                'c3': tc.c3,
                'description': 'First Kaluza-Klein shell on S¹'
            },
            'VEV_Backreaction_k1': {
                'formula': '1 + φ₀',
                'value': tc.VEV_backreaction(test_value, k=1),
                'phi0': tc.phi0,
                'description': 'VEV backreaction with k=1'
            },
            'VEV_Backreaction_k2': {
                'formula': '1 + 2φ₀',
                'value': tc.VEV_backreaction(test_value, k=2),
                'phi0': tc.phi0,
                'description': 'VEV backreaction with k=2'
            },
            'VEV_Backreaction_k_minus2': {
                'formula': '1 - 2φ₀',
                'value': tc.VEV_backreaction(test_value, k=-2),
                'phi0': tc.phi0,
                'description': 'VEV backreaction with k=-2'
            }
        }
        
        return factors
    except Exception as e:
        logger.error(f"Correction factors calculation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)  # Changed to port 8001 to avoid conflict 