import { NextRequest, NextResponse } from 'next/server';

// Forwarding API route to backend
export async function GET(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888/api';
  const res = await fetch(`${apiUrl}/tasks`, {
    headers: {
      'Content-Type': 'application/json',
      // Forward auth headers if present
      ...request.headers
    },
  });
  
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888/api';
  const body = await request.json();
  
  const res = await fetch(`${apiUrl}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Forward auth headers if present
      ...request.headers
    },
    body: JSON.stringify(body),
  });
  
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PATCH(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888/api';
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Missing task ID' }, { status: 400 });
  }
  
  const body = await request.json();
  
  const res = await fetch(`${apiUrl}/tasks/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      // Forward auth headers if present
      ...request.headers
    },
    body: JSON.stringify(body),
  });
  
  // Handle both empty and JSON responses
  let responseData = {};
  if (res.status !== 204) { // No content
    try {
      responseData = await res.json();
    } catch (e) {
      // If no JSON is returned, just use an empty object
      responseData = { success: true };
    }
  } else {
    responseData = { success: true };
  }
  
  return NextResponse.json(responseData, { status: res.status });
}

export async function DELETE(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888/api';
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Missing task ID' }, { status: 400 });
  }
  
  const res = await fetch(`${apiUrl}/tasks/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      // Forward auth headers if present
      ...request.headers
    },
  });
  
  // Handle both empty and JSON responses
  let responseData = {};
  if (res.status !== 204) { // No content
    try {
      responseData = await res.json();
    } catch (e) {
      // If no JSON is returned, just use an empty object
      responseData = { success: true };
    }
  } else {
    responseData = { success: true };
  }
  
  return NextResponse.json(responseData, { status: res.status });
} 