// Test berbagai kemungkinan URL endpoint untuk IBM watsonx Orchestrate
// Jalankan dengan: node test-endpoints.js

import https from 'https';

const baseUrl = "https://api.us-south.watson-orchestrate.cloud.ibm.com/instances/99a74687-1709-44f8-acd2-48b9fc95930c";
const agentName = "AskOrchestrate";
const token = "eyJraWQiOiIyMDE5MDcyNCIsImFsZyI6IlJTMjU2In0.eyJpYW1faWQiOiJJQk1pZC02OTQwMDE5UlU3IiwiaWQiOiJJQk1pZC02OTQwMDE5UlU3IiwicmVhbG1pZCI6IklCTWlkIiwianRpIjoiNTIxNmJhNGMtN2E4Yi00NGVmLThjM2UtYjFmNzIwODRhMjRhIiwiaWRlbnRpZmllciI6IjY5NDAwMTlSVTciLCJnaXZlbl9uYW1lIjoiWXR3ZWV0Mlh4eHh4IiwiZmFtaWx5X25hbWUiOiJGdWxiZXJ0dXMiLCJuYW1lIjoiWXR3ZWV0Mlh4eHh4IEZ1bGJlcnR1cyIsImVtYWlsIjoieW9uZnVsYmVydEBnbWFpbC5jb20iLCJzdWIiOiJ5b25mdWxiZXJ0QGdtYWlsLmNvbSIsImF1dGhuIjp7InN1YiI6InlvbmZ1bGJlcnRAZ21haWwuY29tIiwiaWFtX2lkIjoiSUJNaWQtNjk0MDAxOVJVNyIsIm5hbWUiOiJZdHdlZXQyWHh4eHggRnVsYmVydHVzIiwiZ2l2ZW5fbmFtZSI6Ill0d2VldDJYeHh4eCIsImZhbWlseV9uYW1lIjoiRnVsYmVydHVzIiwiZW1haWwiOiJ5b25mdWxiZXJ0QGdtYWlsLmNvbSJ9LCJhY2NvdW50Ijp7InZhbGlkIjp0cnVlLCJic3MiOiIxZmY4ZGEzZTcyNzI0MzllYThhMWQwNmIzZjA2NTllYSIsImltc191c2VyX2lkIjoiMTQ3NTk0NjYiLCJmcm96ZW4iOnRydWUsImltcyI6IjI5OTg3NjQifSwiaWF0IjoxNzYzODc3NjEzLCJleHAiOjE3NjM4ODEyMTMsImlzcyI6Imh0dHBzOi8vaWFtLmNsb3VkLmlibS5jb20vaWRlbnRpdHkiLCJncmFudF90eXBlIjoidXJuOmlibTpwYXJhbXM6b2F1dGg6Z3JhbnQtdHlwZTphcGlrZXkiLCJzY29wZSI6ImlibSBvcGVuaWQiLCJjbGllbnRfaWQiOiJkZWZhdWx0IiwiYWNyIjoxLCJhbXIiOlsicHdkIl19.chB9or5prGHotVlQbbYjfA5Y5g2_D37AB2yotrr3oqwsSoUeqmQ8j3pHr0wkvlVSOqDD1k-osRl3XhMicwmCItT6xOsNyxOonTgxAif3vrJYtUznxr-eSNG11_NUhNe_Sf7cgXFONZvxiTUWMPm47hDp7SzYA-fc_RZun_ZqhhApn93YCn-oJFIRxaNLwlMgibnnk1ckVW3bRkSvXD4yH93lklNEbAhF-b44Mpc7nOqOpDK4kLkiMwnP6gNZHk7e8Tf_zxx2UPnQd4sHVIeUNhtpC2F86y-NI-CpxcpHL6pINwEb1ssQ3eCJmXhOi7sxPLxxzJ8Jx-i_g-UrpiZJJg";

// Kemungkinan URL endpoints
const endpoints = [
    `${baseUrl}/orchestrate/api/v1/invoke/agents/${agentName}`,
    `${baseUrl}/v1/orchestrate/invoke/agents/${agentName}`,
    `${baseUrl}/api/v1/agents/${agentName}/invoke`,
    `${baseUrl}/v1/agents/${agentName}/invoke`,
    `${baseUrl}/agents/${agentName}/invoke`,
    `${baseUrl}/invoke/agents/${agentName}`,
    `${baseUrl}/orchestrate/agents/${agentName}`,
    `${baseUrl}/agents/${agentName}`,
];

async function testEndpoint(url) {
    return new Promise((resolve) => {
        console.log(`\n🔍 Testing: ${url}`);
        
        const postData = JSON.stringify({
            prompt: "Hello, can you help me?"
        });

        const options = {
            hostname: new URL(url).hostname,
            port: 443,
            path: new URL(url).pathname + new URL(url).search,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`📊 Status: ${res.statusCode}`);
                console.log(`📄 Response: ${data.substring(0, 200)}...`);
                
                if (res.statusCode === 200) {
                    console.log('✅ SUCCESS - This endpoint works!');
                    resolve({ success: true, url, response: data });
                } else {
                    resolve({ success: false, url, status: res.statusCode, response: data });
                }
            });
        });

        req.on('error', (error) => {
            console.log(`❌ Error: ${error.message}`);
            resolve({ success: false, url, error: error.message });
        });

        req.write(postData);
        req.end();
    });
}

async function testAllEndpoints() {
    console.log('🚀 Testing various Watson Orchestrate endpoints...\n');
    
    for (const endpoint of endpoints) {
        const result = await testEndpoint(endpoint);
        
        if (result.success) {
            console.log('\n🎉 FOUND WORKING ENDPOINT!');
            console.log(`✅ URL: ${result.url}`);
            console.log('\n💡 Update your code with this URL:');
            console.log(`const ORCHESTRATE_URL = "${result.url}";`);
            break;
        }
        
        if (endpoints.indexOf(endpoint) < endpoints.length - 1) {
            console.log('---');
        }
    }
    
    console.log('\n📋 Summary:');
    console.log('❌ No working endpoint found. Please check:');
    console.log('1. Agent name is correct');
    console.log('2. Instance ID is correct');
    console.log('3. Region is correct');
    console.log('4. Agent exists and is deployed');
}

testAllEndpoints().catch(console.error);
