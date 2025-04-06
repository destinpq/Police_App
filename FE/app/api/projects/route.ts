import { NextResponse } from 'next/server';

// Sample project data for testing
const projects = [
  {
    id: "project1",
    name: "Website Redesign",
    description: "Modernize our company website with new branding",
    status: "In Progress",
    dueDate: "2023-10-15",
    owner: "Alice Johnson",
    members: ["Bob Smith", "Diana Miller", "Charlie Davis"],
    tags: ["web", "design"]
  },
  {
    id: "project2",
    name: "Mobile App Development",
    description: "Develop iOS and Android apps for our platform",
    status: "Planning",
    dueDate: "2023-11-30",
    owner: "Alice Johnson",
    members: ["Bob Smith", "Charlie Davis"],
    tags: "mobile,development"
  },
  {
    id: "project3",
    name: "Data Migration",
    description: "Migrate data from legacy systems to new platform",
    status: "Not Started",
    dueDate: "2023-12-10",
    owner: "Charlie Davis",
    members: ["Alice Johnson"],
    tags: ["data", "backend"]
  }
];

export async function GET() {
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  try {
    const newProject = await request.json();
    // In a real app, you would validate and save to a database
    const project = {
      id: `project${projects.length + 1}`,
      ...newProject,
      createdAt: new Date().toISOString()
    };
    
    // For testing, we'll just return the project as if it was added
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 400 }
    );
  }
} 