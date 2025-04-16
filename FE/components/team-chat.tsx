"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"
import api from "@/lib/api"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Message {
  id: string
  sender: string
  senderName: string | { id: string; name: string }
  senderAvatar?: string
  content: string | object
  timestamp: Date
}

interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
  role?: string
}

// API response interfaces
interface UserApiResponse {
  id: string
  name: string
  email: string
  avatar?: string | null
  role?: { id: string; name: string; description?: string } | null
  department?: { id: string; name: string; description?: string } | null
  // Add other possible fields here
  updatedAt: string
}

export function TeamChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch team members when component mounts
  useEffect(() => {
    fetchTeamMembers()
  }, [])

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true)
      const members = await api.teamMembers.getAll() as UserApiResponse[];
      // Convert UserApiResponse to TeamMember
      const teamMembers: TeamMember[] = members.map(member => ({
        id: member.id,
        name: member.name,
        email: member.email,
        avatar: member.avatar || undefined,
        role: member.role?.name || undefined
      }));
      setTeamMembers(teamMembers);
      
      // Set current user (would normally come from auth context)
      if (members.length > 0) {
        const currentUser: TeamMember = {
          id: members[0].id,
          name: members[0].name,
          email: members[0].email,
          avatar: members[0].avatar || undefined,
          role: members[0].role?.name || undefined
        };
        setCurrentUser(currentUser);
      }
    } catch (error) {
      console.error("Failed to fetch team members:", error)
      toast.error("Failed to load team members")
    } finally {
      setIsLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !currentUser) return

    const message: Message = {
      id: Math.random().toString(36).substring(2, 9),
      sender: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      content: newMessage,
      timestamp: new Date(),
    }

    setMessages([...messages, message])
    setNewMessage("")
  }

  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // Get avatar initials from name
  const getInitials = (name: string | { id: string; name: string }) => {
    if (typeof name === 'object' && name !== null) {
      return name.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  // Check if message is from current user
  const isFromCurrentUser = (sender: string) => {
    return currentUser && currentUser.id === sender
  }

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <p>No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex flex-col ${isFromCurrentUser(message.sender) ? "items-end" : "items-start"}`}>
              <div className="flex items-center gap-2 mb-1">
                {!isFromCurrentUser(message.sender) && (
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={message.senderAvatar} />
                    <AvatarFallback>{getInitials(message.senderName)}</AvatarFallback>
                  </Avatar>
                )}
                <div className="flex flex-col">
                  <div className="font-medium">
                    {typeof message.senderName === 'string' 
                      ? message.senderName 
                      : message.senderName?.name || 'Unknown'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {typeof message.content === 'string' 
                      ? message.content 
                      : (message.content ? JSON.stringify(message.content) : '')}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{formatTime(new Date(message.timestamp))}</span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            disabled={!currentUser}
          />
          <Button type="submit" size="icon" disabled={!currentUser}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

