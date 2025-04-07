'use client';

import { Building2, ShieldCheck, Users, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminDashboard() {
  const adminSections = [
    {
      title: 'Departments',
      description: 'Manage organization departments and their details',
      icon: Building2,
      href: '/admin/departments',
      color: 'bg-blue-100 text-blue-700',
    },
    {
      title: 'Roles',
      description: 'Manage user roles and permissions across the system',
      icon: ShieldCheck,
      href: '/admin/roles',
      color: 'bg-green-100 text-green-700',
    },
    {
      title: 'Team Members',
      description: 'View and manage team members and their assignments',
      icon: Users,
      href: '/team',
      color: 'bg-purple-100 text-purple-700',
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your organization's settings, departments, and roles
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {adminSections.map((section) => (
          <Card key={section.title} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${section.color}`}>
                <section.icon className="h-6 w-6" />
              </div>
              <CardTitle>{section.title}</CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardFooter className="pt-3">
              <Button asChild variant="ghost" className="gap-1 p-0 h-auto font-normal">
                <Link href={section.href}>
                  Manage {section.title.toLowerCase()} <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 