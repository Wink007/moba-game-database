#!/usr/bin/env python3
"""
Тестування CRUD операцій для патчів
"""

import requests
import json

API_URL = "https://web-production-8570.up.railway.app/api"
TEST_PATCH_VERSION = "test_patch_99.99.99"

def test_patches_crud():
    """Тестує створення, читання, оновлення та видалення патчів"""
    
    print("=" * 60)
    print("🧪 Testing Patches CRUD Operations")
    print("=" * 60)
    
    # 1. Створення патчу
    print("\n1️⃣ Creating test patch...")
    test_patch = {
        "version": TEST_PATCH_VERSION,
        "release_date": "2025-01-05",
        "hero_adjustments": {
            "TestHero": {
                "summary": "Test adjustments",
                "skills": [
                    {
                        "name": "Test Skill",
                        "changes": ["Test change 1", "Test change 2"]
                    }
                ]
            }
        },
        "system_adjustments": ["Test system adjustment"]
    }
    
    response = requests.post(f"{API_URL}/patches", json=test_patch)
    print(f"   Status: {response.status_code}")
    if response.status_code == 201:
        print("   ✅ Patch created successfully!")
        print(f"   Data: {json.dumps(response.json(), indent=2)}")
    else:
        print(f"   ❌ Failed: {response.text}")
        return False
    
    # 2. Читання патчу
    print(f"\n2️⃣ Reading patch {TEST_PATCH_VERSION}...")
    response = requests.get(f"{API_URL}/patches/{TEST_PATCH_VERSION}")
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print("   ✅ Patch retrieved successfully!")
        data = response.json()
        print(f"   Version: {data.get('version')}")
        print(f"   Release Date: {data.get('release_date')}")
    else:
        print(f"   ❌ Failed: {response.text}")
        return False
    
    # 3. Оновлення патчу
    print(f"\n3️⃣ Updating patch {TEST_PATCH_VERSION}...")
    updated_patch = test_patch.copy()
    updated_patch["system_adjustments"] = ["Updated system adjustment", "Another adjustment"]
    
    response = requests.put(f"{API_URL}/patches/{TEST_PATCH_VERSION}", json=updated_patch)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print("   ✅ Patch updated successfully!")
        data = response.json()
        print(f"   System adjustments: {data.get('patch', {}).get('system_adjustments')}")
    else:
        print(f"   ❌ Failed: {response.text}")
        return False
    
    # 4. Перевірка оновлення
    print(f"\n4️⃣ Verifying update...")
    response = requests.get(f"{API_URL}/patches/{TEST_PATCH_VERSION}")
    if response.status_code == 200:
        data = response.json()
        if len(data.get('system_adjustments', [])) == 2:
            print("   ✅ Update verified!")
        else:
            print("   ❌ Update not applied correctly")
            return False
    else:
        print(f"   ❌ Failed to verify: {response.text}")
        return False
    
    # 5. Видалення патчу
    print(f"\n5️⃣ Deleting patch {TEST_PATCH_VERSION}...")
    response = requests.delete(f"{API_URL}/patches/{TEST_PATCH_VERSION}")
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print("   ✅ Patch deleted successfully!")
    else:
        print(f"   ❌ Failed: {response.text}")
        return False
    
    # 6. Перевірка видалення
    print(f"\n6️⃣ Verifying deletion...")
    response = requests.get(f"{API_URL}/patches/{TEST_PATCH_VERSION}")
    if response.status_code == 404:
        print("   ✅ Deletion verified - patch not found (as expected)")
    else:
        print(f"   ❌ Patch still exists (status: {response.status_code})")
        return False
    
    print("\n" + "=" * 60)
    print("✅ All tests passed!")
    print("=" * 60)
    return True

if __name__ == "__main__":
    try:
        success = test_patches_crud()
        exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        exit(1)
