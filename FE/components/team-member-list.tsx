"use client"

import { useState, useEffect } from "react"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { CreateTeamMemberDialog } from "@/components/create-team-member-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import api from "@/lib/api"
import { toast } from "sonner"

interface TeamMember {
  id: string
  name: string
  email: string
  role?: string
  roleName?: string
  department?: string
  departmentName?: string
  avatar?: string
}

interface TeamMemberListProps {
  initialMembers?: TeamMember[]
  onMemberAdded?: (member: TeamMember) => void
  onMemberDeleted?: (memberId: string) => void
}

export function TeamMemberList({ initialMembers = [], onMemberAdded, onMemberDeleted }: TeamMemberListProps) {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null)

  useEffect(() => {
    if (initialMembers.length > 0) {
      setMembers(initialMembers)
      setLoading(false)
    } else {
      fetchMembers()
    }
  }, [initialMembers])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const data = await api.teamMembers.getAll()
      setMembers(data)
      setError(null)
    } catch (err) {
      console.error("Error fetching team members:", err)
      setError("Failed to load team members")
      toast.error("Failed to load team members")
    } finally {
      setLoading(false)
    }
  }

  const handleMemberAdded = (newMember: TeamMember) => {
    setMembers(prev => [...prev, newMember])
    if (onMemberAdded) {
      onMemberAdded(newMember)
    }
    toast.success("Team member added successfully")
  }

  const handleMemberDeleted = async (memberId: string) => {
    try {
      const response = await api.teamMembers.delete(memberId)
      setMembers(prev => prev.filter(member => member.id !== memberId))
      
      if (onMemberDeleted) {
        onMemberDeleted(memberId)
      }
      
      toast.success("Team member deleted successfully")
    } catch (error) {
      console.error("Error deleting team member:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete team member")
    } finally {
      setDeleteMemberId(null)
    }
  }

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'
  }

  if (loading) {
    return <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  }

  if (error) {
    return <div className="text-red-500 p-4 border border-red-200 rounded bg-red-50">
      Error: {error}
    </div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Team Members</h2>
        <CreateTeamMemberDialog onMemberCreated={handleMemberAdded} />
      </div>

      {members.length === 0 ? (
        <div className="text-center p-8 border border-dashed rounded-md">
          <p className="text-muted-foreground">No team members found. Add your first team member to get started.</p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        {member.avatar ? (
                          <AvatarImage src={member.avatar} alt={member.name} />
                        ) : null}
                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      {member.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    {member.roleName ? (
                      <Badge variant="outline">{member.roleName}</Badge>
                    ) : member.role ? (
                      <Badge variant="outline">{member.role}</Badge>
                    ) : null}
                  </TableCell>
                  <TableCell>{member.departmentName || member.department || '-'}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-destructive"
                      onClick={() => setDeleteMemberId(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!deleteMemberId} onOpenChange={() => setDeleteMemberId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the team member
              and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteMemberId && handleMemberDeleted(deleteMemberId)}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 