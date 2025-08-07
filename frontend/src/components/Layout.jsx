import { Link, useLocation } from 'react-router-dom'
import { 
  Moon, Sun, Calculator, Network, FlaskConical, 
  ExternalLink, Atom, Globe
} from 'lucide-react'
import { cn } from '../lib/utils'

const Layout = ({ children, darkMode, setDarkMode }) => {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Constants', icon: Calculator },
    { path: '/playground', label: 'Playground', icon: FlaskConical },
    { path: '/dag', label: 'Graph', icon: Network },
    { path: '/universe', label: 'Birth of Universe', icon: Globe },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Atom className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-semibold">Topological Constants</span>
                  <span className="text-xs text-muted-foreground">v0.8 · July 30, 2025</span>
                </div>
              </Link>
              
              <nav className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "nav-link flex items-center space-x-2",
                        isActive && "active"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <a
                href="https://github.com/your-repo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors p-2"
                aria-label="GitHub"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
              
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="nav-link"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t py-6 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Topological Fixed Point Framework</p>
        </div>
      </footer>
    </div>
  )
}

export default Layout