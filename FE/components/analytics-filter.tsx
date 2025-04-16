"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, Filter, Users } from "lucide-react"
import { format, subDays } from "date-fns"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import api, { departmentsApi } from "@/lib/api"
import { toast } from "sonner"

interface AnalyticsFilterProps {
  onFilterChange: (filters: {
    dateRange: { from: Date; to: Date }
    view: "personal" | "team" | "organization"
    project?: string
    department?: string
    member?: string
  }) => void
  onViewChange: (view: "personal" | "team" | "organization") => void
}

interface Department {
  id: string;
  name: string;
  description?: string;
}

export function AnalyticsFilter({ onFilterChange, onViewChange }: AnalyticsFilterProps) {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  const [view, setView] = useState<"personal" | "team" | "organization">("organization")
  const [project, setProject] = useState<string | undefined>(undefined)
  const [department, setDepartment] = useState<string | undefined>(undefined)
  const [member, setMember] = useState<string | undefined>(undefined)
  const [isOpen, setIsOpen] = useState(false)

  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const [departments, setDepartments] = useState<Department[]>([])
  const [loadingDepartments, setLoadingDepartments] = useState(false)

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoadingDepartments(true);
    try {
      // Get the departments API with fallback
      const deptAPI = api?.departments || departmentsApi;
      
      // Safely get departments data with fallback
      const getAllDepartments = deptAPI.getAll || (() => Promise.resolve([]));
      const departmentsData = await getAllDepartments().catch(err => {
        console.error("Error fetching departments:", err);
        return [];
      });
      
      setDepartments(departmentsData || []);
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast.error("Failed to load departments");
      setDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const handleFilterApply = () => {
    const newFilters = []

    newFilters.push(`Date: ${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d")}`)

    if (project) {
      newFilters.push(`Project: ${getProjectName(project)}`)
    }

    if (department) {
      newFilters.push(`Dept: ${getDepartmentName(department)}`)
    }

    if (member) {
      newFilters.push(`Member: ${getMemberName(member)}`)
    }

    setActiveFilters(newFilters)

    onFilterChange({
      dateRange,
      view,
      project,
      department,
      member,
    })

    setIsOpen(false)
  }

  const getProjectName = (id: string) => {
    const projects: Record<string, string> = {
      project1: "Website Redesign",
      project2: "Mobile App",
      project3: "Marketing Campaign",
      project4: "Product Launch",
    }
    return projects[id] || id
  }

  const getDepartmentName = (id: string) => {
    const found = departments.find(d => d.id === id);
    return found ? found.name : id;
  }

  const getMemberName = (id: string) => {
    const members: Record<string, string> = {
      user1: "Alice Johnson",
      user2: "Bob Smith",
      user3: "Charlie Davis",
      user4: "Diana Miller",
    }
    return members[id] || id
  }

  const clearFilters = () => {
    setProject(undefined)
    setDepartment(undefined)
    setMember(undefined)
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
      department: undefined,
      member: undefined,
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
      case "Dept":
        setDepartment(undefined)
        break
      case "Member":
        setMember(undefined)
        break
      default:
        break
    }

    onFilterChange({
      dateRange,
      view,
      project: type === "Project" ? undefined : project,
      department: type === "Dept" ? undefined : department,
      member: type === "Member" ? undefined : member,
    })
  }

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs
          defaultValue="personal"
          value={view}
          onValueChange={(value) => {
            const newView = value as "personal" | "team" | "organization"
            setView(newView)
            onViewChange(newView)
            onFilterChange({
              dateRange,
              view: newView,
              project,
              department,
              member,
            })
          }}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="organization">Organization</TabsTrigger>
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
            <PopoverContent className="w-80 max-h-[85vh] overflow-y-auto">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Date Range</h4>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.from ? format(dateRange.from, "LLL dd, y") : <span>Pick a date</span>}
                          {dateRange.to ? ` - ${format(dateRange.to, "LLL dd, y")}` : ""}
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
                      <SelectValue placeholder="All Projects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="project1">Website Redesign</SelectItem>
                      <SelectItem value="project2">Mobile App</SelectItem>
                      <SelectItem value="project3">Marketing Campaign</SelectItem>
                      <SelectItem value="project4">Product Launch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Department</h4>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingDepartments ? "Loading departments..." : "All Departments"} />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.length > 0 ? (
                        departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id || "undefined-dept"}>
                            {dept.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-departments" disabled>No departments found</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Team Member</h4>
                  <Select value={member} onValueChange={setMember}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Members" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user1">Alice Johnson</SelectItem>
                      <SelectItem value="user2">Bob Smith</SelectItem>
                      <SelectItem value="user3">Charlie Davis</SelectItem>
                      <SelectItem value="user4">Diana Miller</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-between">
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

          <Button variant="outline" size="icon">
            <Users className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {activeFilters.map((filter) => (
            <Badge key={filter} variant="outline" className="flex items-center gap-1">
              {filter}
              <button className="ml-1 rounded-full hover:bg-muted p-0.5" onClick={() => removeFilter(filter)}>
                <span className="sr-only">Remove filter</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M9 3L3 9M3 3L9 9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </Badge>
          ))}

          {activeFilters.length > 1 && (
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={clearFilters}>
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

