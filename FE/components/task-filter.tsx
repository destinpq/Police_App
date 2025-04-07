"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, Filter, X } from "lucide-react"
import { format, subDays } from "date-fns"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import api from "@/lib/api"
import { toast } from "sonner"
import { useTeam } from "@/contexts/team-context"

interface TaskFilterProps {
  onFilterChange: (filters: {
    dateRange: { from: Date; to: Date }
    view: "personal" | "team" | "organization"
    project?: string
    status?: string
    priority?: string
    assignee?: string
  }) => void
}

interface Project {
  id: string;
  name: string;
}

export function TaskFilter({ onFilterChange }: TaskFilterProps) {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  const [view, setView] = useState<"personal" | "team" | "organization">("personal")
  const [project, setProject] = useState<string | undefined>(undefined)
  const [status, setStatus] = useState<string | undefined>(undefined)
  const [priority, setPriority] = useState<string | undefined>(undefined)
  const [assignee, setAssignee] = useState<string | undefined>(undefined)
  const [isOpen, setIsOpen] = useState(false)

  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const { teamMembers } = useTeam()

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const projectsData = await api.projects.getAll();
      setProjects(projectsData);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleFilterApply = () => {
    const newFilters = []

    newFilters.push(`Date: ${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d")}`)

    if (project) {
      newFilters.push(`Project: ${project}`)
    }

    if (status) {
      newFilters.push(`Status: ${status}`)
    }

    if (priority) {
      newFilters.push(`Priority: ${priority}`)
    }

    if (assignee) {
      newFilters.push(`Assignee: ${assignee}`)
    }

    setActiveFilters(newFilters)

    onFilterChange({
      dateRange,
      view,
      project,
      status,
      priority,
      assignee,
    })

    setIsOpen(false)
  }

  const clearFilters = () => {
    setProject(undefined)
    setStatus(undefined)
    setPriority(undefined)
    setAssignee(undefined)
    setDateRange({
      from: subDays(new Date(), 30),
      to: new Date(),
    })
    setActiveFilters([])

    onFilterChange({
      dateRange: {
        from: subDays(new Date(), 30),
        to: new Date(),
      },
      view,
      project: undefined,
      status: undefined,
      priority: undefined,
      assignee: undefined,
    })
  }

  const removeFilter = (filter: string) => {
    const newFilters = activeFilters.filter((f) => f !== filter)
    setActiveFilters(newFilters)

    // Extract the filter type and value
    const [type] = filter.split(": ")

    switch (type) {
      case "Project":
        setProject(undefined)
        break
      case "Status":
        setStatus(undefined)
        break
      case "Priority":
        setPriority(undefined)
        break
      case "Assignee":
        setAssignee(undefined)
        break
      default:
        break
    }

    onFilterChange({
      dateRange,
      view,
      project: type === "Project" ? undefined : project,
      status: type === "Status" ? undefined : status,
      priority: type === "Priority" ? undefined : priority,
      assignee: type === "Assignee" ? undefined : assignee,
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs
          defaultValue="personal"
          value={view}
          onValueChange={(value) => {
            setView(value as "personal" | "team" | "organization")
            onFilterChange({
              dateRange,
              view: value as "personal" | "team" | "organization",
              project,
              status,
              priority,
              assignee,
            })
          }}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">My Tasks</TabsTrigger>
            <TabsTrigger value="team">Team Tasks</TabsTrigger>
            <TabsTrigger value="organization">All Tasks</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[80vw] sm:w-[400px] max-w-[400px] max-h-[85vh] overflow-y-auto">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Date Range</h4>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          <span className="truncate">
                            {dateRange.from ? format(dateRange.from, "LLL dd, y") : <span>Pick a date</span>}
                            {dateRange.to ? ` - ${format(dateRange.to, "LLL dd, y")}` : ""}
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="range"
                          selected={{
                            from: dateRange.from,
                            to: dateRange.to,
                          }}
                          onSelect={(range) => {
                            if (range?.from && range?.to) {
                              setDateRange({ from: range.from, to: range.to })
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Project</h4>
                  <Select value={project} onValueChange={setProject}>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingProjects ? "Loading projects..." : "All Projects"} />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.length > 0 ? (
                        projects.map((proj) => (
                          <SelectItem key={proj.id} value={proj.id || "undefined-project"}>
                            {proj.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-projects" disabled>No projects found</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Status</h4>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Priority</h4>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Assignee</h4>
                  <Select value={assignee} onValueChange={setAssignee}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Assignees" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.length > 0 ? (
                        teamMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id || "undefined-member"}>
                            {member.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-members" disabled>No team members found</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear
                  </Button>
                  <Button size="sm" onClick={handleFilterApply}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <Badge key={filter} variant="outline" className="rounded-md flex items-center gap-1 py-1">
              <span className="text-xs">{filter}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1 text-muted-foreground hover:text-foreground"
                onClick={() => removeFilter(filter)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove filter</span>
              </Button>
            </Badge>
          ))}
          {activeFilters.length > 1 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={clearFilters}>
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

