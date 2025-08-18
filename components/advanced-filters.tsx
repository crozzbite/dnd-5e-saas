"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ChevronDown, ChevronUp, Filter, Search } from "lucide-react"

interface FilterOption {
  id: string
  label: string
  value: string
}

interface FilterGroup {
  id: string
  label: string
  options: FilterOption[]
}

interface AdvancedFiltersProps {
  category: string
  onFiltersChange: (filters: Record<string, string[]>) => void // Added onFiltersChange prop
  onFiltersApply: (filters: Record<string, string[]>) => void
  isVisible: boolean
  onToggle: () => void
}

const filterConfigs: Record<string, FilterGroup[]> = {
  spells: [
    {
      id: "level",
      label: "Spell Level",
      options: [
        { id: "0", label: "Cantrip (0)", value: "0" },
        { id: "1", label: "1st Level", value: "1" },
        { id: "2", label: "2nd Level", value: "2" },
        { id: "3", label: "3rd Level", value: "3" },
        { id: "4", label: "4th Level", value: "4" },
        { id: "5", label: "5th Level", value: "5" },
        { id: "6", label: "6th Level", value: "6" },
        { id: "7", label: "7th Level", value: "7" },
        { id: "8", label: "8th Level", value: "8" },
        { id: "9", label: "9th Level", value: "9" },
      ],
    },
    {
      id: "school",
      label: "School of Magic",
      options: [
        { id: "abjuration", label: "Abjuration", value: "abjuration" },
        { id: "conjuration", label: "Conjuration", value: "conjuration" },
        { id: "divination", label: "Divination", value: "divination" },
        { id: "enchantment", label: "Enchantment", value: "enchantment" },
        { id: "evocation", label: "Evocation", value: "evocation" },
        { id: "illusion", label: "Illusion", value: "illusion" },
        { id: "necromancy", label: "Necromancy", value: "necromancy" },
        { id: "transmutation", label: "Transmutation", value: "transmutation" },
      ],
    },
    {
      id: "class",
      label: "Spellcaster Class",
      options: [
        { id: "bard", label: "Bard", value: "bard" },
        { id: "cleric", label: "Cleric", value: "cleric" },
        { id: "druid", label: "Druid", value: "druid" },
        { id: "paladin", label: "Paladin", value: "paladin" },
        { id: "ranger", label: "Ranger", value: "ranger" },
        { id: "sorcerer", label: "Sorcerer", value: "sorcerer" },
        { id: "warlock", label: "Warlock", value: "warlock" },
        { id: "wizard", label: "Wizard", value: "wizard" },
      ],
    },
  ],
  monsters: [
    {
      id: "challenge_rating",
      label: "Challenge Rating",
      options: [
        { id: "0", label: "0", value: "0" },
        { id: "1/8", label: "1/8", value: "1/8" },
        { id: "1/4", label: "1/4", value: "1/4" },
        { id: "1/2", label: "1/2", value: "1/2" },
        { id: "1", label: "1", value: "1" },
        { id: "2", label: "2", value: "2" },
        { id: "3", label: "3", value: "3" },
        { id: "4", label: "4", value: "4" },
        { id: "5", label: "5", value: "5" },
        { id: "10", label: "10+", value: "10+" },
      ],
    },
    {
      id: "type",
      label: "Creature Type",
      options: [
        { id: "beast", label: "Beast", value: "beast" },
        { id: "humanoid", label: "Humanoid", value: "humanoid" },
        { id: "dragon", label: "Dragon", value: "dragon" },
        { id: "undead", label: "Undead", value: "undead" },
        { id: "fiend", label: "Fiend", value: "fiend" },
        { id: "celestial", label: "Celestial", value: "celestial" },
        { id: "fey", label: "Fey", value: "fey" },
        { id: "aberration", label: "Aberration", value: "aberration" },
      ],
    },
    {
      id: "size",
      label: "Size",
      options: [
        { id: "tiny", label: "Tiny", value: "tiny" },
        { id: "small", label: "Small", value: "small" },
        { id: "medium", label: "Medium", value: "medium" },
        { id: "large", label: "Large", value: "large" },
        { id: "huge", label: "Huge", value: "huge" },
        { id: "gargantuan", label: "Gargantuan", value: "gargantuan" },
      ],
    },
  ],
  equipment: [
    {
      id: "equipment_category",
      label: "Equipment Type",
      options: [
        { id: "weapon", label: "Weapons", value: "weapon" },
        { id: "armor", label: "Armor", value: "armor" },
        { id: "adventuring-gear", label: "Adventuring Gear", value: "adventuring-gear" },
        { id: "tools", label: "Tools", value: "tools" },
        { id: "mounts-and-vehicles", label: "Mounts & Vehicles", value: "mounts-and-vehicles" },
      ],
    },
  ],
  classes: [
    {
      id: "hit_die",
      label: "Hit Die",
      options: [
        { id: "6", label: "d6", value: "6" },
        { id: "8", label: "d8", value: "8" },
        { id: "10", label: "d10", value: "10" },
        { id: "12", label: "d12", value: "12" },
      ],
    },
  ],
  races: [
    {
      id: "size",
      label: "Size",
      options: [
        { id: "small", label: "Small", value: "small" },
        { id: "medium", label: "Medium", value: "medium" },
      ],
    },
  ],
}

