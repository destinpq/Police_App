import { NextRequest, NextResponse } from 'next/server';

// Helper function to get the API URL
const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888/api';
};

export async function GET(request: NextRequest) {
  try {
    const apiUrl = `${getApiUrl()}/roles`;
    
    // Forward the request to the backend
    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
        // Forward auth headers if present
        ...(request.headers.get('authorization') 
          ? { 'Authorization': request.headers.get('authorization') as string } 
          : {})
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching roles: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Roles API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const apiUrl = `${getApiUrl()}/roles`;
    
    // Forward the request to the backend
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward auth headers if present
        ...(request.headers.get('authorization') 
          ? { 'Authorization': request.headers.get('authorization') as string } 
          : {})
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Error creating role: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Roles API error:', error);
    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    );
  }
} 