// Script untuk test berbagai format API Key
// Jalankan dengan: node test-api-key.js

import https from 'https';
import querystring from 'querystring';

// Test berbagai format API Key
const apiKeys = [
    'ApiKey-214b4189-c534-406f-8f26-98b775b753bc',  // Dengan prefix
    '214b4189-c534-406f-8f26-98b775b753bc',          // Tanpa prefix
    // Tambahkan format lain jika perlu
];

async function testApiKey(apiKey, format) {
    return new Promise((resolve) => {
        console.log(`\n🔍 Testing format: ${format}`);
        console.log(`🔑 API Key: ${apiKey.substring(0, Math.min(12, apiKey.length))}...`);
        
        const postData = querystring.stringify({
            grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
            apikey: apiKey
        });

        const options = {
            hostname: 'iam.cloud.ibm.com',
            port: 443,
            path: '/identity/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.access_token) {
                        console.log('✅ SUCCESS - Token generated!');
                        console.log(`🎫 Token: ${result.access_token.substring(0, 50)}...`);
                        console.log(`⏰ Expires in: ${result.expires_in} seconds`);
                        resolve({ success: true, token: result.access_token, format });
                    } else {
                        console.log('❌ FAILED - No token in response');
                        console.log(`📄 Error: ${result.errorMessage || 'Unknown error'}`);
                        resolve({ success: false, error: result.errorMessage, format });
                    }
                } catch (error) {
                    console.log('❌ FAILED - Parse error');
                    console.log(`📄 Raw response: ${data}`);
                    resolve({ success: false, error: 'Parse error', format });
                }
            });
        });

        req.on('error', (error) => {
            console.log('❌ FAILED - Request error');
            console.log(`📄 Error: ${error.message}`);
            resolve({ success: false, error: error.message, format });
        });

        req.write(postData);
        req.end();
    });
}

async function testAllFormats() {
    console.log('🚀 Testing various API Key formats...\n');
    
    for (const apiKey of apiKeys) {
        const format = apiKey.includes('ApiKey-') ? 'With ApiKey- prefix' : 'Without prefix';
        const result = await testApiKey(apiKey, format);
        
        if (result.success) {
            console.log('\n🎉 FOUND WORKING FORMAT!');
            console.log(`✅ Format: ${result.format}`);
            console.log(`🎫 Token: ${result.token}`);
            console.log('\n💡 Update your .env file with this format:');
            console.log(`ORCHESTRATE_API_KEY="${apiKey}"`);
            break;
        }
        
        if (apiKeys.indexOf(apiKey) < apiKeys.length - 1) {
            console.log('---');
        }
    }
    
    console.log('\n📋 Summary:');
    console.log('❌ None of the formats worked. Please check:');
    console.log('1. API Key is correct and not expired');
    console.log('2. API Key has proper permissions');
    console.log('3. Region is correct (us-south)');
    console.log('4. Service ID is correct');
}

testAllFormats().catch(console.error);
