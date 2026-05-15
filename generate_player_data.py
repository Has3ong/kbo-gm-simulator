#!/usr/bin/env python3
"""
KBO GM 시뮬레이터 - 선수 데이터 생성 스크립트

기능:
1. kbo_batting/pitching_stats_by_season 파일에서 2025년 기록이 있는 선수들의 전체 연도별 이력을 DB에 적재
2. 최근 3~5년 기록 기반 능력치 재산정
3. 멀티포지션 숙련도 추가 (PLR_POSN)
4. 포지션 정보 재조정 (POSN_CD, REPR_POSN_CD)

출력: V21__insert_hist_stats.sql, V22__update_abilities_posns.sql
"""

import csv
import math
import sys
from collections import defaultdict

# ──────────────────────────────────────────────
# 1. DB 선수 목록 로드
# ──────────────────────────────────────────────
def load_db_players(filepath):
    """DB 선수 목록: name -> plr_id"""
    players = {}
    with open(filepath, encoding='utf-8') as f:
        lines = f.readlines()
    for line in lines[1:]:
        parts = line.strip().split('\t')
        if len(parts) >= 2:
            plr_id = int(parts[0])
            name = parts[1].strip()
            players[name] = plr_id
    return players

# ──────────────────────────────────────────────
# 2. 스탯 파일 파싱
# ──────────────────────────────────────────────
BAT_HEADERS = ['Id','Name','Birthdate','Handedness','School','Draft','Year','Team','Age',
               'Pos','G','oWAR','dWAR','PA','ePA','AB','R','H','H2B','H3B','HR','TB',
               'RBI','SB','CS','BB','HP','IBB','SO','GDP','SH','SF',
               'AVG','OBP','SLG','OPS','RePA','wRCP','WAR']

PIT_HEADERS = ['Id','Name','Birthdate','Handedness','School','Draft','Year','Team','Age',
               'Pos','G','GS','GR','GF','CG','SHO','W','L','S','HD','IP','ER','R',
               'rRA','TBF','H','H2B','H3B','HR','BB','HP','IBB','SO','ROE','BK','WP',
               'ERA','RA9','rRA9','FIP','WHIP','WAR']

def safe_int(val, default=0):
    try:
        if val in ('', None): return default
        return int(float(val))
    except: return default

def safe_float(val, default=None):
    try:
        if val in ('', None): return default
        return float(val)
    except: return default

def ip_str_to_outs(ip_str):
    """'8.1' → 25 아웃카운트, '153' → 459 아웃카운트"""
    try:
        ip = float(ip_str)
        full = int(ip)
        partial = round((ip - full) * 10)  # .1 → 1out, .2 → 2out
        if partial >= 3:  # 소수점 반올림 오류 방지
            full += 1
            partial = 0
        return full * 3 + partial
    except:
        return 0

