// Test base URL dan list agents yang tersedia
// Jalankan dengan: node list-agents.js

import https from 'https';

const baseUrl = "https://api.us-south.watson-orchestrate.cloud.ibm.com/instances/99a74687-1709-44f8-acd2-48b9fc95930c";
const token = "eyJraWQiOiIyMDE5MDcyNCIsImFsZyI6IlJTMjU2In0.eyJpYW1faWQiOiJJQk1pZC02OTQwMDE5UlU3IiwiaWQiOiJJQk1pZC02OTQwMDE5UlU3IiwicmVhbG1pZCI6IklCTWlkIiwianRpIjoiNTIxNmJhNGMtN2E4Yi00NGVmLThjM2UtYjFmNzIwODRhMjRhIiwiaWRlbnRpZmllciI6IjY5NDAwMTlSVTciLCJnaXZlbl9uYW1lIjoiWXR3ZWV0Mlh4eHh4IiwiZmFtaWx5X25hbWUiOiJGdWxiZXJ0dXMiLCJuYW1lIjoiWXR3ZWV0Mlh4eHh4IEZ1bGJlcnR1cyIsImVtYWlsIjoieW9uZnVsYmVydEBnbWFpbC5jb20iLCJzdWIiOiJ5b25mdWxiZXJ0QGdtYWlsLmNvbSIsImF1dGhuIjp7InN1YiI6InlvbmZ1bGJlcnRAZ21haWwuY29tIiwiaWFtX2lkIjoiSUJNaWQtNjk0MDAxOVJVNyIsIm5hbWUiOiJZdHdlZXQyWHh4eHggRnVsYmVydHVzIiwiZ2l2ZW5fbmFtZSI6Ill0d2VldDJYeHh4eCIsImZhbWlseV9uYW1lIjoiRnVsYmVydHVzIiwiZW1haWwiOiJ5b25mdWxiZXJ0QGdtYWlsLmNvbSJ9LCJhY2NvdW50Ijp7InZhbGlkIjp0cnVlLCJic3MiOiIxZmY4ZGEzZTcyNzI0MzllYThhMWQwNmIzZjA2NTllYSIsImltc191c2VyX2lkIjoiMTQ3NTk0NjYiLCJmcm96ZW4iOnRydWUsImltcyI6IjI5OTg3NjQifSwiaWF0IjoxNzYzODc3NjEzLCJleHAiOjE3NjM4ODEyMTMsImlzcyI6Imh0dHBzOi8vaWFtLmNsb3VkLmlibS5jb20vaWRlbnRpdHkiLCJncmFudF90eXBlIjoidXJuOmlibTpwYXJhbXM6b2F1dGg6Z3JhbnQtdHlwZTphcGlrZXkiLCJzY29wZSI6ImlibSBvcGVuaWQiLCJjbGllbnRfaWQiOiJkZWZhdWx0IiwiYWNyIjoxLCJhbXIiOlsicHdkIl19.chB9or5prGHotVlQbbYjfA5Y5g2_D37AB2yotrr3oqwsSoUeqmQ8j3pHr0wkvlVSOqDD1k-osRl3XhMicwmCItT6xOsNyxOonTgxAif3vrJYtUznxr-eSNG11_NUhNe_Sf7cgXFONZvxiTUWMPm47hDp7SzYA-fc_RZun_ZqhhApn93YCn-oJFIRxaNLwlMgibnnk1ckVW3bRkSvXD4yH93lklNEbAhF-b44Mpc7nOqOpDK4kLkiMwnP6gNZHk7e8Tf_zxx2UPnQd4sHVIeUNhtpC2F86y-NI-CpxcpHL6pINwEb1ssQ3eCJmXhOi7sxPLxxzJ8Jx-i_g-UrpiZJJg";

// Test endpoints untuk list agents dan info
const testEndpoints = [
    `${baseUrl}/agents`,
    `${baseUrl}/v1/agents`,
    `${baseUrl}/api/v1/agents`,
    `${baseUrl}/orchestrate/agents`,
    `${baseUrl}/`,
    `${baseUrl}/info`,
    `${baseUrl}/health`,
    `${baseUrl}/status`
];

async function testEndpoint(url, method = 'GET') {
    return new Promise((resolve) => {
        console.log(`\n🔍 Testing: ${method} ${url}`);
        
        let postData = '';
        if (method === 'POST') {
            postData = JSON.stringify({ prompt: "test" });
        }

        const options = {
            hostname: new URL(url).hostname,
            port: 443,
            path: new URL(url).pathname + new URL(url).search,
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        };

        if (postData) {
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }

        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`📊 Status: ${res.statusCode}`);
                console.log(`📄 Response: ${data.substring(0, 300)}...`);
                
                if (res.statusCode < 400) {
                    console.log('✅ SUCCESS - This endpoint works!');
                    resolve({ success: true, url, method, status: res.statusCode, response: data });
                } else {
                    resolve({ success: false, url, method, status: res.statusCode, response: data });
                }
            });
        });

        req.on('error', (error) => {
            console.log(`❌ Error: ${error.message}`);
            resolve({ success: false, url, method, error: error.message });
        });

        if (postData) {
            req.write(postData);
        }
        req.end();
    });
}

async function testAllEndpoints() {
    console.log('🚀 Testing Watson Orchestrate base endpoints...\n');
    
    for (const endpoint of testEndpoints) {
        const result = await testEndpoint(endpoint);
        
        if (result.success) {
            console.log('\n🎉 FOUND WORKING ENDPOINT!');
            console.log(`✅ URL: ${result.url}`);
            console.log(`📊 Method: ${result.method}`);
            console.log(`📊 Status: ${result.status}`);
            break;
        }
        
        if (testEndpoints.indexOf(endpoint) < testEndpoints.length - 1) {
            console.log('---');
        }
    }
    
    console.log('\n📋 Next Steps:');
    console.log('1. If found working endpoint, check response for available agents');
    console.log('2. Look for agent "AskOrchestrate" in the response');
    console.log('3. Use the correct agent ID from the response');
    console.log('4. Update your code with the correct endpoint');
}

testAllEndpoints().catch(console.error);
