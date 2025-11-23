// Script untuk manual generate IAM Access Token
// Jalankan dengan: node get-token.js

import https from 'https';
import querystring from 'querystring';

// Ganti dengan API Key Anda
const ORCHESTRATE_API_KEY = process.env.ORCHESTRATE_API_KEY || 'mvZYa2cToxl9jWb2BgfnoRNVOxqbBCFT89YeUoftmGWO';

if (!ORCHESTRATE_API_KEY || ORCHESTRATE_API_KEY === 'YOUR_IBM_API_KEY') {
    console.log('❌ Please set your ORCHESTRATE_API_KEY environment variable');
    console.log('❌ Atau edit file ini dan masukkan API Key Anda');
    console.log('💡 Format API Key seharusnya: ApiKey-214b4189-c534-406f-8f26-98b775b753bc');
    process.exit(1);
}

console.log('🔑 Using API Key:', ORCHESTRATE_API_KEY.substring(0, 12) + '...');

const postData = querystring.stringify({
    grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
    apikey: ORCHESTRATE_API_KEY
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
            console.log('✅ SUCCESS - IAM Access Token Generated:');
            console.log('=====================================');
            console.log('Access Token:', result.access_token);
            console.log('Token Type:', result.token_type);
            console.log('Expires In:', result.expires_in, 'seconds');
            console.log('Expires At:', new Date(Date.now() + (result.expires_in * 1000)).toISOString());
            console.log('=====================================');
            console.log('\n📝 Copy token ini untuk testing:');
            console.log(result.access_token);
        } catch (error) {
            console.error('❌ Error parsing response:', error.message);
            console.log('Raw response:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Request error:', error.message);
});

req.write(postData);
req.end();