def parse_batting_file(filepath, name_to_id):
    """
    타자 기록 파싱
    반환: {plr_id: {year: stats_dict}} (같은 year, 다팀 집계)
    """
    records = defaultdict(lambda: defaultdict(dict))
    ext_to_name = {}

    with open(filepath, encoding='utf-8') as f:
        reader = csv.DictReader(f, fieldnames=BAT_HEADERS)
        next(reader)  # 헤더 스킵
        for row in reader:
            name = row['Name'].strip()
            if name not in name_to_id:
                continue
            plr_id = name_to_id[name]
            year = safe_int(row['Year'])
            if year < 1982 or year > 2025:
                continue

            existing = records[plr_id].get(year, {})
            if existing:
                # 같은 연도 다팀 → 카운팅 스탯 합산
                for k in ['G','PA','AB','R','H','H2B','H3B','HR','TB','RBI',
                          'SB','CS','BB','HP','IBB','SO','GDP','SH','SF']:
                    existing[k] = existing.get(k, 0) + safe_int(row.get(k, '0'))
                # 비율 스탯은 재계산
                ab = existing['AB']
                pa = existing['PA']
                existing['AVG'] = round(existing['H'] / ab, 3) if ab > 0 else None
                existing['OBP'] = round((existing['H'] + existing['BB'] + existing['HP']) /
                                        (pa - existing['SH'] + existing['HP']) if
                                        (pa - existing['SH'] + existing['HP']) > 0 else 0, 3)
                tb = existing['H'] + existing['H2B'] + existing['H3B']*2 + existing['HR']*3
                existing['SLG'] = round(tb / ab, 3) if ab > 0 else None
                existing['TB'] = tb
                if existing['OBP'] and existing['SLG']:
                    existing['OPS'] = round(existing['OBP'] + existing['SLG'], 3)
            else:
                existing = {
                    'G':   safe_int(row.get('G', '0')),
                    'PA':  safe_int(row.get('PA', '0')),
                    'AB':  safe_int(row.get('AB', '0')),
                    'R':   safe_int(row.get('R', '0')),
                    'H':   safe_int(row.get('H', '0')),
                    'H2B': safe_int(row.get('H2B', '0')),
                    'H3B': safe_int(row.get('H3B', '0')),
                    'HR':  safe_int(row.get('HR', '0')),
                    'TB':  safe_int(row.get('TB', '0')),
                    'RBI': safe_int(row.get('RBI', '0')),
                    'SB':  safe_int(row.get('SB', '0')),
                    'CS':  safe_int(row.get('CS', '0')),
                    'BB':  safe_int(row.get('BB', '0')),
                    'HP':  safe_int(row.get('HP', '0')),
                    'IBB': safe_int(row.get('IBB', '0')),
                    'SO':  safe_int(row.get('SO', '0')),
                    'GDP': safe_int(row.get('GDP', '0')),
                    'SH':  safe_int(row.get('SH', '0')),
                    'SF':  safe_int(row.get('SF', '0')),
                    'AVG': safe_float(row.get('AVG')),
                    'OBP': safe_float(row.get('OBP')),
                    'SLG': safe_float(row.get('SLG')),
                    'OPS': safe_float(row.get('OPS')),
                    'wRCP': safe_float(row.get('wRCP')),
                    'WAR': safe_float(row.get('WAR')),
                    'Pos': row.get('Pos', '').strip(),
                    'Team': row.get('Team', '').strip(),
                }
                records[plr_id][year] = existing
    return dict(records)


def parse_pitching_file(filepath, name_to_id):
    """
    투수 기록 파싱
    반환: {plr_id: {year: stats_dict}}
    """
    records = defaultdict(lambda: defaultdict(dict))

    with open(filepath, encoding='utf-8') as f:
        reader = csv.DictReader(f, fieldnames=PIT_HEADERS)
        next(reader)
        for row in reader:
            name = row['Name'].strip()
            if name not in name_to_id:
                continue
            plr_id = name_to_id[name]
            year = safe_int(row['Year'])
            if year < 1982 or year > 2025:
                continue

            ip_out = ip_str_to_outs(row.get('IP', '0'))

            existing = records[plr_id].get(year, {})
            if existing:
                # 다팀 집계
                for k in ['G','GS','GR','W','L','S','HD','ER','R','H','HR','BB','IBB','SO','HP','BK','WP']:
                    existing[k] = existing.get(k, 0) + safe_int(row.get(k, '0'))
                existing['IP_OUT'] = existing.get('IP_OUT', 0) + ip_out
                existing['TBF'] = existing.get('TBF', 0) + safe_int(row.get('TBF', '0'))
                ip = existing['IP_OUT'] / 3
                existing['ERA'] = round(existing['ER'] / ip * 9, 2) if ip > 0 else None
                existing['WHIP'] = round((existing['BB'] + existing['H']) / ip, 3) if ip > 0 else None
            else:
                existing = {
                    'G':   safe_int(row.get('G', '0')),
                    'GS':  safe_int(row.get('GS', '0')),
                    'GR':  safe_int(row.get('GR', '0')),
                    'W':   safe_int(row.get('W', '0')),
                    'L':   safe_int(row.get('L', '0')),
                    'S':   safe_int(row.get('S', '0')),
                    'HD':  safe_int(row.get('HD', '0')),
                    'IP_OUT': ip_out,
                    'TBF': safe_int(row.get('TBF', '0')),
                    'H':   safe_int(row.get('H', '0')),
                    'HR':  safe_int(row.get('HR', '0')),
                    'R':   safe_int(row.get('R', '0')),
                    'ER':  safe_int(row.get('ER', '0')),
                    'BB':  safe_int(row.get('BB', '0')),
                    'IBB': safe_int(row.get('IBB', '0')),
                    'SO':  safe_int(row.get('SO', '0')),
                    'HP':  safe_int(row.get('HP', '0')),
                    'BK':  safe_int(row.get('BK', '0')),
                    'WP':  safe_int(row.get('WP', '0')),
                    'ERA': safe_float(row.get('ERA')),
                    'FIP': safe_float(row.get('FIP')),
                    'WHIP': safe_float(row.get('WHIP')),
                    'WAR': safe_float(row.get('WAR')),
                    'Pos': row.get('Pos', '').strip(),
                }
                records[plr_id][year] = existing
    return dict(records)


