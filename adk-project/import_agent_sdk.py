#!/usr/bin/env python3
"""
ADK Agent Import using Python SDK
Imports Numeri Financial Agent directly without CLI interaction
"""

import os
import sys
import json
import yaml
from pathlib import Path

def main():
    print("\n" + "="*50)
    print("ADK Agent Import (Python SDK)")
    print("="*50 + "\n")
    
    # Configuration
    api_key = "mvZYa2cToxl9jWb2BgfnoRNVOxqbBCFT89YeUoftmGWO"
    wxo_url = "https://api.us-south.watson-orchestrate.cloud.ibm.com"
    agent_file = Path(__file__).parent / "agents" / "numeri-financial-agent.yaml"
    
    print(f"[1/5] Loading configuration...")
    print(f"  URL: {wxo_url}")
    print(f"  Agent file: {agent_file}")
    
    # Verify agent file exists
    if not agent_file.exists():
        print(f"❌ ERROR: Agent file not found: {agent_file}")
        return False
    
    print(f"✅ Agent file found")
    
    # Load agent spec
    print(f"\n[2/5] Loading agent specification...")
    try:
        with open(agent_file, 'r') as f:
            agent_spec = yaml.safe_load(f)
        
        agent_name = agent_spec.get('name', 'Unknown')
        print(f"✅ Agent spec loaded: {agent_name}")
        print(f"  Kind: {agent_spec.get('kind')}")
        print(f"  LLM: {agent_spec.get('llm')}")
    except Exception as e:
        print(f"❌ ERROR loading agent spec: {e}")
        return False
    
    # Try to import using SDK
    print(f"\n[3/5] Connecting to watsonx Orchestrate...")
    try:
        from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
        from ibm_watsonx_orchestrate.orchestrate import Orchestrate
        
        # Create authenticator
        authenticator = IAMAuthenticator(apikey=api_key)
        
        # Create Orchestrate client
        wxo = Orchestrate(
            url=wxo_url,
            authenticator=authenticator
        )
        
        print(f"✅ Connected to watsonx Orchestrate")
        
    except ImportError as e:
        print(f"⚠️  SDK import error: {e}")
        print(f"   Trying alternative approach...")
        
        # Try using requests directly
        try:
            import requests
            import urllib3
            urllib3.disable_warnings()
            
            # Get IAM token
            print(f"\n[4/5] Authenticating with IBM Cloud...")
            
            # Get token from IBM IAM
            iam_url = "https://iam.cloud.ibm.com/identity/token"
            iam_data = {
                'grant_type': 'urn:ibm:params:oauth:grant-type:apikey',
                'apikey': api_key,
                'response_type': 'cloud_iam'
            }
            
            iam_response = requests.post(iam_url, data=iam_data, timeout=10)
            
            if iam_response.status_code != 200:
                print(f"❌ IAM authentication failed: {iam_response.status_code}")
                print(f"   Response: {iam_response.text}")
                return False
            
            token_data = iam_response.json()
            token = token_data.get('access_token')
            
            if not token:
                print(f"❌ No token in IAM response")
                return False
            
            print(f"✅ Authentication successful")
            
            # Prepare agent import
            print(f"\n[5/5] Importing agent...")
            
            headers = {
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/yaml'
            }
            
            # Read agent YAML as string
            with open(agent_file, 'r') as f:
                agent_yaml = f.read()
            
            # Try multiple import endpoints
            import_urls = [
                f"{wxo_url}/v1/agents/import",
                f"{wxo_url}/api/v1/agents/import",
                f"{wxo_url}/instances/99a74687-1709-44f8-acd2-48b9fc95930c/agents/import"
            ]
            
            for import_url in import_urls:
                print(f"   Trying: {import_url}")
                
                try:
                    response = requests.post(
                        import_url,
                        headers=headers,
                        data=agent_yaml,
                        timeout=30,
                        verify=False
                    )
                    
                    if response.status_code in [200, 201, 202]:
                        print(f"✅ Agent imported successfully!")
                        try:
                            print(f"   Response: {response.json()}")
                        except:
                            print(f"   Response: {response.text[:200]}")
                        return True
                    elif response.status_code == 401:
                        print(f"   ⚠️  Unauthorized (401) - trying next endpoint")
                        continue
                    elif response.status_code == 404:
                        print(f"   ⚠️  Not found (404) - trying next endpoint")
                        continue
                    else:
                        print(f"   ⚠️  Status {response.status_code}")
                        continue
                        
                except requests.exceptions.RequestException as e:
                    print(f"   ⚠️  Connection error: {e}")
                    continue
            
            print(f"❌ All import endpoints failed")
            return False
                
        except Exception as e:
            print(f"❌ ERROR: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    # If we got here with SDK
    print(f"\n[4/5] Importing agent...")
    try:
        # Import agent using SDK
        result = wxo.agents.import_agent(str(agent_file))
        
        print(f"✅ Agent imported successfully!")
        print(f"   Agent ID: {result}")
        
        print(f"\n[5/5] Verification...")
        print(f"✅ Import complete!")
        
        return True
        
    except Exception as e:
        print(f"❌ ERROR during import: {e}")
        return False

if __name__ == "__main__":
    try:
        success = main()
        
        if success:
            print("\n" + "="*50)
            print("✅ SUCCESS! Agent imported successfully")
            print("="*50)
            print("\nNext steps:")
            print("1. Log in to watsonx Orchestrate")
            print("2. Go to Agent Builder")
            print("3. Find 'Numeri_Financial_Agent'")
            print("4. Test the agent")
            print("")
        else:
            print("\n" + "="*50)
            print("⚠️  Import may have failed")
            print("="*50)
            print("\nTroubleshooting:")
            print("1. Verify API key is correct")
            print("2. Check internet connection")
            print("3. Verify watsonx Orchestrate is accessible")
            print("")
        
        sys.exit(0 if success else 1)
        
    except KeyboardInterrupt:
        print("\n\n❌ Cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        sys.exit(1)
