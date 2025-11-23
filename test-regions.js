// Test dengan region berbeda dan format yang berbeda
// Jalankan dengan: node test-regions.js

import https from 'https';

const token = "eyJraWQiOiIyMDE5MDcyNCIsImFsZyI6IlJTMjU2In0.eyJpYW1faWQiOiJJQk1pZC02OTQwMDE5UlU3IiwiaWQiOiJJQk1pZC02OTQwMDE5UlU3IiwicmVhbG1pZCI6IklCTWlkIiwianRpIjoiNTIxNmJhNGMtN2E4Yi00NGVmLThjM2UtYjFmNzIwODRhMjRhIiwiaWRlbnRpZmllciI6IjY5NDAwMTlSVTciLCJnaXZlbl9uYW1lIjoiWXR3ZWV0Mlh4eHh4IiwiZmFtaWx5X25hbWUiOiJGdWxiZXJ0dXMiLCJuYW1lIjoiWXR3ZWV0Mlh4eHh4IEZ1bGJlcnR1cyIsImVtYWlsIjoieW9uZnVsYmVydEBnbWFpbC5jb20iLCJzdWIiOiJ5b25mdWxiZXJ0QGdtYWlsLmNvbSIsImF1dGhuIjp7InN1YiI6InlvbmZ1bGJlcnRAZ21haWwuY29tIiwiaWFtX2lkIjoiSUJNaWQtNjk0MDAxOVJVNyIsIm5hbWUiOiJZdHdlZXQyWHh4eHggRnVsYmVydHVzIiwiZ2l2ZW5fbmFtZSI6Ill0d2VldDJYeHh4eCIsImZhbWlseV9uYW1lIjoiRnVsYmVydHVzIiwiZW1haWwiOiJ5b25mdWxiZXJ0QGdtYWlsLmNvbSJ9LCJhY2NvdW50Ijp7InZhbGlkIjp0cnVlLCJic3MiOiIxZmY4ZGEzZTcyNzI0MzllYThhMWQwNmIzZjA2NTllYSIsImltc191c2VyX2lkIjoiMTQ3NTk0NjYiLCJmcm96ZW4iOnRydWUsImltcyI6IjI5OTg3NjQifSwiaWF0IjoxNzYzODc3NjEzLCJleHAiOjE3NjM4ODEyMTMsImlzcyI6Imh0dHBzOi8vaWFtLmNsb3VkLmlibS5jb20vaWRlbnRpdHkiLCJncmFudF90eXBlIjoidXJuOmlibTpwYXJhbXM6b2F1dGg6Z3JhbnQtdHlwZTphcGlrZXkiLCJzY29wZSI6ImlibSBvcGVuaWQiLCJjbGllbnRfaWQiOiJkZWZhdWx0IiwiYWNyIjoxLCJhbXIiOlsicHdkIl19.chB9or5prGHotVlQbbYjfA5Y5g2_D37AB2yotrr3oqwsSoUeqmQ8j3pHr0wkvlVSOqDD1k-osRl3XhMicwmCItT6xOsNyxOonTgxAif3vrJYtUznxr-eSNG11_NUhNe_Sf7cgXFONZvxiTUWMPm47hDp7SzYA-fc_RZun_ZqhhApn93YCn-oJFIRxaNLwlMgibnnk1ckVW3bRkSvXD4yH93lklNEbAhF-b44Mpc7nOqOpDK4kLkiMwnP6gNZHk7e8Tf_zxx2UPnQd4sHVIeUNhtpC2F86y-NI-CpxcpHL6pINwEb1ssQ3eCJmXhOi7sxPLxxzJ8Jx-i_g-UrpiZJJg";

// Test dengan region berbeda
const regions = [
    "us-south",
    "us-east",
    "eu-de",
    "eu-gb",
    "jp-tok"
];

// Test dengan service name yang berbeda
const serviceNames = [
    "watson-orchestrate",
    "watsonx-orchestrate",
    "orchestrate"
];

// Test dengan instance ID yang berbeda
const instanceIds = [
    "99a74687-1709-44f8-acd2-48b9fc95930c",  // Original
    "99a74687-1709-44f8-acd2-48b9fc95930c",  // Same
];

async function testEndpoint(url, method = 'GET', body = null) {
    return new Promise((resolve) => {
        console.log(`\n🔍 Testing: ${method} ${url}`);
        
        let postData = body ? JSON.stringify(body) : '';
        if (method === 'POST' && !body) {
            postData = JSON.stringify({ 
                input: { message: "Hello, can you help me?" }
            });
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

async function testRegions() {
    console.log('🚀 Testing different regions and service names...\n');
    
    for (const region of regions) {
        for (const serviceName of serviceNames) {
            const baseUrl = `https://api.${region}.${serviceName}.cloud.ibm.com`;
            
            // Test base URL
            const result1 = await testEndpoint(`${baseUrl}/`);
            
            if (result1.success) {
                console.log(`\n🎉 FOUND WORKING BASE URL!`);
                console.log(`✅ Region: ${region}`);
                console.log(`✅ Service: ${serviceName}`);
                console.log(`✅ URL: ${baseUrl}`);
                
                // Test agents endpoint
                const result2 = await testEndpoint(`${baseUrl}/agents`);
                if (result2.success) {
                    console.log(`🎉 FOUND AGENTS ENDPOINT!`);
                    console.log(`✅ Agents URL: ${baseUrl}/agents`);
                    return;
                }
            }
        }
    }
    
    console.log('\n🔄 Testing original instance with different paths...');
    
    // Test original instance dengan path yang berbeda
    const originalInstance = "99a74687-1709-44f8-acd2-48b9fc95930c";
    const paths = [
        `/instances/${originalInstance}/agents`,
        `/instances/${originalInstance}/v1/agents`,
        `/instances/${originalInstance}/api/v1/agents`,
        `/instances/${originalInstance}/orchestrate/agents`,
        `/instances/${originalInstance}/agents/AskOrchestrate`,
        `/instances/${originalInstance}/agents/AskOrchestrate/invoke`,
        `/instances/${originalInstance}/v1/agents/AskOrchestrate/invoke`,
        `/instances/${originalInstance}/orchestrate/agents/AskOrchestrate/invoke`,
    ];
    
    for (const path of paths) {
        const url = `https://api.us-south.watson-orchestrate.cloud.ibm.com${path}`;
        const result = await testEndpoint(url, 'POST');
        
        if (result.success) {
            console.log(`\n🎉 FOUND WORKING INSTANCE ENDPOINT!`);
            console.log(`✅ URL: ${url}`);
            return;
        }
    }
    
    console.log('\n📋 Summary:');
    console.log('❌ No working endpoint found.');
    console.log('\n🔧 Possible Issues:');
    console.log('1. Service name is different');
    console.log('2. Region is different');
    console.log('3. Instance ID is incorrect');
    console.log('4. Agent name is incorrect');
    console.log('5. Agent is not deployed');
    console.log('6. API version is different');
}

testRegions().catch(console.error);
