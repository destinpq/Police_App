"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"

interface Message {
  id: string
  sender: string
  content: string
  timestamp: Date
}

const initialMessages: Message[] = [
  {
    id: "1",
    sender: "Alice",
    content: "Hey team, how's the progress on the new feature?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: "2",
    sender: "Bob",
    content: "Almost done with the backend implementation. Should be ready for testing by tomorrow.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5), // 1.5 hours ago
  },
  {
    id: "3",
    sender: "Charlie",
    content: "I've completed the design for the dashboard. I'll share the mockups in a moment.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
  },
  {
    id: "4",
    sender: "Diana",
    content: "Great work everyone! Let's sync up tomorrow morning to discuss the integration.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
  },
]

export function TeamChat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      sender: "You",
      content: newMessage,
      timestamp: new Date(),
    }

    setMessages([...messages, message])
    setNewMessage("")
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex flex-col ${message.sender === "You" ? "items-end" : "items-start"}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{message.sender}</span>
              <span className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>
            </div>
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.sender === "You" ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

