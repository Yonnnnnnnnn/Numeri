#!/usr/bin/env python3
"""
ADK Agent Import Script
Imports Numeri Financial Agent to watsonx Orchestrate without interactive prompts
"""

import os
import sys
import yaml
from pathlib import Path

# Add ADK to path
sys.path.insert(0, str(Path(__file__).parent.parent))

def import_agent():
    """Import the Numeri Financial Agent"""
    
    # Get API key from environment
    api_key = os.getenv('IBM_API_KEY')
    if not api_key:
        print("❌ ERROR: IBM_API_KEY environment variable not set")
        print("Set it with: $env:IBM_API_KEY='your-api-key'")
        return False
    
    print("✅ API Key found in environment")
    
    # Load agent YAML
    agent_file = Path(__file__).parent / "agents" / "numeri-financial-agent.yaml"
    
    if not agent_file.exists():
        print(f"❌ ERROR: Agent file not found: {agent_file}")
        return False
    
    print(f"✅ Agent file found: {agent_file}")
    
    # Read agent spec
    with open(agent_file, 'r') as f:
        agent_spec = yaml.safe_load(f)
    
    print(f"✅ Agent spec loaded: {agent_spec.get('name')}")
    
    # Try to use ADK to import
    try:
        from ibm_watsonx_orchestrate.orchestrate import Orchestrate
        
        # Initialize Orchestrate client
        wxo = Orchestrate(
            wxo_url="https://api.us-south.watson-orchestrate.cloud.ibm.com",
            api_key=api_key
        )
        
        print("✅ Connected to watsonx Orchestrate")
        
        # Import agent
        print(f"📤 Importing agent: {agent_spec.get('name')}...")
        result = wxo.agents.import_agent(agent_file)
        
        print(f"✅ Agent imported successfully!")
        print(f"Agent ID: {result}")
        
        return True
        
    except Exception as e:
        print(f"❌ Import failed: {str(e)}")
        print("\nTroubleshooting:")
        print("1. Verify API key is correct")
        print("2. Check internet connection")
        print("3. Verify watsonx Orchestrate URL is accessible")
        return False

if __name__ == "__main__":
    success = import_agent()
    sys.exit(0 if success else 1)