# ──────────────────────────────────────────────
# 3. 2025년 기록 있는 선수 필터링
# ──────────────────────────────────────────────
def filter_players_with_2025(batting_records, pitching_records):
    """2025년 기록이 있는 선수 ID 집합 반환"""
    ids = set()
    for plr_id, years in batting_records.items():
        if 2025 in years:
            ids.add(plr_id)
    for plr_id, years in pitching_records.items():
        if 2025 in years:
            ids.add(plr_id)
    return ids


# ──────────────────────────────────────────────
# 4. 능력치 계산 (20-80 스케일)
# ──────────────────────────────────────────────
RECENT_WEIGHTS = {2025: 0.40, 2024: 0.25, 2023: 0.20, 2022: 0.10, 2021: 0.05}

def clamp(v, lo=20, hi=80):
    return max(lo, min(hi, round(v)))

def weighted_stat(records, year_weights, stat_key, min_pa=30):
    """연도별 가중평균 스탯 계산 (PA/IP 기준 필터링)"""
    total_w = 0
    total_v = 0
    for yr, w in sorted(year_weights.items(), reverse=True):
        if yr not in records:
            continue
        r = records[yr]
        pa = r.get('PA', 0)
        ip_out = r.get('IP_OUT', 0)
        qualifying = (pa >= min_pa) or (ip_out >= min_pa * 3)
        if not qualifying:
            continue
        v = r.get(stat_key)
        if v is None:
            continue
        total_w += w
        total_v += v * w
    if total_w < 0.01:
        return None
    return total_v / total_w


def calc_batter_abilities(records, current_prfc=50):
    """
    타자 능력치 계산
    반환: {ablt_cd: val}
    """
    recent = {yr: records[yr] for yr in range(2021, 2026) if yr in records}
    if not recent:
        # 최신 3년치라도
        years = sorted(records.keys(), reverse=True)[:3]
        recent = {yr: records[yr] for yr in years}

    # 각 스탯을 연도별 가중평균으로 계산
    def w_avg_from_counts(stat_num, stat_den, min_denom=30):
        total_w = 0
        total_num = 0
        total_den = 0
        for yr, w in RECENT_WEIGHTS.items():
            if yr not in records: continue
            r = records[yr]
            pa = r.get('PA', 0)
            if pa < min_denom: continue
            total_num += r.get(stat_num, 0) * w
            total_den += r.get(stat_den, 0) * w
            total_w += w
        if total_den < 1 or total_w < 0.01: return None
        return total_num / total_den

    # PA 가중치 (최근 연도)
    total_pa_w = 0
    sum_pa_w = 0
    for yr, w in RECENT_WEIGHTS.items():
        if yr not in records: continue
        pa = records[yr].get('PA', 0)
        if pa >= 30:
            sum_pa_w += pa * w
            total_pa_w += w

    # 타율 기반 CNT
    ba = w_avg_from_counts('H', 'AB', 20)
    so_pa = w_avg_from_counts('SO', 'PA', 30)
    if ba is None: ba = 0.240
    if so_pa is None: so_pa = 0.20
    ba_z = (ba - 0.258) / 0.028
    cntct_z = (1 - so_pa - 0.185) / 0.045
    cnt = 50 + (ba_z * 0.55 + cntct_z * 0.45) * 9
    cnt = clamp(cnt)

    # ISO + HR 기반 PWR
    slg = w_avg_from_counts('TB', 'AB', 20)
    ab_per_hr_inv = w_avg_from_counts('HR', 'AB', 20)
    if slg is None: slg = 0.350
    if ba is None: ba = 0.258
    iso = slg - ba if slg else 0.09
    if ab_per_hr_inv is None: ab_per_hr_inv = 0.030
    iso_z = (iso - 0.095) / 0.040
    hr_z = (ab_per_hr_inv - 0.030) / 0.020
    pwr = 50 + (iso_z * 0.60 + hr_z * 0.40) * 9
    pwr = clamp(pwr)

    # R/PA 기반 RUN (득점 + 3루타)
    r_pa = w_avg_from_counts('R', 'PA', 30)
    h3b_pa = w_avg_from_counts('H3B', 'PA', 50)
    if r_pa is None: r_pa = 0.080
    if h3b_pa is None: h3b_pa = 0.003
    run_z = (r_pa - 0.080) / 0.025
    h3b_z = (h3b_pa - 0.003) / 0.003
    run = 50 + (run_z * 0.75 + h3b_z * 0.25) * 9
    run = clamp(run)

    # SB 기반 STL
    sb_pa = w_avg_from_counts('SB', 'PA', 30)
    # SB 성공률
    total_sb = sum(records[yr].get('SB', 0) for yr in range(2021, 2026) if yr in records)
    total_cs = sum(records[yr].get('CS', 0) for yr in range(2021, 2026) if yr in records)
    sb_success = total_sb / (total_sb + total_cs) if (total_sb + total_cs) > 5 else 0.70
    if sb_pa is None: sb_pa = 0.015
    stl_vol_z = (sb_pa - 0.015) / 0.020
    stl_succ_z = (sb_success - 0.68) / 0.10
    stl = 50 + (stl_vol_z * 0.65 + stl_succ_z * 0.35) * 9
    stl = clamp(stl)

    # THR: 송구는 포지션과 current_prfc 기반 (비율 유지)
    thr = clamp(current_prfc * 0.9 + 5)

    return {'CNT': cnt, 'PWR': pwr, 'RUN': run, 'STL': stl, 'THR': thr}


