import requests
import json

base_url = "https://mlbb-stats.ridwaanhall.com/api/hero-rank"

# Test different possible period parameters
test_params = [
    {"page": 1, "size": 5},  # Base query
    {"page": 1, "size": 5, "period": "1d"},
    {"page": 1, "size": 5, "period": "7d"},
    {"page": 1, "size": 5, "period": "30d"},
    {"page": 1, "size": 5, "days": 7},
    {"page": 1, "size": 5, "time_range": "7d"},
    {"page": 1, "size": 5, "date_range": "7"},
]

print("🔍 Testing mlbb-stats API for period/date filtering...\n")

for i, params in enumerate(test_params, 1):
    try:
        response = requests.get(base_url, params=params, timeout=10)
        data = response.json()
        
        param_str = "&".join([f"{k}={v}" for k, v in params.items()])
        print(f"Test {i}: ?{param_str}")
        
        if "data" in data:
            heroes_count = len(data["data"])
            first_hero = data["data"][0] if heroes_count > 0 else {}
            
            # Check if we got different data or error
            print(f"  ✅ Status: {response.status_code}")
            print(f"  Heroes: {heroes_count}")
            
            if first_hero:
                print(f"  First hero: {first_hero.get('main_hero_name', 'N/A')}")
                print(f"  Win rate: {first_hero.get('main_hero_win_rate', 'N/A')}%")
                
                # Check if there's any date/period info in response
                if 'period' in first_hero or 'date' in first_hero or 'updated' in first_hero:
                    print(f"  📅 Contains date/period info!")
        else:
            print(f"  ❌ Unexpected response structure")
            print(f"  Response keys: {list(data.keys())}")
            
    except Exception as e:
        print(f"  ❌ Error: {e}")
    
    print()

print("\n📝 Checking response structure for date/period fields...")
try:
    response = requests.get(base_url, params={"page": 1, "size": 1}, timeout=10)
    data = response.json()
    
    if "data" in data and len(data["data"]) > 0:
        hero = data["data"][0]
        print(f"All fields in hero object:")
        for key in hero.keys():
            print(f"  - {key}: {hero[key]}")
except Exception as e:
    print(f"Error: {e}")