export function AdvancedFilters({
  category,
  onFiltersChange,
  onFiltersApply,
  isVisible,
  onToggle,
}: AdvancedFiltersProps) {
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({})

  const currentFilters = filterConfigs[category] || []

  const handleFilterChange = (groupId: string, optionValue: string, checked: boolean) => {
    const newFilters = { ...selectedFilters }

    if (!newFilters[groupId]) {
      newFilters[groupId] = []
    }

    if (checked) {
      newFilters[groupId] = [...newFilters[groupId], optionValue]
    } else {
      newFilters[groupId] = newFilters[groupId].filter((value) => value !== optionValue)
    }

    // Remove empty filter groups
    if (newFilters[groupId].length === 0) {
      delete newFilters[groupId]
    }

    setSelectedFilters(newFilters)
    onFiltersChange(newFilters) // Notify parent of filter changes without applying
  }

  const clearAllFilters = () => {
    setSelectedFilters({})
    onFiltersChange({}) // Notify parent of cleared filters
    onFiltersApply({}) // Also apply the cleared filters immediately
  }

  const handleSubmitFilters = () => {
    onFiltersApply(selectedFilters)
  }

  const hasActiveFilters = Object.keys(selectedFilters).length > 0

  if (currentFilters.length === 0) {
    return null
  }

  return (
    <div className="w-full">
      {/* Toggle Button */}
      <Button variant="outline" onClick={onToggle} className="w-full mb-4 justify-between bg-transparent">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Advanced Filters
          {hasActiveFilters && (
            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
              {Object.values(selectedFilters).flat().length}
            </span>
          )}
        </div>
        {isVisible ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </Button>

      {/* Filters Panel */}
      {isVisible && (
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filter {category}</CardTitle>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentFilters.map((group) => (
                <div key={group.id} className="space-y-3">
                  <h4 className="font-semibold text-sm text-foreground">{group.label}</h4>
                  <div className="space-y-2">
                    {group.options.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${group.id}-${option.id}`}
                          checked={selectedFilters[group.id]?.includes(option.value) || false}
                          onCheckedChange={(checked) => handleFilterChange(group.id, option.value, checked as boolean)}
                        />
                        <Label htmlFor={`${group.id}-${option.id}`} className="text-sm font-normal cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t">
              <Button
                onClick={handleSubmitFilters}
                className="w-full bg-primary hover:bg-primary/90"
                disabled={!hasActiveFilters}
              >
                <Search className="w-4 h-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