def calc_pitcher_abilities(records):
    """
    투수 능력치 계산
    반환: {ablt_cd: val}
    """
    # IP 가중 집계
    def ip_weighted(stat_key, ip_min=30):
        total_ip = 0
        total_val = 0
        for yr, w in RECENT_WEIGHTS.items():
            if yr not in records: continue
            r = records[yr]
            ip_out = r.get('IP_OUT', 0)
            ip = ip_out / 3
            if ip < ip_min / 3: continue
            v = r.get(stat_key)
            if v is None: continue
            total_ip += ip * w
            total_val += v * ip * w
        if total_ip < 1: return None
        return total_val / total_ip

    def count_per_ip(count_key, ip_min_outs=30):
        total_ip_w = 0
        total_cnt_w = 0
        for yr, w in RECENT_WEIGHTS.items():
            if yr not in records: continue
            r = records[yr]
            ip_out = r.get('IP_OUT', 0)
            if ip_out < ip_min_outs: continue
            ip = ip_out / 3
            total_cnt_w += r.get(count_key, 0) * w
            total_ip_w += ip * w
        if total_ip_w < 1: return None
        return total_cnt_w / total_ip_w * 9  # per 9 innings

    k9 = count_per_ip('SO', 30)
    bb9 = count_per_ip('BB', 30)
    hr9 = count_per_ip('HR', 30)
    era = ip_weighted('ERA', 10)
    fip = ip_weighted('FIP', 10)
    whip = ip_weighted('WHIP', 10)

    if k9 is None: k9 = 6.5
    if bb9 is None: bb9 = 3.5
    if hr9 is None: hr9 = 1.0
    if era is None: era = 4.80
    if fip is None: fip = 4.80
    if whip is None: whip = 1.45

    # VEL: K/9 기반 구속 프록시
    vel_z = (k9 - 6.5) / 2.0
    vel = clamp(50 + vel_z * 10)

    # CTL: BB/9 기반 (낮을수록 좋음)
    ctl_z = -(bb9 - 3.3) / 1.0
    ctl = clamp(50 + ctl_z * 10)

    # BRK: K/BB + ERA-FIP 차이 기반
    kbb = k9 / max(bb9, 0.5)
    kbb_z = (kbb - 2.2) / 0.7
    era_fip_gap = fip - era  # ERA < FIP → 좋은 결과 (운 좋은 게 아님)
    brk_z = kbb_z * 0.65 + (era_fip_gap * 0.25)
    brk = clamp(50 + brk_z * 9)

    # 구종 능력치 - FIP와 ERA 기반 전반적 구위
    base_pitch_z = -(era - 4.50) / 0.80
    base_pitch = clamp(50 + base_pitch_z * 9)

    # P4S (포심): VEL에 근접
    p4s = clamp((vel + base_pitch) / 2)

    # P2S (투심): VEL보다 약간 낮음
    p2s = clamp((vel * 0.85 + base_pitch * 0.15))

    # PSL (슬라이더): BRK 연동
    psl = clamp((brk * 0.6 + base_pitch * 0.4))

    # PCH (체인지업): CTL + BRK 연동
    pch = clamp((ctl * 0.4 + brk * 0.3 + base_pitch * 0.3))

    # PCB (커브): BRK 연동
    pcb = clamp((brk * 0.5 + base_pitch * 0.5))

    return {
        'VEL': vel, 'CTL': ctl, 'BRK': brk,
        'P4S': p4s, 'P2S': p2s, 'PSL': psl, 'PCH': pch, 'PCB': pcb
    }


