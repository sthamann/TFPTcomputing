import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { constantsApi } from '../lib/api'
import { Calculator, Loader2, Search } from 'lucide-react'
import { cn } from '../lib/utils'
import toast from 'react-hot-toast'

const ConstantsPage = () => {
  const [constants, setConstants] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    loadConstants()
  }, [])

  const loadConstants = async () => {
    try {
      setLoading(true)
      const data = await constantsApi.getAll()
      setConstants(data)
    } catch (error) {
      console.error('Error loading constants:', error)
      toast.error('Failed to load constants')
    } finally {
      setLoading(false)
    }
  }

  const filteredConstants = constants.filter((constant) => {
    const matchesSearch = 
      constant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      constant.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      constant.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = 
      selectedCategory === 'all' || constant.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const categories = ['all', 'fundamental', 'derived', 'composite']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Physics Constants</h1>
        <p className="text-muted-foreground mt-2">
          Explore fundamental constants calculated using the Topological Fixed Point Framework
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search constants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <div className="flex gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                selectedCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary hover:bg-secondary/80"
              )}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredConstants.map((constant) => (
          <Link
            key={constant.id}
            to={`/constants/${constant.id}`}
            className="block p-6 border rounded-lg hover:border-primary transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg font-semibold">{constant.name}</h3>
                <p className="text-2xl font-bold text-primary mt-1">
                  {constant.symbol}
                </p>
              </div>
              <Calculator className="h-5 w-5 text-muted-foreground" />
            </div>
            
            <div className="mt-4 space-y-1 text-sm">
              <p className="text-muted-foreground">
                Category: <span className="text-foreground">{constant.category}</span>
              </p>
              <p className="text-muted-foreground">
                Unit: <span className="text-foreground">{constant.unit}</span>
              </p>
            </div>
          </Link>
        ))}
      </div>

      {filteredConstants.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No constants found</p>
        </div>
      )}
    </div>
  )
}

export default ConstantsPage 