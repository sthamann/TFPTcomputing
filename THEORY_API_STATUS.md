# 📊 Status der Theory API Endpoints

## Antwort: NEIN, die `/api/theory/*` Endpoints werden im Frontend NICHT verwendet!

## 1. Verfügbare Theory Endpoints (in compute/main.py)

```python
# Diese Endpoints existieren im Python Compute Service:
GET  /api/theory/calculate       # Alle Konstanten aus TopologicalConstants
GET  /api/theory/rg-running/{scale}  # RG-Running bei bestimmter Skala
GET  /api/theory/cascade/{n}     # Cascade VEVs für Level n
GET  /api/theory/special-scales  # Spezielle Skalen (GUT, etc.)
GET  /api/theory/correction-factors  # Universelle Korrekturfaktoren
```

## 2. Frontend API Client (frontend/src/lib/api.js)

```javascript
// NUR diese APIs sind im Frontend definiert:
constantsApi = {
  getAll()      // GET /api/constants
  getById(id)   // GET /api/constants/:id
  calculate(id) // POST /api/constants/:id/calculate
}

playgroundApi = {
  run()         // POST /api/playground/run
}

dagApi = {
  get()         // GET /api/dag
}

// KEINE theoryApi definiert!
```

## 3. Suche im Frontend-Code

```bash
# Grep-Suche nach "api/theory" in allen JSX-Dateien:
> grep -r "api/theory" frontend/src --include="*.jsx"
# Keine Treffer!

# Grep-Suche nach "theory" in JS-Dateien:
> grep -r "theory" frontend/src --include="*.js"
# Nur in constantGroups.js für UI-Gruppierung
```

## 4. CascadeVisualization Component

Die `CascadeVisualization.jsx` Komponente, die eigentlich die Theory-API nutzen könnte:

```javascript
// frontend/src/components/CascadeVisualization.jsx (Zeile 62)
// Mock RG running data (would be fetched from backend)

// ABER: Die Daten werden lokal berechnet statt von der API geladen!
const phi0 = 0.053171
const gamma = (n) => 0.834 + 0.108 * n + 0.0105 * n * n
// ... lokale Berechnungen ...
```

## 5. Warum werden die Theory APIs nicht genutzt?

### Mögliche Gründe:

1. **Noch nicht implementiert**: Die Frontend-Integration für die Theory-APIs wurde noch nicht entwickelt
2. **Bewusste Entscheidung**: Die Theory-APIs sind nur für zukünftige Features oder externe Tools gedacht
3. **Development in Progress**: Die CascadeVisualization hat einen Kommentar "would be fetched from backend"

### Was die Theory-APIs bieten würden:

- **RG-Running Daten**: Echte 2-Loop RG-Evolution statt Mock-Daten
- **Cascade-Berechnungen**: Exakte φ_n und γ_n Werte
- **Spezielle Skalen**: GUT-Skala, φ₀/c₃ Matching-Punkte
- **Korrekturfaktoren**: Die universellen Faktoren (4D-Loop, KK-Geometry, etc.)

## 6. Aktueller Stand

### Was das Frontend verwendet:
✅ **Notebook-basierte Berechnungen** über `/api/constants/*`
- JSON → Notebook → Result-JSON → API → Frontend

### Was das Frontend NICHT verwendet:
❌ **Theory-API Endpoints** (`/api/theory/*`)
- Diese existieren im Backend aber werden nicht aufgerufen

## 7. Empfehlung

Die Theory-APIs könnten genutzt werden für:

1. **CascadeVisualization**: Echte Daten statt Mock-Daten
```javascript
// Statt lokaler Berechnung:
const cascadeData = await theoryApi.getCascade(n)
const rgData = await theoryApi.getRGRunning(scale)
```

2. **Theory Dashboard**: Neues Feature für theoretische Analysen
```javascript
const specialScales = await theoryApi.getSpecialScales()
const correctionFactors = await theoryApi.getCorrectionFactors()
```

3. **Vergleichstool**: Notebook vs. TopologicalConstants
```javascript
const notebookResult = await constantsApi.calculate(id)
const theoryResult = await theoryApi.calculate()
// Vergleiche beide Ergebnisse
```

## Fazit

**Die `/api/theory/*` Endpoints werden aktuell NICHT im Frontend verwendet.**

Sie existieren als "ready-to-use" Backend-Funktionalität, aber das Frontend nutzt ausschließlich die notebook-basierten `/api/constants/*` Endpoints. Die Theory-APIs warten darauf, in zukünftigen Features integriert zu werden.