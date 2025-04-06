import { NextResponse } from 'next/server';

// Sample task data for testing
const tasks = [
  {
    id: "task1",
    title: "Landing Page Design",
    description: "Design a modern landing page for the new product",
    status: "In Progress",
    priority: "High",
    assignee: "Diana Miller",
    dueDate: "2023-09-15",
    tags: ["design", "frontend"],
    projectId: "project1"
  },
  {
    id: "task2",
    title: "API Integration",
    description: "Integrate payment gateway API",
    status: "To Do",
    priority: "Medium",
    assignee: "Charlie Davis",
    dueDate: "2023-09-20",
    tags: "backend,api",
    projectId: "project1"
  },
  {
    id: "task3",
    title: "User Authentication",
    description: "Implement OAuth for user authentication",
    status: "To Do",
    priority: "High",
    assignee: "Bob Smith",
    dueDate: "2023-09-18",
    tags: ["security", "backend"],
    projectId: "project2"
  },
  {
    id: "task4",
    title: "Bug Fixes",
    description: "Fix reported bugs in the checkout process",
    status: "In Progress",
    priority: "High",
    assignee: "Bob Smith",
    dueDate: "2023-09-12",
    tags: "bugfix,frontend",
    projectId: "project2"
  },
  {
    id: "task5",
    title: "Performance Optimization",
    description: "Optimize database queries for better performance",
    status: "Done",
    priority: "Medium",
    assignee: "Charlie Davis",
    dueDate: "2023-09-10",
    tags: ["optimization", "backend"],
    projectId: "project1"
  }
];

export async function GET() {
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  try {
    const newTask = await request.json();
    // In a real app, you would validate and save to a database
    const task = {
      id: `task${tasks.length + 1}`,
      ...newTask,
      createdAt: new Date().toISOString()
    };
    
    // For testing, we'll just return the task as if it was added
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 400 }
    );
  }
} 