import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDown, ArrowUp } from "lucide-react"

interface TaskSummaryProps {
  title: string
  value: string
  description: string
  trend: string
  trendDirection?: "up" | "down"
}

export function TaskSummary({ title, value, description, trend, trendDirection = "up" }: TaskSummaryProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        <div className="mt-2 flex items-center text-xs">
          {trendDirection === "up" ? (
            <ArrowUp className="mr-1 h-4 w-4 text-emerald-500" />
          ) : (
            <ArrowDown className="mr-1 h-4 w-4 text-rose-500" />
          )}
          <span className={trendDirection === "up" ? "text-emerald-500" : "text-rose-500"}>{trend}</span>
        </div>
      </CardContent>
    </Card>
  )
}

