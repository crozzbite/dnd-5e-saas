"use client"

import { useState, useRef } from "react"
import { SearchBar } from "@/components/search-bar"
import { ContentCard } from "@/components/content-card"
import { ContentDetailModal } from "@/components/content-detail-modal"
import { AdvancedFilters } from "@/components/advanced-filters"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sword, Shield, Sparkles, Users, BookOpen, Dice6 } from "lucide-react"

interface SearchResult {
  index: string
  name: string
  url: string
}

interface DetailedContent {
  [key: string]: any
}

export default function HomePage() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedContent, setSelectedContent] = useState<DetailedContent | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({})
  const [currentQuery, setCurrentQuery] = useState("")
  const [baseResults, setBaseResults] = useState<SearchResult[]>([]) // Added state to store base results before filtering
  const abortControllerRef = useRef<AbortController | null>(null)

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const fetchWithRetry = async (url: string, maxRetries = 3): Promise<any> => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url)

        if (response.status === 429) {
          const waitTime = Math.pow(2, i) * 1000
          console.log(`[v0] Rate limited, waiting ${waitTime}ms before retry ${i + 1}/${maxRetries}`)
          await delay(waitTime)
          continue
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        return await response.json()
      } catch (error) {
        if (i === maxRetries - 1) throw error
        await delay(1000 * (i + 1))
      }
    }
  }

  const handleSearch = async (query: string, category: string) => {
    setIsLoading(true)
    setSelectedCategory(category)
    setCurrentQuery(query)
    setActiveFilters({}) // Reset active filters when doing a new search

    try {
      const data = await fetchWithRetry(`https://www.dnd5eapi.co/api/${category}`)
      let results = data.results || []

      if (query) {
        results = results.filter((item: SearchResult) => item.name.toLowerCase().includes(query.toLowerCase()))
      }

      setBaseResults(results) // Store base results and set them as current results
      setSearchResults(results)
    } catch (error) {
      console.error("Error fetching data:", error)
      setSearchResults([])
      setBaseResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const applyAdvancedFilters = async (results: SearchResult[], category: string, filters: Record<string, string[]>) => {
    // Cancel any previous filtering operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller for this operation
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    if (Object.keys(filters).length === 0) return results

    console.log(`[v0] Starting optimized filtering for ${results.length} items`)

    try {
      // For most categories, we need to fetch details to filter properly
      // But we'll do it more efficiently with smaller delays and better batching
      const filteredResults = []
      const batchSize = 10 // Increased batch size
      const delayBetweenRequests = 50 // Reduced delay significantly
      const delayBetweenBatches = 200 // Much shorter batch delay

      for (let i = 0; i < results.length; i += batchSize) {
        // Check if operation was cancelled
        if (signal.aborted) {
          console.log("[v0] Filtering operation cancelled")
          return []
        }

        const batch = results.slice(i, i + batchSize)
        console.log(`[v0] Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(results.length / batchSize)}`)

        // Process batch items in parallel for better performance
        const batchPromises = batch.map(async (item) => {
          if (signal.aborted) return null

          try {
            const detailData = await fetchWithRetry(`https://www.dnd5eapi.co${item.url}`)

            if (signal.aborted) return null

            let matchesFilters = true

            for (const [filterType, filterValues] of Object.entries(filters)) {
              if (filterValues.length === 0) continue

              let itemMatches = false

              switch (category) {
                case "spells":
                  if (filterType === "level" && filterValues.includes(detailData.level?.toString())) {
                    itemMatches = true
                  } else if (filterType === "school" && filterValues.includes(detailData.school?.index)) {
                    itemMatches = true
                  } else if (
                    filterType === "class" &&
                    detailData.classes?.some((cls: any) => filterValues.includes(cls.index))
                  ) {
                    itemMatches = true
                  }
                  break

                case "monsters":
                  if (filterType === "challenge_rating") {
                    const cr = detailData.challenge_rating?.toString()
                    if (filterValues.includes(cr) || (filterValues.includes("10+") && Number.parseFloat(cr) >= 10)) {
                      itemMatches = true
                    }
                  } else if (filterType === "type" && filterValues.includes(detailData.type?.toLowerCase())) {
                    itemMatches = true
                  } else if (filterType === "size" && filterValues.includes(detailData.size?.toLowerCase())) {
                    itemMatches = true
                  }
                  break

                case "equipment":
                  if (
                    filterType === "equipment_category" &&
                    detailData.equipment_category?.index &&
                    filterValues.includes(detailData.equipment_category.index)
                  ) {
                    itemMatches = true
                  }
                  break

                default:
                  itemMatches = true
              }

              if (!itemMatches) {
                matchesFilters = false
                break
              }
            }

            return matchesFilters ? item : null
          } catch (error) {
            console.error(`[v0] Error fetching details for ${item.name}:`, error)
            return item // Include item if there's an error fetching details
          }
        })

        // Wait for all batch promises to complete
        const batchResults = await Promise.all(batchPromises)

        // Add non-null results to filtered results
        batchResults.forEach((result) => {
          if (result && !signal.aborted) {
            filteredResults.push(result)
          }
        })

        // Small delay between batches, but much shorter
        if (i + batchSize < results.length && !signal.aborted) {
          await delay(delayBetweenBatches)
        }
      }

      if (signal.aborted) {
        console.log("[v0] Filtering operation was cancelled")
        return []
      }

      console.log(`[v0] Filtering complete: ${filteredResults.length}/${results.length} items match filters`)
      return filteredResults
    } catch (error) {
      if (signal.aborted) {
        console.log("[v0] Filtering operation was cancelled")
        return []
      }
      console.error("[v0] Error during filtering:", error)
      return results // Return original results if filtering fails
    }
  }

  const handleFiltersChange = (filters: Record<string, string[]>) => {
    setActiveFilters(filters)
    // Don't automatically apply filters - wait for submit button
  }

  const handleApplyFilters = async (filters: Record<string, string[]>) => {
    if (!selectedCategory) return

    setIsLoading(true)
    try {
      let resultsToFilter = baseResults

      // If no base results (no prior search), fetch all items from the selected category
      if (baseResults.length === 0 && selectedCategory) {
        console.log(`[v0] No base results, fetching all ${selectedCategory} for filtering`)
        const data = await fetchWithRetry(`https://www.dnd5eapi.co/api/${selectedCategory}`)
        resultsToFilter = data.results || []
        setBaseResults(resultsToFilter) // Store as base results for future filtering
      }

      if (Object.keys(filters).length === 0) {
        // No filters selected, show all results
        setSearchResults(resultsToFilter)
      } else {
        // Apply filters to results
        const filteredResults = await applyAdvancedFilters(resultsToFilter, selectedCategory, filters)
        // Only update results if the operation wasn't cancelled
        if (filteredResults.length > 0 || Object.keys(filters).length > 0) {
          setSearchResults(filteredResults)
        }
      }
    } catch (error) {
      console.error("Error applying filters:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = async (item: SearchResult, category: string) => {
    try {
      const data = await fetchWithRetry(`https://www.dnd5eapi.co${item.url}`)
      setSelectedContent(data)
      setSelectedCategory(category)
      setIsModalOpen(true)
    } catch (error) {
      console.error("Error fetching detailed content:", error)
    }
  }

  const quickSearchCategories = [
    { key: "spells", label: "Spells", icon: Sparkles, description: "Magical spells and cantrips" },
    { key: "monsters", label: "Monsters", icon: Sword, description: "Creatures and beasts" },
    { key: "equipment", label: "Equipment", icon: Shield, description: "Weapons, armor, and gear" },
    { key: "classes", label: "Classes", icon: Users, description: "Character classes" },
    { key: "races", label: "Races", icon: BookOpen, description: "Player character races" },
    { key: "magic-items", label: "Magic Items", icon: Dice6, description: "Enchanted items and artifacts" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/10 to-background border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-playfair font-bold text-foreground mb-4">D&D 5e Compendium</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your ultimate companion for Dungeons & Dragons 5th Edition. Search through spells, monsters, equipment,
              and more.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
            {selectedCategory && (
              <div className="mt-6">
                <AdvancedFilters
                  category={selectedCategory}
                  onFiltersChange={handleFiltersChange}
                  onFiltersApply={handleApplyFilters}
                  isVisible={showAdvancedFilters}
                  onToggle={() => setShowAdvancedFilters(!showAdvancedFilters)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Searching the archives...</p>
        </div>
      )}

      {/* Quick Access Categories */}
      {searchResults.length === 0 && !isLoading && (
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-playfair font-semibold text-center mb-12">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickSearchCategories.map((category) => {
              const Icon = category.icon
              return (
                <Card
                  key={category.key}
                  className="hover:shadow-lg transition-all duration-200 hover:border-primary/50 cursor-pointer group"
                >
                  <CardContent className="p-6 text-center">
                    <Icon className="w-12 h-12 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-playfair font-semibold mb-2">{category.label}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{category.description}</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedCategory(category.key)
                        setShowAdvancedFilters(true)
                        handleSearch("", category.key)
                      }}
                      className="w-full"
                    >
                      Browse {category.label}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-2xl font-playfair font-semibold mb-8">Search Results ({searchResults.length} found)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {searchResults.map((item) => (
              <ContentCard
                key={item.index}
                title={item.name}
                url={item.url}
                index={item.index}
                category={selectedCategory || "general"}
                onClick={() => handleViewDetails(item, selectedCategory || "general")}
              />
            ))}
          </div>
        </div>
      )}

      {/* Content Detail Modal */}
      <ContentDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        content={selectedContent}
        category={selectedCategory}
      />

      {/* Footer */}
      <footer className="bg-card border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p className="mb-2">D&D 5e Compendium v1.0 • Built by CrozzBite with AI tools</p>
            <p className="mb-2">Built with the official D&D 5e SRD API • Free to use for all adventurers</p>
            <p className="text-sm">Dungeons & Dragons content is property of Wizards of the Coast</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
