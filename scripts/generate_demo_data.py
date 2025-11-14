#!/usr/bin/env python3
"""
데모용 모의 기부 데이터 생성 스크립트
LocalStorage에 주입할 수 있는 JSON 데이터 생성
"""

import json
import random
from datetime import datetime, timedelta
from pathlib import Path

# 샘플 기부자 이름
SAMPLE_DONORS = [
    "김해양", "이바다", "박수산", "최청정", "정환경",
    "강부산", "윤인천", "임제주", "한울산", "오거제",
    "서통영", "권여수", "남포항", "송목포", "문군산"
]

# 부산 해역 중심
BUSAN_LAT = 35.1
BUSAN_LNG = 129.0

def generate_random_location():
    """부산 해역 랜덤 좌표 생성"""
    lat = BUSAN_LAT + random.uniform(-0.3, 0.3)
    lng = BUSAN_LNG + random.uniform(-0.3, 0.3)
    return round(lat, 4), round(lng, 4)

def generate_donations(count=20):
    """모의 기부 데이터 생성"""
    donations = []
    amounts = [100000, 1000000, 10000000]

    for i in range(count):
        amount = random.choice(amounts)
        lat, lng = generate_random_location()

        # 과거 1-30일 사이 랜덤 날짜
        days_ago = random.randint(1, 30)
        date = (datetime.now() - timedelta(days=days_ago)).isoformat()

        # 영역 계산
        area_map = {100000: 1, 1000000: 5, 10000000: 20}
        area = area_map[amount]

        # 정화 진행률 (날짜가 오래될수록 높음)
        cleanup_progress = min(100, days_ago * 3)

        donation = {
            "id": f"demo-{i+1}",
            "name": random.choice(SAMPLE_DONORS),
            "amount": amount,
            "location": {
                "lat": lat,
                "lng": lng
            },
            "area": area,
            "date": date,
            "cleanupProgress": cleanup_progress,
            "regionName": f"{lat:.2f}°N {lng:.2f}°E"
        }

        donations.append(donation)

    return donations

def generate_demo_json():
    """데모 데이터 JSON 생성"""
    donations = generate_donations(20)

    demo_data = {
        "donations": donations,
        "currentUser": None,
        "instructions": {
            "ko": "브라우저 개발자 도구(F12)의 Application > Local Storage에서 'myocean_donations' 키로 이 donations 배열을 저장하세요.",
            "en": "In browser DevTools (F12), go to Application > Local Storage and save this donations array with key 'myocean_donations'."
        }
    }

    # 파일 저장
    output_file = Path(__file__).parent.parent / 'frontend' / 'public' / 'demo-data.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(demo_data, f, ensure_ascii=False, indent=2)

    print(f"✅ 데모 데이터 생성 완료: {output_file}")
    print(f"   - 기부자 수: {len(donations)}명")
    print(f"   - 총 기부 금액: {sum(d['amount'] for d in donations):,}원")
    print(f"\n사용 방법:")
    print("1. 브라우저에서 앱을 열고 F12를 누릅니다")
    print("2. Console 탭에서 다음 명령어를 실행합니다:")
    print(f"\n   fetch('/demo-data.json').then(r=>r.json()).then(d=>localStorage.setItem('myocean_donations',JSON.stringify(d.donations)))")
    print("\n3. 페이지를 새로고침합니다")

if __name__ == '__main__':
    generate_demo_json()
