"use client"

import { useState, useEffect } from "react"
import { useTeam } from "@/contexts/team-context"
import { Check, ChevronsUpDown, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface SelectTeamMemberProps {
  onSelect: (memberId: string) => void
  selectedMemberId?: string
  label?: string
  placeholder?: string
  excludeIds?: string[]
  departmentId?: string
  roleId?: string
}

export function SelectTeamMember({
  onSelect,
  selectedMemberId,
  label = "Assign to",
  placeholder = "Select team member",
  excludeIds = [],
  departmentId,
  roleId,
}: SelectTeamMemberProps) {
  const [open, setOpen] = useState(false)
  const { teamMembers } = useTeam()
  const [filteredMembers, setFilteredMembers] = useState(teamMembers)
  
  // Filter team members based on provided filters
  useEffect(() => {
    let filtered = teamMembers;
    
    // Exclude specified IDs
    if (excludeIds.length > 0) {
      filtered = filtered.filter(member => !excludeIds.includes(member.id))
    }
    
    // Filter by department if specified
    if (departmentId) {
      filtered = filtered.filter(member => member.departmentId === departmentId)
    }
    
    // Filter by role if specified
    if (roleId) {
      filtered = filtered.filter(member => member.roleId === roleId)
    }
    
    setFilteredMembers(filtered)
  }, [teamMembers, excludeIds, departmentId, roleId])
  
  const selectedMember = teamMembers.find(m => m.id === selectedMemberId)
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedMember ? (
            <div className="flex items-center">
              <Avatar className="h-6 w-6 mr-2">
                {selectedMember.avatar ? <AvatarImage src={selectedMember.avatar} /> : null}
                <AvatarFallback>{getInitials(selectedMember.name)}</AvatarFallback>
              </Avatar>
              <span>{selectedMember.name}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search team members..." />
          <CommandEmpty>No team member found.</CommandEmpty>
          <CommandList>
            <CommandGroup heading={label}>
              {filteredMembers.map((member) => (
                <CommandItem
                  key={member.id}
                  value={`${member.name} ${member.email}`}
                  onSelect={() => {
                    onSelect(member.id)
                    setOpen(false)
                  }}
                  className="flex items-center"
                >
                  <Avatar className="h-6 w-6 mr-2">
                    {member.avatar ? <AvatarImage src={member.avatar} /> : null}
                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span>{member.name}</span>
                    <span className="text-xs text-muted-foreground">{member.roleName}</span>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      selectedMemberId === member.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 