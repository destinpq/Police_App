import { NextRequest, NextResponse } from 'next/server';

// Helper function to get the API URL
const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888/api';
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const apiUrl = `${getApiUrl()}/departments/${id}`;
    
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
      throw new Error(`Error fetching department: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Department API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch department' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const apiUrl = `${getApiUrl()}/departments/${id}`;
    
    // Forward the request to the backend
    const response = await fetch(apiUrl, {
      method: 'PATCH',
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
      throw new Error(`Error updating department: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Department API error:', error);
    return NextResponse.json(
      { error: 'Failed to update department' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const apiUrl = `${getApiUrl()}/departments/${id}`;
    
    // Forward the request to the backend
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // Forward auth headers if present
        ...(request.headers.get('authorization') 
          ? { 'Authorization': request.headers.get('authorization') as string } 
          : {})
      },
    });

    if (!response.ok) {
      throw new Error(`Error deleting department: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Department API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete department' },
      { status: 500 }
    );
  }
} 