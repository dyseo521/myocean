#!/usr/bin/env python3
"""
Process marine debris and fishing activity data to generate hotspot map data
Reads CSV files and generates JSON for frontend map visualization
"""

import pandas as pd
import json
from pathlib import Path
from collections import defaultdict
import numpy as np

# File paths
BASE_DIR = Path(__file__).parent.parent
FISHING_CSV = BASE_DIR / "(완료)고정자망 조업활동 데이터/2023년 고정자망 조업활동 데이터/korea_set_gillnets-2023.csv"
DEBRIS_CSV = BASE_DIR / "(완료)어업기인 해안쓰레기/다운로드 원본/2021년_어업기인쓰레기.csv"
OUTPUT_DIR = BASE_DIR / "frontend/public/data"

def load_fishing_activity_data():
    """Load and process fishing activity data"""
    print("📊 Loading fishing activity data...")

    df = pd.read_csv(FISHING_CSV)
    print(f"   Loaded {len(df):,} fishing activity records")

    # Extract location data (LA = Latitude, LO = Longitude)
    fishing_locations = df[['LA', 'LO', 'TTL_KM_DSTC']].copy()
    fishing_locations.columns = ['lat', 'lng', 'distance_km']

    # Remove invalid coordinates
    fishing_locations = fishing_locations.dropna()
    fishing_locations = fishing_locations[
        (fishing_locations['lat'] >= 32) & (fishing_locations['lat'] <= 39) &
        (fishing_locations['lng'] >= 124) & (fishing_locations['lng'] <= 132)
    ]

    print(f"   Valid coordinates: {len(fishing_locations):,}")
    return fishing_locations

def load_debris_data():
    """Load and process marine debris data"""
    print("🗑️  Loading marine debris data...")

    df = pd.read_csv(DEBRIS_CSV, encoding='utf-8-sig')
    print(f"   Loaded {len(df):,} debris records")

    # Extract location data and item counts
    # Use STR_LA, STR_LO for start location
    debris_locations = df[['STR_LA', 'STR_LO', 'IEM_CNT', 'IEM_NM', 'ADM_ZN_NM', 'CST_NM']].copy()
    debris_locations.columns = ['lat', 'lng', 'item_count', 'item_name', 'region', 'coast']

    # Remove invalid coordinates
    debris_locations = debris_locations.dropna(subset=['lat', 'lng'])
    debris_locations = debris_locations[
        (debris_locations['lat'] >= 32) & (debris_locations['lat'] <= 39) &
        (debris_locations['lng'] >= 124) & (debris_locations['lng'] <= 132)
    ]

    # Convert item_count to numeric
    debris_locations['item_count'] = pd.to_numeric(debris_locations['item_count'], errors='coerce').fillna(0)

    print(f"   Valid coordinates: {len(debris_locations):,}")
    return debris_locations

def create_grid_hotspots(locations, grid_size=0.1, value_col='distance_km'):
    """
    Create grid-based hotspots by aggregating points
    grid_size: degrees (0.1 ≈ 11km)
    """
    print(f"🔥 Creating hotspots with {grid_size}° grid...")

    # Create grid coordinates
    locations['grid_lat'] = (locations['lat'] / grid_size).round() * grid_size
    locations['grid_lng'] = (locations['lng'] / grid_size).round() * grid_size

    # Aggregate by grid
    if value_col in locations.columns:
        hotspots = locations.groupby(['grid_lat', 'grid_lng']).agg({
            value_col: 'sum',
            'lat': 'count'  # count as activity
        }).reset_index()
        hotspots.columns = ['lat', 'lng', 'total_value', 'activity_count']
    else:
        hotspots = locations.groupby(['grid_lat', 'grid_lng']).size().reset_index()
        hotspots.columns = ['lat', 'lng', 'activity_count']
        hotspots['total_value'] = hotspots['activity_count']

    # Calculate intensity (normalize 0-100)
    max_value = hotspots['total_value'].max()
    if max_value > 0:
        hotspots['intensity'] = (hotspots['total_value'] / max_value * 100).round(1)
    else:
        hotspots['intensity'] = 0

    print(f"   Created {len(hotspots)} hotspot cells")
    return hotspots

