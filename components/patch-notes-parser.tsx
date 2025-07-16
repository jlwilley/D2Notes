'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Search, Filter, TrendingUp, TrendingDown, Target, Shield, Zap, Cpu, Wrench } from 'lucide-react'

interface Change {
  type: 'buff' | 'nerf' | 'rework' | 'change' | 'new'
  description: string
  examples?: string[]
  new_stats?: Record<string, any>
}

interface PatchSection {
  id: string
  title: string
  category: 'weapons' | 'abilities' | 'exotics' | 'systems' | 'armor' | 'features'
  changes: Change[]
  description?: string
  components?: any
}

interface PatchData {
  new_features?: Record<string, any>
  systemic_changes?: Record<string, { title: string; changes: Change[] }>
  weapon_archetypes?: Record<string, { changes: Change[] }>
  weapon_perks?: Record<string, { changes: Change[] }>
  weapon_perk_changes?: Record<string, { changes: Change[] }>
  exotic_weapons?: Record<string, { changes: Change[] }>
  exotic_weapon_changes?: Record<string, { changes: Change[] }>
  abilities?: Record<string, any>
  ability_changes?: Record<string, any>
  exotic_armor?: Record<string, any>
  exotic_armor_changes?: Record<string, any>
}

function transformData(data: PatchData): PatchSection[] {
  const sections: PatchSection[] = []

  // New features
  if (data.new_features) {
    Object.entries(data.new_features).forEach(([key, value]) => {
      sections.push({
        id: `feature-${key}`,
        title: value.title,
        category: 'features',
        description: value.description,
        components: value.components,
        changes: [{ type: 'new', description: value.description }]
      })
    })
  }

  // Systemic changes
  if (data.systemic_changes) {
    Object.entries(data.systemic_changes).forEach(([key, value]) => {
      sections.push({
        id: key,
        title: value.title,
        category: 'systems',
        changes: value.changes
      })
    })
  }

  // Weapon archetypes
  if (data.weapon_archetypes) {
    Object.entries(data.weapon_archetypes).forEach(([key, value]) => {
      sections.push({
        id: `archetype-${key}`,
        title: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        category: 'weapons',
        changes: value.changes
      })
    })
  }

  // Weapon perks
  if (data.weapon_perks) {
    Object.entries(data.weapon_perks).forEach(([key, value]) => {
      sections.push({
        id: `perk-${key}`,
        title: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        category: 'weapons',
        changes: value.changes
      })
    })
  }

  // Weapon perk changes
  if (data.weapon_perk_changes) {
    Object.entries(data.weapon_perk_changes).forEach(([key, value]) => {
      sections.push({
        id: `perk-${key}`,
        title: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        category: 'weapons',
        changes: value.changes
      })
    })
  }

  // Exotic weapons
  if (data.exotic_weapons) {
    Object.entries(data.exotic_weapons).forEach(([key, value]) => {
      sections.push({
        id: `exotic-${key}`,
        title: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        category: 'exotics',
        changes: value.changes
      })
    })
  }

  // Exotic weapon changes
  if (data.exotic_weapon_changes) {
    Object.entries(data.exotic_weapon_changes).forEach(([key, value]) => {
      sections.push({
        id: `exotic-${key}`,
        title: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        category: 'exotics',
        changes: value.changes
      })
    })
  }

  // Abilities (flattened from nested structure)
  function flattenAbilities(obj: any, prefix = ''): void {
    Object.entries(obj).forEach(([key, value]: [string, any]) => {
      if (value.changes) {
        const title = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        sections.push({
          id: `ability-${prefix}${key}`,
          title: prefix ? `${prefix} - ${title}` : title,
          category: 'abilities',
          changes: value.changes
        })
      } else {
        const newPrefix = prefix ? `${prefix} ` : ''
        flattenAbilities(value, `${newPrefix}${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`)
      }
    })
  }
  
  if (data.abilities) {
    flattenAbilities(data.abilities)
  }
  
  if (data.ability_changes) {
    flattenAbilities(data.ability_changes)
  }

  // Exotic armor (flattened from nested structure)
  function flattenExoticArmor(obj: any, classType = ''): void {
    Object.entries(obj).forEach(([key, value]: [string, any]) => {
      if (value.changes) {
        const title = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        sections.push({
          id: `armor-${classType}-${key}`,
          title: `${title} (${classType.replace(/\b\w/g, l => l.toUpperCase())})`,
          category: 'armor',
          changes: value.changes
        })
      } else {
        flattenExoticArmor(value, key)
      }
    })
  }
  
  if (data.exotic_armor) {
    flattenExoticArmor(data.exotic_armor)
  }
  
  if (data.exotic_armor_changes) {
    flattenExoticArmor(data.exotic_armor_changes)
  }

  return sections
}

