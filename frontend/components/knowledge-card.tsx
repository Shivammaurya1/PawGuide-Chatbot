import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface KnowledgeCardProps {
  title: string
  content: string
  petType: string
  timestamp: Date
  tags: string[]
  theme: string
  colors: any
}

export default function KnowledgeCard({ title, content, petType, timestamp, tags, theme, colors }: KnowledgeCardProps) {
  return (
    <Card className={cn(theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200")}>
      <CardHeader className="pb-2">
        <CardTitle className={cn("text-lg", colors.primary)}>{title}</CardTitle>
        <CardDescription>
          {petType} • {format(timestamp, "MMM d, yyyy")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{content}</p>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-1 pt-0">
        {tags.map((tag, i) => (
          <Badge key={i} variant="outline" className={cn("text-xs", colors.border, colors.primary)}>
            {tag}
          </Badge>
        ))}
      </CardFooter>
    </Card>
  )
}