def calc_ovrl(abilities, is_pitcher):
    """종합 능력치 계산"""
    if is_pitcher:
        weights = {'VEL': 0.20, 'CTL': 0.25, 'BRK': 0.20, 'P4S': 0.10,
                   'P2S': 0.05, 'PSL': 0.10, 'PCH': 0.07, 'PCB': 0.03}
    else:
        weights = {'CNT': 0.30, 'PWR': 0.30, 'RUN': 0.15, 'STL': 0.10, 'THR': 0.15}
    total_w = 0
    total_v = 0
    for k, w in weights.items():
        if k in abilities:
            total_v += abilities[k] * w
            total_w += w
    if total_w < 0.01: return 50
    return clamp(total_v / total_w)


# ──────────────────────────────────────────────
# 5. 포지션 판정 및 멀티포지션 숙련도
# ──────────────────────────────────────────────

# 파일 포지션 → DB POSN_CD
FILE_POS_MAP = {
    '1B': '21', '2B': '22', '3B': '23', 'SS': '24',
    'C': '20', 'LF': '25', 'CF': '26', 'RF': '27',
    'DH': '28', 'P': None
}
# DB POSN_CD → REPR_POSN_CD
POSN_TO_REPR = {
    '10': '10', '11': '10', '12': '10',
    '20': '20',
    '21': '21', '22': '21', '23': '21', '24': '21',
    '25': '22', '26': '22', '27': '22', '28': '22'
}

# 멀티포지션 유사도 (기본 숙련도 × factor → 해당 포지션 숙련도)
# 특수 포지션(C, CF, 2B, SS) 진입 시 페널티 내포
POSN_SIMILARITY = {
    '20': {  # 포수
        '20': 1.00, '21': 0.45, '28': 0.40,
    },
    '21': {  # 1루수
        '21': 1.00, '28': 0.80, '23': 0.62, '25': 0.55, '27': 0.55,
        '26': 0.48, '22': 0.42, '24': 0.38, '20': 0.30,
    },
    '22': {  # 2루수
        '22': 1.00, '24': 0.72, '23': 0.65, '21': 0.62, '25': 0.48, '27': 0.48,
        '26': 0.42, '20': 0.25,
    },
    '23': {  # 3루수
        '23': 1.00, '21': 0.72, '24': 0.60, '22': 0.55, '25': 0.55, '27': 0.55,
        '26': 0.45, '28': 0.65,
    },
    '24': {  # 유격수
        '24': 1.00, '22': 0.75, '23': 0.70, '21': 0.58, '25': 0.42, '27': 0.42,
        '26': 0.38,
    },
    '25': {  # 좌익수
        '25': 1.00, '27': 0.88, '26': 0.72, '21': 0.48, '23': 0.42, '28': 0.70,
    },
    '26': {  # 중견수 (프리미엄)
        '26': 1.00, '25': 0.82, '27': 0.82, '28': 0.60, '21': 0.38,
    },
    '27': {  # 우익수
        '27': 1.00, '25': 0.88, '26': 0.72, '21': 0.48, '23': 0.42, '28': 0.70,
    },
    '28': {  # 지명타자
        '28': 1.00, '21': 0.58, '23': 0.48, '25': 0.45, '27': 0.45,
    },
    # 투수 멀티포지션
    '10': {'10': 1.00, '11': 0.65, '12': 0.55},  # 선발 → 불펜/마무리
    '11': {'11': 1.00, '12': 0.72, '10': 0.55},  # 중간계투 → 마무리/선발
    '12': {'12': 1.00, '11': 0.78, '10': 0.50},  # 마무리 → 셋업/선발
}