export default function PatchNotesParser() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedChangeType, setSelectedChangeType] = useState<string>('all')
  const [patchData, setPatchData] = useState<PatchSection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPatchData = async () => {
      try {
        const response = await fetch('/fatepatch.json')
        const data: PatchData = await response.json()
        const transformedData = transformData(data)
        setPatchData(transformedData)
      } catch (error) {
        console.error('Error loading patch data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPatchData()
  }, [])

  const filteredData = useMemo(() => {
    return patchData.filter(section => {
      const matchesSearch = searchTerm === '' || 
        section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.changes.some(change => 
          change.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      
      const matchesCategory = selectedCategory === 'all' || section.category === selectedCategory
      
      const matchesChangeType = selectedChangeType === 'all' || 
        section.changes.some(change => change.type === selectedChangeType)
      
      return matchesSearch && matchesCategory && matchesChangeType
    })
  }, [searchTerm, selectedCategory, selectedChangeType, patchData])

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'buff':
        return <TrendingUp className="h-4 w-4" />
      case 'nerf':
        return <TrendingDown className="h-4 w-4" />
      case 'rework':
        return <Target className="h-4 w-4" />
      case 'change':
        return <Wrench className="h-4 w-4" />
      case 'new':
        return <Zap className="h-4 w-4" />
      default:
        return null
    }
  }

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'buff':
        return 'bg-green-500/10 text-green-600 border-green-500/20'
      case 'nerf':
        return 'bg-red-500/10 text-red-600 border-red-500/20'
      case 'rework':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
      case 'change':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20'
      case 'new':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
      default:
        return ''
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'weapons':
        return <Target className="h-4 w-4" />
      case 'abilities':
        return <Zap className="h-4 w-4" />
      case 'exotics':
        return <Shield className="h-4 w-4" />
      case 'systems':
        return <Cpu className="h-4 w-4" />
      case 'armor':
        return <Shield className="h-4 w-4" />
      case 'features':
        return <Zap className="h-4 w-4" />
      default:
        return null
    }
  }

  const stats = useMemo(() => {
    const buffs = patchData.reduce((acc, section) => 
      acc + section.changes.filter(change => change.type === 'buff').length, 0)
    const nerfs = patchData.reduce((acc, section) => 
      acc + section.changes.filter(change => change.type === 'nerf').length, 0)
    const reworks = patchData.reduce((acc, section) => 
      acc + section.changes.filter(change => change.type === 'rework').length, 0)
    const changes = patchData.reduce((acc, section) => 
      acc + section.changes.filter(change => change.type === 'change').length, 0)
    const newFeatures = patchData.reduce((acc, section) => 
      acc + section.changes.filter(change => change.type === 'new').length, 0)
    
    return { buffs, nerfs, reworks, changes, newFeatures }
  }, [patchData])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 flex items-center justify-center">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Loading patch notes...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Destiny 2: The Edge of Fate
          </h1>
          <p className="text-xl text-slate-300 mb-6">
            Patch Notes Parser & Analysis
          </p>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="text-2xl font-bold text-green-500">{stats.buffs}</span>
                </div>
                <p className="text-sm text-slate-300">Buffs</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  <span className="text-2xl font-bold text-red-500">{stats.nerfs}</span>
                </div>
                <p className="text-sm text-slate-300">Nerfs</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  <span className="text-2xl font-bold text-blue-500">{stats.reworks}</span>
                </div>
                <p className="text-sm text-slate-300">Reworks</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Wrench className="h-5 w-5 text-orange-500" />
                  <span className="text-2xl font-bold text-orange-500">{stats.changes}</span>
                </div>
                <p className="text-sm text-slate-300">Changes</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span className="text-2xl font-bold text-yellow-500">{stats.newFeatures}</span>
                </div>
                <p className="text-sm text-slate-300">New Features</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search weapons, abilities, or changes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                  className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                >
                  All
                </Button>
                <Button
                  variant={selectedCategory === 'features' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('features')}
                  className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Features
                </Button>
                <Button
                  variant={selectedCategory === 'systems' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('systems')}
                  className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                >
                  <Cpu className="h-4 w-4 mr-2" />
                  Systems
                </Button>
                <Button
                  variant={selectedCategory === 'weapons' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('weapons')}
                  className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Weapons
                </Button>
                <Button
                  variant={selectedCategory === 'abilities' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('abilities')}
                  className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Abilities
                </Button>
                <Button
                  variant={selectedCategory === 'exotics' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('exotics')}
                  className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Exotics
                </Button>
                <Button
                  variant={selectedCategory === 'armor' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('armor')}
                  className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Armor
                </Button>
              </div>
            </div>
            
            <Separator className="my-4 bg-slate-600" />
            
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-slate-300 mr-2">Filter by change type:</span>
              <Button
                variant={selectedChangeType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedChangeType('all')}
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                All Changes
              </Button>
              <Button
                variant={selectedChangeType === 'buff' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedChangeType('buff')}
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Buffs
              </Button>
              <Button
                variant={selectedChangeType === 'nerf' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedChangeType('nerf')}
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                <TrendingDown className="h-4 w-4 mr-2" />
                Nerfs
              </Button>
              <Button
                variant={selectedChangeType === 'rework' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedChangeType('rework')}
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                <Target className="h-4 w-4 mr-2" />
                Reworks
              </Button>
              <Button
                variant={selectedChangeType === 'change' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedChangeType('change')}
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                <Wrench className="h-4 w-4 mr-2" />
                Changes
              </Button>
              <Button
                variant={selectedChangeType === 'new' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedChangeType('new')}
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                <Zap className="h-4 w-4 mr-2" />
                New
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          {filteredData.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-8 text-center">
                <p className="text-slate-400">No changes found matching your search criteria.</p>
              </CardContent>
            </Card>
          ) : (
            filteredData.map((section) => (
              <Card key={section.id} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(section.category)}
                      <CardTitle className="text-xl text-white">{section.title}</CardTitle>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {section.changes.map((change, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className={`${getChangeTypeColor(change.type)} capitalize`}
                        >
                          {getChangeTypeIcon(change.type)}
                          <span className="ml-1">{change.type}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {section.description && (
                      <div className="text-slate-300 text-sm leading-relaxed p-3 bg-slate-700/30 rounded-lg">
                        {section.description}
                      </div>
                    )}
                    
                    {section.components && (
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white">Components</h4>
                        <div className="space-y-3">
                          {Object.entries(section.components).map(([key, component]: [string, any]) => (
                            <div key={key} className="bg-slate-700/30 rounded-lg p-4">
                              <h5 className="font-medium text-white mb-2 capitalize">
                                {key.replace(/_/g, ' ')}
                              </h5>
                              {component.title && (
                                <p className="text-sm text-slate-300 mb-2">{component.title}</p>
                              )}
                              {component.description && (
                                <p className="text-sm text-slate-400 mb-3">{component.description}</p>
                              )}
                              {component.sections && (
                                <div className="space-y-2">
                                  {component.sections.map((section: any, idx: number) => (
                                    <div key={idx} className="bg-slate-600/30 rounded p-3">
                                      <h6 className="font-medium text-white text-sm mb-2">{section.name}</h6>
                                      {section.tiers && (
                                        <div className="space-y-1">
                                          {section.tiers.map((tier: any, tierIdx: number) => (
                                            <div key={tierIdx} className="flex justify-between text-xs text-slate-300">
                                              <span>{tier.name}</span>
                                              <span>Power: {tier.power}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      {section.categories && (
                                        <div className="space-y-1">
                                          {section.categories.map((cat: any, catIdx: number) => (
                                            <div key={catIdx} className="text-xs text-slate-300">
                                              <span className="font-medium">{cat.name}:</span> {cat.description}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {component.components && (
                                <div className="space-y-2">
                                  {component.components.map((comp: any, compIdx: number) => (
                                    <div key={compIdx} className="bg-slate-600/30 rounded p-3">
                                      <h6 className="font-medium text-white text-sm mb-1">{comp.name}</h6>
                                      <p className="text-xs text-slate-300">{comp.description}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {component.tiers && (
                                <div className="space-y-1">
                                  {component.tiers.map((tier: any, tierIdx: number) => (
                                    <div key={tierIdx} className="flex justify-between text-xs text-slate-300 bg-slate-600/30 rounded p-2">
                                      <span>{tier.difficulty} ({tier.count})</span>
                                      <span>{tier.reward}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {Array.isArray(component) && (
                                <div className="space-y-1">
                                  {component.map((item: string, itemIdx: number) => (
                                    <div key={itemIdx} className="text-xs text-slate-300 bg-slate-600/30 rounded p-2">
                                      {item}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      {section.changes.map((change, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-start gap-2">
                            <Badge 
                              variant="outline" 
                              className={`${getChangeTypeColor(change.type)} capitalize flex-shrink-0`}
                            >
                              {getChangeTypeIcon(change.type)}
                              <span className="ml-1">{change.type}</span>
                            </Badge>
                          </div>
                          <div className="text-slate-300 text-sm leading-relaxed ml-1">
                            {change.description}
                            {change.examples && (
                              <div className="mt-2 space-y-1">
                                {change.examples.map((example: string, exampleIdx: number) => (
                                  <div key={exampleIdx} className="text-xs text-slate-400 bg-slate-700/30 rounded p-2">
                                    {example}
                                  </div>
                                ))}
                              </div>
                            )}
                            {change.new_stats && (
                              <div className="mt-3 space-y-2">
                                <h6 className="text-sm font-medium text-white">New Stats:</h6>
                                {Object.entries(change.new_stats).map(([statKey, stat]: [string, any]) => (
                                  <div key={statKey} className="bg-slate-700/30 rounded p-3">
                                    <div className="text-sm font-medium text-white capitalize mb-1">
                                      {statKey.replace(/_/g, ' ')}
                                    </div>
                                    <p className="text-xs text-slate-400 mb-2">{stat.description}</p>
                                    <div className="space-y-1">
                                      <div className="text-xs text-slate-300">
                                        <span className="font-medium">1-100:</span> {stat.benefit_1_100}
                                      </div>
                                      <div className="text-xs text-slate-300">
                                        <span className="font-medium">101-200:</span> {stat.benefit_101_200}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}