import { Link, useLocation } from 'react-router-dom'
import { Moon, Sun, Calculator, Network, FlaskConical } from 'lucide-react'
import { cn } from '../lib/utils'

const Layout = ({ children, darkMode, setDarkMode }) => {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Constants', icon: Calculator },
    { path: '/playground', label: 'Playground', icon: FlaskConical },
    { path: '/dag', label: 'Graph', icon: Network },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2">
                <Calculator className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">Topological Constants</span>
              </Link>
              
              <nav className="hidden md:flex items-center space-x-6">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
                        isActive ? "text-primary" : "text-muted-foreground"
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
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-10 w-10"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
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