"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, BookOpen } from "lucide-react"

interface ContentCardProps {
  title: string
  description?: string
  url?: string
  index?: string
  category: string
  data?: any
  onClick?: () => void
}

export function ContentCard({ title, description, url, index, category, data, onClick }: ContentCardProps) {
  const handleExternalLink = () => {
    if (url) {
      window.open(`https://www.dnd5eapi.co${url}`, "_blank")
    }
  }

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      spells: "bg-purple-100 text-purple-800 border-purple-200",
      monsters: "bg-red-100 text-red-800 border-red-200",
      equipment: "bg-blue-100 text-blue-800 border-blue-200",
      classes: "bg-green-100 text-green-800 border-green-200",
      races: "bg-yellow-100 text-yellow-800 border-yellow-200",
      "magic-items": "bg-indigo-100 text-indigo-800 border-indigo-200",
    }
    return colors[cat] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-200 hover:border-primary/50 cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-playfair font-semibold group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
          <Badge variant="outline" className={getCategoryColor(category)}>
            {category.replace("-", " ")}
          </Badge>
        </div>
        {description && (
          <CardDescription className="text-sm text-muted-foreground line-clamp-2">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-2">
          {onClick && (
            <Button variant="outline" size="sm" onClick={onClick} className="flex-1 bg-transparent">
              <BookOpen className="w-4 h-4 mr-2" />
              View Details
            </Button>
          )}
          {url && (
            <Button variant="outline" size="sm" onClick={handleExternalLink} className="flex-1 bg-transparent">
              <ExternalLink className="w-4 h-4 mr-2" />
              API
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
