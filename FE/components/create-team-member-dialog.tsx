"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Upload } from "lucide-react"
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
  DialogTrigger,
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
  roleId: z.string().min(1, {
    message: "Please select a role.",
  }),
  departmentId: z.string().min(1, {
    message: "Please select a department.",
  }),
  bio: z.string().optional(),
  phone: z.string().optional(),
  skills: z.string().optional(),
  avatar: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface CreateTeamMemberDialogProps {
  onMemberCreated?: (member: any) => void
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link"
  buttonSize?: "default" | "sm" | "lg" | "icon"
  fullWidth?: boolean
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

export function CreateTeamMemberDialog({
  onMemberCreated,
  buttonVariant = "default",
  buttonSize = "default",
  fullWidth = false,
}: CreateTeamMemberDialogProps) {
  const [open, setOpen] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { addTeamMember, departments, roles } = useTeam()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      roleId: "",
      departmentId: "",
      bio: "",
      phone: "",
      skills: "",
      avatar: "",
    },
  })

  // No need to fetch departments and roles since they are hardcoded in the TeamProvider

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    
    try {
      console.log("Submitting form with values:", values);
      
      // Create a clean object with the form values
      const memberData = {
        name: values.name,
        email: values.email,
        roleId: values.roleId || null,
        departmentId: values.departmentId || null,
        bio: values.bio || null,
        phone: values.phone || null,
        skills: values.skills || null,
        avatar: values.avatar || null
      };
      
      console.log("Adding team member with:", memberData);
      
      // Use the context function that now works with hardcoded data
      const newMember = await addTeamMember(memberData);
      
      if (newMember) {
        console.log("Team member created successfully:", newMember);
        
        // Notify parent component if callback provided
        if (onMemberCreated) {
          onMemberCreated(newMember);
        }
        
        // Reset form and close dialog
        form.reset();
        setAvatarPreview(null);
        setOpen(false);
      }
    } catch (error: any) {
      console.error("Error in onSubmit:", error);
      toast.error(error.message || "Failed to add team member");
    } finally {
      setIsSubmitting(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize} className={fullWidth ? "w-full" : ""}>
          <Plus className="mr-2 h-4 w-4" /> Add Team Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new team member. Click save when you're done.
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
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 p-1 rounded-full bg-primary text-primary-foreground cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  <span className="sr-only">Upload avatar</span>
                  <input
                    id="avatar-upload"
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
                name="roleId"
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
                name="departmentId"
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
                {isSubmitting ? 'Adding...' : 'Add Team Member'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