# 특수 포지션 추가 페널티 (낮은 숙련도일수록 실점 증가)
PREMIUM_POSNS = {'20', '22', '24', '26'}  # 포수, 2루수, 유격수, 중견수

def determine_pitcher_primary_posn(years_data):
    """투수 주 포지션 판정 (SP/RP/CL)"""
    total_gs = sum(r.get('GS', 0) for r in years_data.values())
    total_s = sum(r.get('S', 0) for r in years_data.values())
    total_hd = sum(r.get('HD', 0) for r in years_data.values())

    recent_gs = sum(years_data.get(yr, {}).get('GS', 0) for yr in [2025, 2024, 2023])
    recent_s = sum(years_data.get(yr, {}).get('S', 0) for yr in [2025, 2024, 2023])

    if recent_gs >= 5:
        return '10'  # 선발
    if recent_s >= 5:
        return '12'  # 마무리
    return '11'  # 중간계투


def build_posn_entries(primary_posn_cd, base_prfc):
    """
    멀티포지션 숙련도 엔트리 생성
    반환: {posn_cd: prfc_ablt}
    """
    sim = POSN_SIMILARITY.get(primary_posn_cd, {primary_posn_cd: 1.0})
    result = {}
    for posn, factor in sim.items():
        prfc = clamp(base_prfc * factor)
        if prfc >= 25:  # 숙련도 25 미만은 사실상 불가 → 제외
            result[posn] = prfc
    return result


# ──────────────────────────────────────────────
# 6. SQL 생성
# ──────────────────────────────────────────────
def v(val, nullable=True):
    """SQL 값 변환"""
    if val is None:
        return 'NULL'
    if isinstance(val, str):
        return f"'{val.replace(chr(39), chr(39)+chr(39))}'"
    return str(val)


def gen_batter_ssnt_inserts(batting_records, player_2025_ids):
    lines = []
    lines.append("-- ===== PLR_BATR_SSNT_REC: 타자 연도별 실적 (기초 데이터) =====")
    for plr_id in sorted(player_2025_ids):
        if plr_id not in batting_records:
            continue
        for year in sorted(batting_records[plr_id].keys()):
            r = batting_records[plr_id][year]
            if r.get('PA', 0) < 10:  # 최소 10 타석 이상만
                continue
            lines.append(
                f"INSERT IGNORE INTO PLR_BATR_SSNT_REC "
                f"(PLR_ID,SSNT_YR,G,PA,AB,H,DOBL,TRPL,HR,RBI,R,BB,IBB,SO,SB,CS,HBP,SAC,SF,GIDP,BA,OBP,SLG,OPS) VALUES "
                f"({plr_id},{year},"
                f"{r.get('G',0)},{r.get('PA',0)},{r.get('AB',0)},"
                f"{r.get('H',0)},{r.get('H2B',0)},{r.get('H3B',0)},{r.get('HR',0)},"
                f"{r.get('RBI',0)},{r.get('R',0)},{r.get('BB',0)},{r.get('IBB',0)},"
                f"{r.get('SO',0)},{r.get('SB',0)},{r.get('CS',0)},"
                f"{r.get('HP',0)},{r.get('SH',0)},{r.get('SF',0)},{r.get('GDP',0)},"
                f"{v(r.get('AVG'))},{v(r.get('OBP'))},{v(r.get('SLG'))},{v(r.get('OPS'))});"
            )
    return lines


