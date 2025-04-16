"use client"

import { TeamMember } from "@/contexts/team-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  UserCircle, 
  Phone, 
  Mail, 
  Briefcase, 
  Edit, 
  Trash,
  Lightbulb
} from "lucide-react"

interface TeamMemberCardProps {
  member: TeamMember
  onEdit?: (member: TeamMember) => void
  onDelete?: (id: string) => void
  showActions?: boolean
}

export function TeamMemberCard({ 
  member, 
  onEdit, 
  onDelete, 
  showActions = true 
}: TeamMemberCardProps) {
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12 border-2 border-primary">
              {member.avatar ? <AvatarImage src={member.avatar} /> : null}
              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{member.name}</CardTitle>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 opacity-70" />
            <span>{member.email}</span>
          </div>
          {member.phone && (
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 opacity-70" />
              <span>{member.phone}</span>
            </div>
          )}
          {member.bio && (
            <div className="flex items-start space-x-2">
              <UserCircle className="h-4 w-4 opacity-70 mt-0.5" />
              <p>{member.bio}</p>
            </div>
          )}
          {member.tasks !== undefined && (
            <div className="flex items-center space-x-2">
              <Briefcase className="h-4 w-4 opacity-70" />
              <span>{member.tasks} tasks</span>
            </div>
          )}
          {member.skills && (
            <div className="flex items-start space-x-2">
              <Lightbulb className="h-4 w-4 opacity-70 mt-0.5" />
              <div className="flex flex-wrap gap-1">
                {member.skills.split(',').map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      {showActions && (onEdit || onDelete) && (
        <CardFooter className="flex justify-end space-x-2 p-4 pt-0">
          {onEdit && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => onEdit(member)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit team member</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {onDelete && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(member.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete team member</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardFooter>
      )}
    </Card>
  )
} 