const fetch = require('node-fetch');

async function testCreateUser() {
  try {
    console.log('Testing user creation API endpoint...');
    
    // Create user data with only the properties expected by the API
    const userData = {
      name: 'Test User',
      email: 'testuser' + Date.now() + '@example.com',
      password: 'Password123!',
      roleId: null,
      departmentId: null,
      bio: 'Test user bio',
      phone: '555-1234',
      skills: 'Testing',
      avatar: null
    };
    
    console.log('Sending user data:', userData);
    
    // Ensure we don't have role or department properties
    if ('role' in userData) delete userData.role;
    if ('department' in userData) delete userData.department;
    
    const response = await fetch('http://localhost:3001/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const responseHeaders = {};
    response.headers.forEach((value, name) => {
      responseHeaders[name] = value;
    });
    console.log('Response Headers:', responseHeaders);
    
    const data = await response.json().catch(e => {
      console.error('Error parsing JSON response:', e);
      return null;
    });
    
    console.log('Response data:', data);
    
    if (response.ok && data && data.id) {
      console.log('Success! Created user with ID:', data.id);
      console.log('This confirms the API works when role and department properties are not present.');
    }
    
    return data;
  } catch (error) {
    console.error('Test failed:', error);
  }
}

async function testProjectTeamMember() {
  try {
    console.log('Testing add team member to project API endpoint...');
    
    // These IDs need to be replaced with valid IDs from your database
    const projectId = 'project-id-here'; 
    const userId = 'user-id-here';
    
    console.log(`Adding user ${userId} to project ${projectId}`);
    
    const response = await fetch(`http://localhost:3001/api/projects/${projectId}/team/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const data = await response.json().catch(e => {
      console.error('Error parsing JSON response:', e);
      return null;
    });
    
    console.log('Response data:', data);
    return data;
  } catch (error) {
    console.error('Test failed:', error);
  }
}

async function testWithEndpoint() {
  try {
    console.log('Testing custom test endpoint...');
    
    const testData = {
      name: 'Test User',
      email: 'testuser@example.com',
      roleId: 'some-role-id',
      departmentId: 'some-department-id',
      extraField: 'Should be allowed and visible'
    };
    
    console.log('Sending test data:', testData);
    
    const response = await fetch('http://localhost:3001/api/test-endpoint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    console.log('Status:', response.status);
    
    const data = await response.json();
    console.log('Response data:', data);
    return data;
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the tests
async function runTests() {
  console.log('=== API Test Script ===');
  await testCreateUser();
}

runTests(); 