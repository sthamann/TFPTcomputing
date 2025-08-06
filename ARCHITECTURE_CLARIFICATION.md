# 🏗️ Architektur-Klärung: Zwei parallele Berechnungssysteme

## Aktuelle Situation

Das System hat **zwei parallele Berechnungsmethoden**, die nicht synchronisiert sind:

### 1. **Notebook-basiertes System** (Primär für Frontend)
```
JSON-Dateien (constants/data/*.json)
    ↓ generate_notebooks.py
Jupyter Notebooks (constants/notebooks/*.ipynb)
    ↓ execute (papermill)
Result JSONs (constants/results/json/*_result.json)
    ↓ Backend API
Frontend Display
```

**Verwendung:**
- `/api/constants` - Liste aller Konstanten
- `/api/constants/:id` - Details einer Konstante
- Frontend-Anzeige der berechneten Werte

### 2. **Python-Modul System** (Neu, für Theory API)
```
topological_constants.py + rg_running.py
    ↓ direkte Python-Berechnung
Theory API Endpoints
```

**Verwendung:**
- `/api/theory/calculate` - Alle Konstanten aus TopologicalConstants
- `/api/theory/rg-running/:scale` - RG-Running bei bestimmter Skala
- `/api/theory/cascade/:n` - Cascade-Werte
- `/api/theory/special-scales` - Spezielle Skalen
- `/api/theory/correction-factors` - Korrekturfaktoren

## Das Problem

Wir haben **nur `topological_constants.py` korrigiert**, aber das Frontend verwendet die **Notebook-generierten Result-JSONs**!

Die korrigierten Berechnungen in `topological_constants.py`:
- ✅ Baryon Asymmetry (η_B)
- ✅ Proton Mass (m_p)
- ✅ Weinberg Angle (sin²θ_W)
- ✅ CKM Matrix Element (V_cb)
- ✅ Bottom Quark Mass (m_b)
- ✅ Charm Quark Mass (m_c)
- ✅ Up Quark Mass (m_u)
- ✅ W Boson Mass (M_W)
- ✅ Z Boson Mass (M_Z)
- ✅ Scalar Spectral Index (n_s)
- ✅ Electron Yukawa (y_e)
- ✅ Top Yukawa (y_t)

...werden **NICHT im Frontend angezeigt**, weil das Frontend die alten Notebook-Ergebnisse lädt!

## Lösungsoptionen

### Option A: JSON-Formeln aktualisieren (Empfohlen für Konsistenz)
```python
# Update JSON files with correct formulas from topological_constants.py
for constant in constants:
    json_data['formula'] = get_formula_from_topological_constants()
    json_data['calculated_value'] = tc.calculate_constant()
```

**Vorteile:**
- Single Source of Truth
- Notebooks bleiben funktionsfähig
- Beide Systeme synchron

**Nachteile:**
- Formeln müssen als Strings gepflegt werden
- Doppelte Wartung

### Option B: Backend umstellen auf topological_constants.py
```javascript
// Change backend to use Python compute service directly
app.get('/api/constants/:id', async (req, res) => {
    const result = await axios.get(`${PYTHON_SERVICE}/theory/calculate`);
    // Use result from topological_constants.py
});
```

**Vorteile:**
- Nur eine Berechnungsquelle
- Einfachere Wartung

**Nachteile:**
- Notebooks werden obsolet
- Verlust der Notebook-Dokumentation

### Option C: Hybrid-Ansatz (Pragmatisch)
1. **Kurzfristig:** JSON-Dateien mit korrekten Werten aus `topological_constants.py` aktualisieren
2. **Result-JSONs** direkt generieren (ohne Notebook-Ausführung)
3. **Langfristig:** System auf eine einzige Berechnungsquelle migrieren

## Empfehlung

**Sofortige Lösung (Option C):**
1. Script schreiben, das alle `constants/results/json/*_result.json` direkt aus `topological_constants.py` generiert
2. Frontend zeigt sofort korrekte Werte
3. Notebooks können später angepasst werden

```python
# generate_results_from_theory.py
from topological_constants import TopologicalConstants
tc = TopologicalConstants()

for constant_id in constants:
    result = {
        'constant_id': constant_id,
        'calculated_value': tc.get_value(constant_id),
        'formula': tc.get_formula(constant_id),
        'accuracy_met': tc.check_accuracy(constant_id)
    }
    save_to_json(f'constants/results/json/{constant_id}_result.json', result)
```

## Fazit

Das System hat eine **architektonische Inkonsistenz**: Zwei parallele Berechnungssysteme, die nicht synchronisiert sind. Die Korrekturen in `topological_constants.py` erreichen das Frontend nicht, weil es die Notebook-generierten JSONs verwendet.

**Nächste Schritte:**
1. ✅ Result-JSONs direkt aus `topological_constants.py` generieren
2. ✅ Frontend zeigt korrekte Werte
3. 🔄 Langfristig: System vereinheitlichen