// Using built-in fetch (Node.js 18+)

async function testAPI() {
  try {
    console.log('Testing API endpoint...');
    
    // Test 1: GET invoice string
    console.log('\n1. Testing GET /api/settings/invoice-string');
    const getResponse = await fetch('http://localhost:5000/api/settings/invoice-string');
    const getData = await getResponse.json();
    console.log('GET Response:', getData);
    
    // Test 2: PUT invoice string
    console.log('\n2. Testing PUT /api/settings/invoice-string');
    const putResponse = await fetch('http://localhost:5000/api/settings/invoice-string', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // This will fail auth but we can see the error
      },
      body: JSON.stringify({
        invoiceString: 'NewTestInvoiceString456'
      })
    });
    
    const putData = await putResponse.json();
    console.log('PUT Response Status:', putResponse.status);
    console.log('PUT Response:', putData);
    
    console.log('\n✅ API test completed!');
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

testAPI(); 