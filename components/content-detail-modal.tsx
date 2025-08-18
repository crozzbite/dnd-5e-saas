"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ContentDetailModalProps {
  isOpen: boolean
  onClose: () => void
  content: any
  category: string
}

export function ContentDetailModal({ isOpen, onClose, content, category }: ContentDetailModalProps) {
  if (!content) return null

  const renderSpellDetails = (spell: any) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground">Level</h4>
          <p>{spell.level === 0 ? "Cantrip" : `Level ${spell.level}`}</p>
        </div>
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground">School</h4>
          <p>{spell.school?.name || "Unknown"}</p>
        </div>
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground">Casting Time</h4>
          <p>{spell.casting_time}</p>
        </div>
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground">Range</h4>
          <p>{spell.range}</p>
        </div>
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground">Duration</h4>
          <p>{spell.duration}</p>
        </div>
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground">Components</h4>
          <div className="flex gap-1">
            {spell.components?.map((comp: string) => (
              <Badge key={comp} variant="outline" className="text-xs">
                {comp}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {spell.desc && (
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-2">Description</h4>
          <div className="space-y-2">
            {spell.desc.map((paragraph: string, index: number) => (
              <p key={index} className="text-sm leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      )}

      {spell.higher_level && (
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-2">At Higher Levels</h4>
          <div className="space-y-2">
            {spell.higher_level.map((paragraph: string, index: number) => (
              <p key={index} className="text-sm leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderMonsterDetails = (monster: any) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground">Size</h4>
          <p>{monster.size}</p>
        </div>
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground">Type</h4>
          <p>{monster.type}</p>
        </div>
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground">Alignment</h4>
          <p>{monster.alignment}</p>
        </div>
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground">Challenge Rating</h4>
          <p>
            {monster.challenge_rating} ({monster.xp} XP)
          </p>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-sm text-muted-foreground mb-2">Armor Class</h4>
        <p>{monster.armor_class?.[0]?.value || "Unknown"}</p>
      </div>

      <div>
        <h4 className="font-semibold text-sm text-muted-foreground mb-2">Hit Points</h4>
        <p>
          {monster.hit_points} ({monster.hit_dice})
        </p>
      </div>

      <div>
        <h4 className="font-semibold text-sm text-muted-foreground mb-2">Speed</h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(monster.speed || {}).map(([type, value]) => (
            <Badge key={type} variant="outline">
              {type}: {value}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )

  const renderValue = (value: any) => {
    const stringValue = String(value)

    if (
      stringValue.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ||
      stringValue.includes("image") ||
      stringValue.startsWith("/api/images/") ||
      (stringValue.startsWith("http") && stringValue.includes("img"))
    ) {
      // Construct full URL for D&D 5e API images
      const imageUrl = stringValue.startsWith("/api/images/") ? `https://www.dnd5eapi.co${stringValue}` : stringValue

      return (
        <div className="mt-2">
          <img
            src={imageUrl || "/placeholder.svg"}
            alt="D&D Content Image"
            className="max-w-full h-auto max-h-48 rounded-md border border-border shadow-sm object-cover"
            onError={(e) => {
              // Fallback to text if image fails to load
              const target = e.currentTarget as HTMLImageElement
              target.style.display = "none"
              const fallback = target.nextElementSibling as HTMLElement
              if (fallback) fallback.style.display = "block"
            }}
          />
          <p className="text-sm leading-relaxed mt-1 hidden break-words">{stringValue}</p>
        </div>
      )
    }

    return stringValue
  }

  const renderGenericDetails = (item: any) => (
    <div className="space-y-4">
      {item.desc && (
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-2">Description</h4>
          <div className="space-y-2">
            {Array.isArray(item.desc) ? (
              item.desc.map((paragraph: string, index: number) => (
                <p key={index} className="text-sm leading-relaxed break-words">
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="text-sm leading-relaxed break-words">{item.desc}</p>
            )}
          </div>
        </div>
      )}

      {Object.entries(item).map(([key, value]) => {
        if (key === "index" || key === "name" || key === "url" || key === "desc") return null
        if (typeof value === "object" && value !== null) return null

        const renderedValue = renderValue(value)
        const isImage = typeof renderedValue !== "string"

        return (
          <div key={key} className="overflow-hidden">
            <h4 className="font-semibold text-sm text-muted-foreground capitalize break-words">
              {key.replace(/_/g, " ")}
            </h4>
            {isImage ? (
              renderedValue
            ) : (
              <p className="text-sm leading-relaxed break-words overflow-hidden">{renderedValue}</p>
            )}
          </div>
        )
      })}
    </div>
  )

  const renderContent = () => {
    switch (category) {
      case "spells":
        return renderSpellDetails(content)
      case "monsters":
        return renderMonsterDetails(content)
      default:
        return renderGenericDetails(content)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[70vh]">
        <DialogHeader>
          <DialogTitle className="font-playfair text-2xl break-words">{content.name}</DialogTitle>
          <DialogDescription>
            <Badge variant="outline" className="w-fit">
              {category.replace("-", " ")}
            </Badge>
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <ScrollArea className="max-h-[200px] pr-4">
          <div className="break-words pb-4">{renderContent()}</div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
