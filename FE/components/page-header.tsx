"use client"

import React from "react"

interface PageHeaderProps {
  heading: string
  subheading?: string
}

export function PageHeader({ heading, subheading }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-1 py-6 px-8 border-b">
      <h1 className="text-2xl font-semibold tracking-tight">{heading}</h1>
      {subheading && (
        <p className="text-sm text-muted-foreground">{subheading}</p>
      )}
    </div>
  )
} 