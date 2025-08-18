"use client"

import type React from "react"

import { useState } from "react"
import { Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"

const API_ENDPOINTS = [
  { value: "ability-scores", label: "Ability Scores" },
  { value: "alignments", label: "Alignments" },
  { value: "backgrounds", label: "Backgrounds" },
  { value: "classes", label: "Classes" },
  { value: "conditions", label: "Conditions" },
  { value: "damage-types", label: "Damage Types" },
  { value: "equipment", label: "Equipment" },
  { value: "equipment-categories", label: "Equipment Categories" },
  { value: "feats", label: "Feats" },
  { value: "features", label: "Features" },
  { value: "languages", label: "Languages" },
  { value: "magic-items", label: "Magic Items" },
  { value: "magic-schools", label: "Magic Schools" },
  { value: "monsters", label: "Monsters" },
  { value: "proficiencies", label: "Proficiencies" },
  { value: "races", label: "Races" },
  { value: "rule-sections", label: "Rule Sections" },
  { value: "rules", label: "Rules" },
  { value: "skills", label: "Skills" },
  { value: "spells", label: "Spells" },
  { value: "subclasses", label: "Subclasses" },
  { value: "subraces", label: "Subraces" },
  { value: "traits", label: "Traits" },
  { value: "weapon-properties", label: "Weapon Properties" },
]

interface SearchBarProps {
  onSearch: (query: string, category: string) => void
  isLoading?: boolean
}

export function SearchBar({ onSearch, isLoading = false }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("spells")

  const handleSearch = () => {
    if (query.trim() || category) {
      onSearch(query.trim(), category)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <Card className="p-6 shadow-lg border-2 border-primary/20">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
          <div className="sm:flex-1">
            <Input
              placeholder="Search for spells, monsters, items..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="text-lg h-12 border-2 border-muted focus:border-primary"
            />
          </div>
          <div className="sm:flex-1">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-12 border-2 border-muted">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {API_ENDPOINTS.map((endpoint) => (
                  <SelectItem key={endpoint.value} value={endpoint.value}>
                    {endpoint.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSearch} disabled={isLoading} className="h-12 px-8 text-lg font-semibold">
            <Search className="w-5 h-5 mr-2" />
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>
    </Card>
  )
}
