# Production Security Checklist

## 🔒 Essenzielle Sicherheitsmaßnahmen

### 1. Environment Variables
- [ ] Alle Secrets in Umgebungsvariablen
- [ ] Keine Hardcoded Credentials
- [ ] `.env` Dateien in `.gitignore`

### 2. HTTPS/SSL
- [ ] SSL-Zertifikat aktiviert
- [ ] HTTP zu HTTPS Redirect
- [ ] HSTS Header gesetzt

### 3. API Security
```javascript
// Rate Limiting erhöhen für Production
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // 1000 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS strikt konfigurieren
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200
};
```

### 4. Docker Security
```dockerfile
# Non-root user in Dockerfiles
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs
```

### 5. Monitoring
- [ ] Error Tracking (Sentry)
- [ ] Uptime Monitoring (UptimeRobot)
- [ ] Log Aggregation
- [ ] Performance Monitoring

### 6. Backup Strategy
```bash
# Tägliche Backups der Compute-Ergebnisse
0 2 * * * tar -czf /backup/results-$(date +\%Y\%m\%d).tar.gz /app/compute/results
```

### 7. CI/CD Security
```yaml
# GitHub Secrets für Deployment
RENDER_API_KEY
DOCKER_REGISTRY_TOKEN
SENTRY_DSN
```