def gen_pitcher_ssnt_inserts(pitching_records, player_2025_ids):
    lines = []
    lines.append("-- ===== PLR_PTCH_SSNT_REC: 투수 연도별 실적 (기초 데이터) =====")
    for plr_id in sorted(player_2025_ids):
        if plr_id not in pitching_records:
            continue
        for year in sorted(pitching_records[plr_id].keys()):
            r = pitching_records[plr_id][year]
            if r.get('IP_OUT', 0) < 3:  # 최소 1이닝
                continue
            lines.append(
                f"INSERT IGNORE INTO PLR_PTCH_SSNT_REC "
                f"(PLR_ID,SSNT_YR,G,GS,IP_OUT,BF,H,HR,R,ER,BB,IBB,SO,HBP,W,L,SV,HLD,ERA,WHIP) VALUES "
                f"({plr_id},{year},"
                f"{r.get('G',0)},{r.get('GS',0)},{r.get('IP_OUT',0)},"
                f"{r.get('TBF',0)},{r.get('H',0)},{r.get('HR',0)},"
                f"{r.get('R',0)},{r.get('ER',0)},{r.get('BB',0)},{r.get('IBB',0)},"
                f"{r.get('SO',0)},{r.get('HP',0)},"
                f"{r.get('W',0)},{r.get('L',0)},{r.get('S',0)},{r.get('HD',0)},"
                f"{v(r.get('ERA'))},{v(r.get('WHIP'))});"
            )
    return lines


def gen_ability_updates(db_players, batting_records, pitching_records,
                         db_posns, player_2025_ids):
    """
    PLR_ABLT UPDATE, PLR OVRL UPDATE, PLR_POSN REPLACE 생성
    """
    ablt_lines = []
    posn_lines = []
    ovrl_lines = []

    # db_posns: plr_id -> [(posn_cd, prfc_ablt)]
    for plr_id in sorted(player_2025_ids):
        if plr_id not in db_posns:
            continue

        current_posns = db_posns[plr_id]  # [(posn_cd, prfc_ablt)]
        primary_posn = current_posns[0][0]  # 현재 주 포지션
        base_prfc = current_posns[0][1]

        is_pitcher = primary_posn in ('10', '11', '12')

        # ── 포지션 재판정 ──
        if is_pitcher and plr_id in pitching_records:
            new_primary = determine_pitcher_primary_posn(pitching_records[plr_id])
            if new_primary != primary_posn:
                primary_posn = new_primary

        # ── 능력치 재계산 ──
        if is_pitcher and plr_id in pitching_records:
            new_ablts = calc_pitcher_abilities(pitching_records[plr_id])
        elif not is_pitcher and plr_id in batting_records:
            new_ablts = calc_batter_abilities(batting_records[plr_id], base_prfc)
        else:
            continue  # 해당 기록 없으면 스킵

        # PLR_ABLT UPDATE
        for ablt_cd, val in new_ablts.items():
            ablt_lines.append(
                f"INSERT INTO PLR_ABLT (PLR_ID, ABLT_CD, ABLT_VAL) "
                f"VALUES ({plr_id}, '{ablt_cd}', {val}) "
                f"ON DUPLICATE KEY UPDATE ABLT_VAL = {val};"
            )

        # PLR_ABLT_SSNT INSERT (2025 스냅샷)
        for ablt_cd, val in new_ablts.items():
            ablt_lines.append(
                f"INSERT IGNORE INTO PLR_ABLT_SSNT (PLR_ID, SSNT_YR, ABLT_CD, ABLT_VAL) "
                f"VALUES ({plr_id}, 2025, '{ablt_cd}', {val});"
            )

        # 종합 능력치
        ovrl = calc_ovrl(new_ablts, is_pitcher)
        ovrl_lines.append(
            f"UPDATE PLR SET PLR_OVRL_ABLT = {ovrl} WHERE PLR_ID = {plr_id};"
        )

        # ── 멀티포지션 생성 ──
        posn_entries = build_posn_entries(primary_posn, base_prfc)

        # 주 포지션 삭제 후 재삽입 (멀티포지션 포함)
        posn_lines.append(
            f"DELETE FROM PLR_POSN WHERE PLR_ID = {plr_id};"
        )
        for posn_cd, prfc in sorted(posn_entries.items(), key=lambda x: (x[0] != primary_posn, x[0])):
            posn_lines.append(
                f"INSERT INTO PLR_POSN (PLR_ID, POSN_CD, POSN_PRFC_ABLT) "
                f"VALUES ({plr_id}, '{posn_cd}', {prfc});"
            )

        # REPR_POSN_CD 업데이트
        repr_posn = POSN_TO_REPR.get(primary_posn, '21')
        posn_lines.append(
            f"UPDATE PLR_TM_CNTRCT SET REPR_POSN_CD = '{repr_posn}' "
            f"WHERE PLR_ID = {plr_id};"
        )

    return ablt_lines, posn_lines, ovrl_lines