def generate_map_data():
    """Generate comprehensive map data for frontend"""
    print("\n🗺️  Generating map data...")
    print("=" * 60)

    # Load data
    fishing_data = load_fishing_activity_data()
    debris_data = load_debris_data()

    print("\n📍 Processing hotspots...")

    # Create fishing activity hotspots
    fishing_hotspots = create_grid_hotspots(
        fishing_data,
        grid_size=0.1,  # ~11km grid
        value_col='distance_km'
    )

    # Create debris hotspots
    debris_hotspots = create_grid_hotspots(
        debris_data,
        grid_size=0.1,
        value_col='item_count'
    )

    # Top fishing areas
    top_fishing = fishing_hotspots.nlargest(50, 'intensity')[['lat', 'lng', 'intensity', 'activity_count']].to_dict('records')

    # Top debris areas
    top_debris = debris_hotspots.nlargest(50, 'intensity')[['lat', 'lng', 'intensity', 'activity_count']].to_dict('records')

    # Regional statistics
    debris_by_region = debris_data.groupby('region').agg({
        'item_count': 'sum',
        'lat': 'count'
    }).reset_index()
    debris_by_region.columns = ['region', 'total_items', 'incident_count']
    debris_by_region = debris_by_region.sort_values('total_items', ascending=False)

    # Most common debris items
    debris_items = debris_data.groupby('item_name')['item_count'].sum().sort_values(ascending=False).head(10)

    # Generate output
    output_data = {
        'metadata': {
            'generated_at': pd.Timestamp.now().isoformat(),
            'fishing_records': len(fishing_data),
            'debris_records': len(debris_data),
            'grid_size_degrees': 0.1,
            'grid_size_km': 11
        },
        'fishing_hotspots': top_fishing,
        'debris_hotspots': top_debris,
        'regional_statistics': debris_by_region.to_dict('records'),
        'top_debris_items': debris_items.to_dict(),
        'coverage': {
            'lat_min': float(min(fishing_data['lat'].min(), debris_data['lat'].min())),
            'lat_max': float(max(fishing_data['lat'].max(), debris_data['lat'].max())),
            'lng_min': float(min(fishing_data['lng'].min(), debris_data['lng'].min())),
            'lng_max': float(max(fishing_data['lng'].max(), debris_data['lng'].max()))
        }
    }

    # Save to JSON
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output_file = OUTPUT_DIR / 'marine_hotspots.json'

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)

    print(f"\n✅ Map data generated: {output_file}")
    print(f"   - Fishing hotspots: {len(top_fishing)}")
    print(f"   - Debris hotspots: {len(top_debris)}")
    print(f"   - Regional stats: {len(debris_by_region)}")

    # Print summary
    print("\n📊 Summary Statistics:")
    print("=" * 60)
    print("\n🎣 Top 5 Fishing Activity Areas:")
    for i, area in enumerate(top_fishing[:5], 1):
        print(f"   {i}. Lat: {area['lat']:.3f}, Lng: {area['lng']:.3f}")
        print(f"      Intensity: {area['intensity']:.1f}, Activities: {area['activity_count']}")

    print("\n🗑️  Top 5 Marine Debris Areas:")
    for i, area in enumerate(top_debris[:5], 1):
        print(f"   {i}. Lat: {area['lat']:.3f}, Lng: {area['lng']:.3f}")
        print(f"      Intensity: {area['intensity']:.1f}, Incidents: {area['activity_count']}")

    print("\n🌊 Debris by Region:")
    for _, row in debris_by_region.head(10).iterrows():
        print(f"   {row['region']}: {int(row['total_items'])} items ({int(row['incident_count'])} incidents)")

    print("\n📦 Top Debris Items:")
    for item, count in list(debris_items.items())[:5]:
        print(f"   {item}: {int(count)}")

    print("\n" + "=" * 60)

    return output_data

if __name__ == "__main__":
    try:
        data = generate_map_data()
        print("\n✅ Success! Data ready for frontend map.")
        print(f"   File: /frontend/public/data/marine_hotspots.json")
    except FileNotFoundError as e:
        print(f"\n❌ Error: File not found - {e}")
        print("   Make sure CSV files exist at:")
        print(f"   - {FISHING_CSV}")
        print(f"   - {DEBRIS_CSV}")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
