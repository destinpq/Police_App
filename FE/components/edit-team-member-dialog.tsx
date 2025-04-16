"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Upload } from "lucide-react"
import { toast } from "sonner"
import { useTeam } from "@/contexts/team-context"
import api from "@/lib/api"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const formSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(50, {
      message: "Name must not exceed 50 characters.",
    }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  role: z.string().min(1, {
    message: "Please select a role.",
  }),
  department: z.string().min(1, {
    message: "Please select a department.",
  }),
  bio: z.string().optional(),
  phone: z.string().optional(),
  skills: z.string().optional(),
  avatar: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role?: string;
  department?: string;
  bio?: string;
  phone?: string;
  skills?: string;
  avatar?: string;
  roleName?: string;
  departmentName?: string;
}

interface EditTeamMemberDialogProps {
  member: TeamMember;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMemberUpdated?: (member: any) => void;
}

// Add interfaces for departments and roles
interface Department {
  id: string;
  name: string;
  description?: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
}

export function EditTeamMemberDialog({
  member,
  open,
  onOpenChange,
  onMemberUpdated,
}: EditTeamMemberDialogProps) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(member.avatar || null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { updateTeamMember } = useTeam()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: member.name || "",
      email: member.email || "",
      role: member.role || "",
      department: member.department || "",
      bio: member.bio || "",
      phone: member.phone || "",
      skills: member.skills || "",
      avatar: member.avatar || "",
    },
  })

  // Update form when member changes
  useEffect(() => {
    if (member) {
      form.reset({
        name: member.name || "",
        email: member.email || "",
        role: member.role || "",
        department: member.department || "",
        bio: member.bio || "",
        phone: member.phone || "",
        skills: member.skills || "",
        avatar: member.avatar || "",
      });
      setAvatarPreview(member.avatar || null);
    }
  }, [member, form]);

  // Fetch departments and roles when dialog opens
  useEffect(() => {
    if (open) {
      fetchDepartmentsAndRoles();
    }
  }, [open]);

  const fetchDepartmentsAndRoles = async () => {
    setIsLoading(true);
    try {
      // Fetch departments
      const departmentsData = await api.departments.getAll();
      setDepartments(departmentsData);

      // Fetch roles
      const rolesData = await api.roles.getAll();
      setRoles(rolesData);
    } catch (error) {
      console.error("Error fetching departments or roles:", error);
      toast.error("Failed to load departments or roles");
    } finally {
      setIsLoading(false);
    }
  };

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    
    try {
      // Use the context function to update the team member
      const memberData = {
        name: values.name,
        email: values.email,
        role: values.role || member.role || "",
        department: values.department || member.department || "",
        bio: values.bio,
        phone: values.phone,
        skills: values.skills,
        avatar: values.avatar
      };
      
      const updatedMember = await updateTeamMember(member.id, memberData)
      
      // Call the onMemberUpdated callback if provided and if member was updated successfully
      if (updatedMember && onMemberUpdated) {
        onMemberUpdated(updatedMember)
      }

      // Close the dialog
      onOpenChange(false)
      toast.success("Team member updated successfully")
    } catch (error) {
      // Error handling is done in the context
      console.error('Error in form submission:', error)
      toast.error("Failed to update team member")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarPreview(event.target.result as string)
          form.setValue("avatar", event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Team Member</DialogTitle>
          <DialogDescription>
            Update the details of this team member. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarPreview || ""} />
                  <AvatarFallback className="text-lg">
                    {form.watch("name")
                      ? form
                          .watch("name")
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .substring(0, 2)
                      : "?"}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload-edit"
                  className="absolute bottom-0 right-0 p-1 rounded-full bg-primary text-primary-foreground cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  <span className="sr-only">Upload avatar</span>
                  <input
                    id="avatar-upload-edit"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email address" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoading ? "Loading roles..." : "Select role"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.length > 0 ? (
                          roles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-roles" disabled>No roles found</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoading ? "Loading departments..." : "Select department"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.length > 0 ? (
                          departments.map((department) => (
                            <SelectItem key={department.id} value={department.id}>
                              {department.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-departments" disabled>No departments found</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea placeholder="A short bio about the team member" className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills</FormLabel>
                  <FormControl>
                    <Input placeholder="Comma-separated skills (e.g., JavaScript, React, UI Design)" {...field} />
                  </FormControl>
                  <FormDescription>Separate skills with commas</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 