"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function TeamPage() {
  // Dummy team data since the API might not have team endpoints yet
  const teamMembers = [
    {
      id: "user1",
      name: "Alice Johnson",
      role: "Product Manager",
      email: "alice@example.com",
      avatar: "/avatars/alice.jpg",
      tasks: 12,
      projects: 3
    },
    {
      id: "user2",
      name: "Bob Smith",
      role: "Frontend Developer",
      email: "bob@example.com",
      avatar: "/avatars/bob.jpg",
      tasks: 8,
      projects: 2
    },
    {
      id: "user3",
      name: "Charlie Davis",
      role: "Backend Developer",
      email: "charlie@example.com",
      avatar: "/avatars/charlie.jpg",
      tasks: 15,
      projects: 4
    },
    {
      id: "user4",
      name: "Diana Miller",
      role: "UI/UX Designer",
      email: "diana@example.com",
      avatar: "/avatars/diana.jpg",
      tasks: 6,
      projects: 2
    }
  ];

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Team</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {teamMembers.map((member) => (
          <Card key={member.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription>{member.role}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{member.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tasks:</span>
                  <span>{member.tasks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Projects:</span>
                  <span>{member.projects}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 