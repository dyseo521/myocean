#!/usr/bin/env python3
"""
마이오션 프로젝트 - 해양 데이터 처리 스크립트
ref-code/process_marine_data.py를 기반으로 작성

CSV 데이터를 읽어 핫스팟 정보를 JSON으로 변환합니다.
"""

import pandas as pd
import json
from pathlib import Path
from datetime import datetime
from collections import defaultdict

# 파일 경로
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / 'data'
OUTPUT_DIR = BASE_DIR / 'frontend' / 'public' / 'data'

FISHING_DATA = DATA_DIR / '(완료)고정자망 조업활동 데이터' / '2023년 고정자망 조업활동 데이터' / 'korea_set_gillnets-2023.csv'
DEBRIS_DATA = DATA_DIR / '(완료)어업기인 해안쓰레기' / '다운로드 원본' / '2021년_어업기인쓰레기.csv'

# 격자 크기 (도 단위)
GRID_SIZE = 0.1  # 약 11km


def load_fishing_activity_data():
    """조업 활동 데이터 로드"""
    print("조업 활동 데이터 로딩 중...")

    try:
        df = pd.read_csv(FISHING_DATA, encoding='utf-8')
    except UnicodeDecodeError:
        df = pd.read_csv(FISHING_DATA, encoding='cp949')

    # 위도/경도 필터링 (한국 해역)
    df = df[(df['LA'] >= 32) & (df['LA'] <= 39) &
            (df['LO'] >= 124) & (df['LO'] <= 132)]

    print(f"조업 활동 레코드: {len(df):,}건")
    return df


def load_debris_data():
    """해양 쓰레기 데이터 로드"""
    print("해양 쓰레기 데이터 로딩 중...")

    try:
        df = pd.read_csv(DEBRIS_DATA, encoding='utf-8')
    except UnicodeDecodeError:
        df = pd.read_csv(DEBRIS_DATA, encoding='cp949')

    # 시작점 좌표 사용
    df = df.dropna(subset=['STR_LA', 'STR_LO'])
    df = df[(df['STR_LA'] >= 32) & (df['STR_LA'] <= 39) &
            (df['STR_LO'] >= 124) & (df['STR_LO'] <= 132)]

    print(f"해양 쓰레기 레코드: {len(df):,}건")
    return df


def create_grid_hotspots(df, lat_col, lng_col, value_col='count', count_field='activity_count'):
    """격자 기반 핫스팟 생성"""
    print(f"격자 크기 {GRID_SIZE}도로 핫스팟 계산 중...")

    # 격자 좌표 생성
    df['grid_lat'] = (df[lat_col] // GRID_SIZE) * GRID_SIZE + GRID_SIZE / 2
    df['grid_lng'] = (df[lng_col] // GRID_SIZE) * GRID_SIZE + GRID_SIZE / 2

    # 격자별 집계
    if value_col == 'count':
        grid_counts = df.groupby(['grid_lat', 'grid_lng']).size()
    else:
        grid_counts = df.groupby(['grid_lat', 'grid_lng'])[value_col].sum()

    # 핫스팟 리스트 생성
    hotspots = []
    max_count = grid_counts.max()

    for (lat, lng), count in grid_counts.items():
        hotspots.append({
            'lat': round(float(lat), 4),
            'lng': round(float(lng), 4),
            'intensity': round(float(count / max_count), 4),
            count_field: int(count)
        })

    # 강도 순으로 정렬
    hotspots.sort(key=lambda x: x['intensity'], reverse=True)

    print(f"생성된 핫스팟: {len(hotspots)}개")
    return hotspots


def generate_map_data():
    """최종 지도 데이터 생성"""
    print("\n=== 마이오션 데이터 처리 시작 ===\n")

    # 데이터 로드
    fishing_df = load_fishing_activity_data()
    debris_df = load_debris_data()

    # 핫스팟 생성
    print("\n조업 활동 핫스팟 생성...")
    fishing_hotspots = create_grid_hotspots(fishing_df, 'LA', 'LO', count_field='activity_count')

    print("\n해양 쓰레기 핫스팟 생성...")
    # 쓰레기는 개수(IEM_CNT) 고려
    debris_df_filtered = debris_df[debris_df['IEM_CNT'] > 0].copy()
    debris_hotspots = create_grid_hotspots(debris_df_filtered, 'STR_LA', 'STR_LO', 'IEM_CNT', count_field='debris_count')

    # 상위 핫스팟만 선택 (성능 최적화)
    fishing_hotspots = fishing_hotspots[:50]
    debris_hotspots = debris_hotspots[:50]

    # JSON 데이터 구조
    map_data = {
        'metadata': {
            'generated_at': datetime.now().isoformat(),
            'fishing_records': len(fishing_df),
            'debris_records': len(debris_df),
            'grid_size_degrees': GRID_SIZE,
            'grid_size_km': round(GRID_SIZE * 111, 1)  # 대략적인 km 변환
        },
        'fishing_hotspots': fishing_hotspots,
        'debris_hotspots': debris_hotspots,
        'coverage': {
            'lat_min': float(fishing_df['LA'].min()),
            'lat_max': float(fishing_df['LA'].max()),
            'lng_min': float(fishing_df['LO'].min()),
            'lng_max': float(fishing_df['LO'].max())
        }
    }

    # 지역별 통계 (부산, 인천, 강원 등)
    regional_stats = []

    # 쓰레기 종류별 통계
    if 'IEM_NM' in debris_df.columns:
        top_debris = debris_df.groupby('IEM_NM')['IEM_CNT'].sum().nlargest(10)
        map_data['top_debris_items'] = {
            item: int(count) for item, count in top_debris.items()
        }

    # 출력 디렉토리 생성
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # JSON 저장
    output_file = OUTPUT_DIR / 'marine_hotspots.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(map_data, f, ensure_ascii=False, indent=2)

    print(f"\n✅ JSON 파일 생성 완료: {output_file}")
    print(f"   - 조업 핫스팟: {len(fishing_hotspots)}개")
    print(f"   - 쓰레기 핫스팟: {len(debris_hotspots)}개")
    print(f"   - 파일 크기: {output_file.stat().st_size / 1024:.1f} KB")
    print("\n=== 처리 완료 ===\n")


if __name__ == '__main__':
    generate_map_data()