# ──────────────────────────────────────────────
# 7. 메인
# ──────────────────────────────────────────────
def main():
    base = '/Users/gimhaseong/Desktop/claude-code/kbo-gm-simulator'
    bat_file = f'{base}/kbo_batting_stats_by_season_1982-2025.txt'
    pit_file = f'{base}/kbo_pitching_stats_by_season_1982-2025.txt'
    db_plr_file = '/tmp/db_players_full.txt'

    print("Loading DB players...", flush=True)
    name_to_id = load_db_players(db_plr_file)
    id_to_name = {v: k for k, v in name_to_id.items()}
    print(f"  DB players: {len(name_to_id)}")

    print("Parsing batting stats...", flush=True)
    batting_records = parse_batting_file(bat_file, name_to_id)
    print(f"  Matched batters: {len(batting_records)}")

    print("Parsing pitching stats...", flush=True)
    pitching_records = parse_pitching_file(pit_file, name_to_id)
    print(f"  Matched pitchers: {len(pitching_records)}")

    player_2025_ids = filter_players_with_2025(batting_records, pitching_records)
    print(f"  Players with 2025 data: {len(player_2025_ids)}")

    # DB 포지션 로드
    print("Loading DB positions...", flush=True)
    db_posns = {}
    with open('/tmp/db_posns.txt') as f:
        for line in f.readlines()[1:]:
            parts = line.strip().split('\t')
            if len(parts) >= 3:
                pid = int(parts[0])
                posn = parts[1].strip()
                prfc = int(parts[2].strip())
                db_posns.setdefault(pid, []).append((posn, prfc))

    print("Generating SQL files...", flush=True)

    # V21: 연도별 기록 INSERT
    v21_lines = [
        "-- =====================================================",
        "-- V21: 선수 연도별 실적 기초 데이터 (1982~2025)",
        "-- 2025년 기록 있는 선수의 전체 이력 적재",
        "-- 게임 시작 시 삭제 제외 (기초 데이터)",
        "-- =====================================================",
        "",
    ]
    v21_lines += gen_batter_ssnt_inserts(batting_records, player_2025_ids)
    v21_lines += [""]
    v21_lines += gen_pitcher_ssnt_inserts(pitching_records, player_2025_ids)

    with open(f'{base}/V21__insert_hist_stats.sql', 'w', encoding='utf-8') as f:
        f.write('\n'.join(v21_lines))
    print(f"  V21: {len(v21_lines)} lines")

    # V22: 능력치 + 포지션 업데이트
    ablt_lines, posn_lines, ovrl_lines = gen_ability_updates(
        name_to_id, batting_records, pitching_records, db_posns, player_2025_ids
    )

    v22_lines = [
        "-- =====================================================",
        "-- V22: 선수 능력치·포지션 재조정",
        "-- 최근 3~5년 기록 기반 능력치 재산정",
        "-- 멀티포지션 숙련도 추가",
        "-- =====================================================",
        "",
        "-- ── 능력치 재산정 ──",
        "",
    ]
    v22_lines += ablt_lines
    v22_lines += ["", "-- ── 종합 능력치 갱신 ──", ""]
    v22_lines += ovrl_lines
    v22_lines += ["", "-- ── 멀티포지션 숙련도 ──", ""]
    v22_lines += posn_lines

    with open(f'{base}/V22__update_abilities_posns.sql', 'w', encoding='utf-8') as f:
        f.write('\n'.join(v22_lines))
    print(f"  V22: {len(v22_lines)} lines")

    print("Done.")
    print(f"\n요약:")
    print(f"  타자 기록: {sum(len(v) for k,v in batting_records.items() if k in player_2025_ids)} 건")
    print(f"  투수 기록: {sum(len(v) for k,v in pitching_records.items() if k in player_2025_ids)} 건")
    print(f"  능력치 업데이트 대상: {len(ovrl_lines)} 선수")
    print(f"  포지션 업데이트 대상: {len([l for l in posn_lines if l.startswith('DELETE')])} 선수")


if __name__ == '__main__':
    main()
