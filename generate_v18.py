#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate V18__insert_plr_2025.sql from KBO stats files.
"""

import csv
import re
import math
from collections import defaultdict

# ─── File paths ───────────────────────────────────────────────────────────────
BASE = "/Users/gimhaseong/Desktop/claude-code/kbo-gm-simulator"
BAT_SEASON_FILE  = f"{BASE}/kbo_batting_stats_by_season_1982-2025.txt"
BAT_CAREER_FILE  = f"{BASE}/kbo_batting_stats_career_totals_1982-2025.txt"
PIT_SEASON_FILE  = f"{BASE}/kbo_pitching_stats_by_season_1982-2025.txt"
PIT_CAREER_FILE  = f"{BASE}/kbo_pitching_stats_career_totals_1982-2025.txt"
OUT_FILE = f"{BASE}/backend/src/main/resources/db/migration/V18__insert_plr_2025.sql"

# ─── V7 names to skip ─────────────────────────────────────────────────────────
V7_NAMES = {
    '양현종','김도영','최형우','나성범','소크라테스 브리토','이의리','황대인','박찬호','한준수','정해영',
    '원태인','구자욱','이재현','강민호','박병호','김헌곤','오승환','서준원','류지혁','김지찬',
    '임찬규','오지환','박해민','문보경','홍창기','오스틴 딘','박동원','이정용','플럿코','신민재',
    '곽빈','양석환','허경민','강승호','정수빈','박계범','김강률','로버트 가르시아','전민수','권희동',
    '고영표','강백호','황재균','천성호','배정대','로하스','엄상백','김재윤','박경수','장성우',
    '김광현','최지훈','한유섬','최정','박성한','오태곤','이재원','문승원','노경은','기예르모 에레디아',
    '안치홍','전준우','한동희','나균안','윤동희','고승민','유강남','김원중','빅터 레이예스','이인복',
    '류현진','노시환','채은성','문현빈','김인환','최재훈','박상원','문동주','브라이언 모리슨','페라자',
    '박민우','손아섭','양의지','류진욱','박건우','박성호','이재학','오영수','나성용','김형준',
    '안우진','이주형','김혜성','송성문','이원석','이지영','헤이수스','주승우','한현희','김웅빈',
}

# ─── Team mapping ─────────────────────────────────────────────────────────────
TEAM_MAP = {
    'KIA': 1, '삼성': 2, 'LG': 3, '두산': 4, 'KT': 5,
    'SSG': 6, '롯데': 7, '한화': 8, 'NC': 9, '키움': 10,
}

# ─── Handedness mapping ───────────────────────────────────────────────────────
HAND_MAP = {
    '우투우타': 'RR', '우투좌타': 'RL', '우투양타': 'RS',
    '좌투좌타': 'LL', '좌투우타': 'LR', '좌투양타': 'LS',
    '우언우타': 'RR', '우언좌타': 'RL',  # 우언 = right-handed pitcher
    '좌언좌타': 'LL', '좌언우타': 'LR',
}

# ─── Helper functions ─────────────────────────────────────────────────────────
def fval(s):
    """Parse float, return 0.0 if empty or non-numeric."""
    if s is None:
        return 0.0
    s = str(s).strip()
    if s == '' or s == '-' or s.lower() == 'nan':
        return 0.0
    try:
        return float(s)
    except:
        return 0.0

def ival(s):
    return int(fval(s))

def clamp(v, lo, hi):
    return max(lo, min(hi, v))

def parse_ip(s):
    """Parse innings pitched: '93.1' → 93.333, '93.2' → 93.667"""
    s = str(s).strip()
    if not s or s == '-':
        return 0.0
    try:
        f = float(s)
        whole = int(f)
        frac = round(f - whole, 3)
        if abs(frac - 0.1) < 0.01:
            return whole + 1/3
        elif abs(frac - 0.2) < 0.01:
            return whole + 2/3
        else:
            return f
    except:
        return 0.0

def extract_school(school_str):
    """Extract the last school (high school) from school chain."""
    if not school_str or school_str.strip() == '':
        return None
    parts = [p.strip() for p in school_str.split('-') if p.strip()]
    if not parts:
        return None
    # Find last high school (고) or last entry
    hs = None
    for p in parts:
        if '고' in p or '고교' in p:
            hs = p
    if hs:
        return hs
    return parts[-1]

def extract_draft(draft_str):
    """Return (round, order) from draft string."""
    if not draft_str or draft_str.strip() == '':
        return None, None
    s = draft_str.strip()
    if '창단 멤버' in s or '육성' in s:
        return None, None
    # e.g. "08 KIA 2차 6라운드 43순위"
    rnd_m = re.search(r'(\d+)라운드', s)
    ord_m = re.search(r'(\d+)순위', s)
    rnd = int(rnd_m.group(1)) if rnd_m else None
    ord_ = int(ord_m.group(1)) if ord_m else None
    return rnd, ord_

def birthdate_to_year(bdate):
    """Extract birth year from '1988년 07월 22일'."""
    m = re.search(r'(\d{4})년', bdate)
    if m:
        return int(m.group(1))
    return None

def age_in_2025(bdate):
    yr = birthdate_to_year(bdate)
    if yr:
        return 2025 - yr
    return 30  # default

# ─── Read batting season stats ─────────────────────────────────────────────────
def read_batting_season():
    """Returns dict: name → row dict for 2025 season."""
    rows = {}
    with open(BAT_SEASON_FILE, encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get('Year', '').strip() != '2025':
                continue
            name = row['Name'].strip()
            team = row['Team'].strip()
            if team not in TEAM_MAP:
                continue  # skip foreign teams
            pa = ival(row.get('PA', 0))
            if pa < 100:
                continue
            rows[name] = row
    return rows

def read_batting_career():
    """Returns dict: name → row dict (career totals)."""
    rows = {}
    with open(BAT_CAREER_FILE, encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row['Name'].strip()
            rows[name] = row
    return rows

def read_pitching_season():
    """Returns dict: name → row dict for 2025 season."""
    rows = {}
    with open(PIT_SEASON_FILE, encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get('Year', '').strip() != '2025':
                continue
            name = row['Name'].strip()
            team = row['Team'].strip()
            if team not in TEAM_MAP:
                continue
            ip = parse_ip(row.get('IP', '0'))
            if ip < 20:
                continue
            rows[name] = row
    return rows

def read_pitching_career():
    """Returns dict: name → row dict (career totals)."""
    rows = {}
    with open(PIT_CAREER_FILE, encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row['Name'].strip()
            rows[name] = row
    return rows

# ─── Ability calculations ─────────────────────────────────────────────────────

POSN_THR = {'C': 66, 'SS': 64, '3B': 62, 'CF': 61, '2B': 60, 'RF': 62,
            'LF': 56, '1B': 44, 'DH': 40, 'IF': 58, 'OF': 58, 'P': 40}

def calc_batter_abilities(s_row, c_row):
    """
    s_row: 2025 season row
    c_row: career totals row (may be None)
    Returns dict with CNT, PWR, RUN, STL, THR, OVRL, POT
    """
    # Season stats
    s_ab  = fval(s_row.get('AB', 0))
    s_pa  = fval(s_row.get('PA', 0))
    s_h   = fval(s_row.get('H', 0))
    s_so  = fval(s_row.get('SO', 0))
    s_hr  = fval(s_row.get('HR', 0))
    s_slg = fval(s_row.get('SLG', 0))
    s_avg = fval(s_row.get('AVG', 0))
    s_sb  = fval(s_row.get('SB', 0))
    s_cs  = fval(s_row.get('CS', 0))

    only_season = (c_row is None)

    if not only_season:
        c_ab  = fval(c_row.get('AB', 0))
        c_pa  = fval(c_row.get('PA', 0))
        c_h   = fval(c_row.get('H', 0))
        c_so  = fval(c_row.get('SO', 0))
        c_hr  = fval(c_row.get('HR', 0))
        c_slg = fval(c_row.get('SLG', 0))
        c_avg = fval(c_row.get('AVG', 0))
        c_sb  = fval(c_row.get('SB', 0))
        c_cs  = fval(c_row.get('CS', 0))
        c_war_o = fval(c_row.get('oWAR', 0))
        c_war_d = fval(c_row.get('dWAR', 0))

        # Check if career == season (only season)
        # Use SB counts as proxy
        if abs(c_ab - s_ab) < 1 and abs(c_pa - s_pa) < 1:
            only_season = True

    if only_season:
        b_avg = s_avg
        b_so_ab = (s_so / s_ab) if s_ab > 0 else 0.18
        b_slg = s_slg
        b_sb = s_sb
        b_cs = s_cs
        b_pa = s_pa
        c_war_o = fval(s_row.get('oWAR', 0))
        c_war_d = fval(s_row.get('dWAR', 0))
    else:
        b_avg = c_avg * 0.6 + s_avg * 0.4
        c_so_ab = (c_so / c_ab) if c_ab > 0 else 0.18
        s_so_ab = (s_so / s_ab) if s_ab > 0 else 0.18
        b_so_ab = c_so_ab * 0.6 + s_so_ab * 0.4
        b_slg = c_slg * 0.6 + s_slg * 0.4
        b_sb  = c_sb * 0.6 + s_sb * 0.4
        b_cs  = c_cs * 0.6 + s_cs * 0.4
        b_pa  = c_pa * 0.6 + s_pa * 0.4

    # CNT
    cnt_avg = clamp(20 + (b_avg - 0.200) / 0.160 * 60, 20, 80)
    cnt_k   = clamp(80 - (b_so_ab - 0.070) / 0.270 * 60, 20, 80)
    cnt     = int(cnt_avg * 0.65 + cnt_k * 0.35)

    # PWR
    b_iso = b_slg - b_avg
    pwr = clamp(int(20 + (b_iso - 0.040) / 0.220 * 60), 20, 80)

    # RUN & STL: use season*0.4 + career*0.6 for counting stats
    if only_season:
        bl_sb = s_sb
        bl_pa = s_pa
        bl_sb2 = s_sb
        bl_cs2 = s_cs
    else:
        bl_sb = s_sb * 0.4 + c_sb * 0.6
        bl_pa = s_pa * 0.4 + c_pa * 0.6
        bl_sb2 = s_sb * 0.4 + c_sb * 0.6
        bl_cs2 = s_cs * 0.4 + c_cs * 0.6

    b_sb_per_pa = bl_sb / bl_pa if bl_pa > 0 else 0
    run = clamp(int(30 + b_sb_per_pa * 1200), 20, 75)

    # STL
    total_sb_cs = bl_sb2 + bl_cs2
    if total_sb_cs > 0:
        sb_rate = bl_sb2 / total_sb_cs
    else:
        sb_rate = 0.65
    stl_count = clamp(int(30 + b_sb_per_pa * 1200), 20, 75)
    stl_rate  = clamp(int(20 + (sb_rate - 0.45) / 0.45 * 60), 20, 80)
    stl = int(stl_count * 0.6 + stl_rate * 0.4)

    # THR (position-based)
    pos = s_row.get('Pos.', 'DH').strip()
    thr = POSN_THR.get(pos, 50)

    # OVRL
    ovrl = clamp(int(cnt * 0.35 + pwr * 0.30 + run * 0.15 + thr * 0.10 + stl * 0.10), 20, 80)

    # POT
    age = age_in_2025(s_row.get('Birthdate', '1990년'))
    age_bonus = max(0, int((30 - age) * 0.5))
    pot = clamp(ovrl + age_bonus, ovrl, 80)

    # Salary from career WAR
    total_war = c_war_o + c_war_d

    return {
        'CNT': cnt, 'PWR': pwr, 'RUN': run, 'STL': stl, 'THR': thr,
        'OVRL': ovrl, 'POT': pot, 'WAR': total_war
    }

def calc_pitcher_abilities(s_row, c_row):
    """
    Returns dict with VEL, CTL, BRK, STM, P4S, OVRL, POT, role
    """
    s_ip  = parse_ip(s_row.get('IP', '0'))
    s_tbf = fval(s_row.get('TBF', 0))
    s_so  = fval(s_row.get('SO', 0))
    s_bb  = fval(s_row.get('BB', 0))
    s_hp  = fval(s_row.get('HP', 0))
    s_g   = fval(s_row.get('G', 0))
    s_gs  = fval(s_row.get('GS', 0))
    s_sv  = fval(s_row.get('S', 0))
    s_hd  = fval(s_row.get('HD', 0))

    only_season = (c_row is None)

    if not only_season:
        c_ip  = parse_ip(c_row.get('IP', '0'))
        c_tbf = fval(c_row.get('TBF', 0))
        c_so  = fval(c_row.get('SO', 0))
        c_bb  = fval(c_row.get('BB', 0))
        c_hp  = fval(c_row.get('HP', 0))
        c_g   = fval(c_row.get('G', 0))
        c_war = fval(c_row.get('WAR', 0))

        # Check if career == season
        if abs(c_ip - s_ip) < 0.5 and abs(c_g - s_g) < 1:
            only_season = True

    if only_season:
        b_tbf = s_tbf
        b_so  = s_so
        b_bb  = s_bb
        b_hp  = s_hp
        b_ip  = s_ip
        b_g   = s_g
        c_war = fval(s_row.get('WAR', 0))
    else:
        b_tbf = s_tbf * 0.4 + c_tbf * 0.6
        b_so  = s_so  * 0.4 + c_so  * 0.6
        b_bb  = s_bb  * 0.4 + c_bb  * 0.6
        b_hp  = s_hp  * 0.4 + c_hp  * 0.6
        b_ip  = s_ip  * 0.4 + c_ip  * 0.6
        b_g   = s_g   * 0.4 + c_g   * 0.6

    # Role determination
    if s_g > 0 and s_gs / s_g >= 0.5:
        role = 'SP'
    elif (s_sv + s_hd) > 0 and (s_gs / s_g < 0.1 if s_g > 0 else True):
        role = 'CP'
    else:
        role = 'RP'

    # VEL
    b_k_tbf = b_so / b_tbf if b_tbf > 0 else 0.15
    vel = clamp(int(20 + (b_k_tbf - 0.090) / 0.170 * 60), 22, 78)

    # CTL
    b_bbhp_tbf = (b_bb + b_hp) / b_tbf if b_tbf > 0 else 0.10
    ctl = clamp(int(80 - (b_bbhp_tbf - 0.045) / 0.175 * 60), 22, 78)

    # BRK
    brk = clamp(int(20 + (b_k_tbf - 0.090) / 0.170 * 60 - 5), 20, 75)

    # STM
    if role == 'SP':
        b_ip_per_g = b_ip / b_g if b_g > 0 else 5.0
        stm = clamp(int(20 + (b_ip_per_g - 3.0) / 4.5 * 60), 20, 75)
    else:
        stm = clamp(int(25 + (s_g - 15) / 55 * 40), 20, 65)

    # P4S
    p4s = clamp(int(vel * 0.85), 20, 80)

    # OVRL
    ovrl = clamp(int(vel * 0.30 + ctl * 0.35 + brk * 0.25 + stm * 0.10), 20, 80)

    # POT
    age = age_in_2025(s_row.get('Birthdate', '1990년'))
    age_bonus = max(0, int((30 - age) * 0.5))
    pot = clamp(ovrl + age_bonus, ovrl, 80)

    return {
        'VEL': vel, 'CTL': ctl, 'BRK': brk, 'STM': stm, 'P4S': p4s,
        'OVRL': ovrl, 'POT': pot, 'WAR': c_war, 'role': role
    }

def war_to_salary(war):
    if war < 0:   return 3000
    elif war < 2:  return 5000
    elif war < 5:  return 10000
    elif war < 10: return 20000
    elif war < 20: return 40000
    elif war < 30: return 80000
    elif war < 50: return 150000
    else:          return 300000

def pos_to_posn_cd(pos, role=None):
    pos = pos.strip()
    if pos == 'P':
        if role == 'SP':   return '10'
        elif role == 'CP': return '12'
        else:              return '11'
    mapping = {
        'C': '20', '1B': '21', '2B': '22', '3B': '23',
        'SS': '24', 'LF': '25', 'CF': '26', 'RF': '27',
        'DH': '28', 'IF': '22', 'OF': '26',
    }
    return mapping.get(pos, '28')

def posn_to_repr(posn_cd):
    p = str(posn_cd)
    if p in ('10', '11', '12'):
        return '10'
    elif p == '20':
        return '20'
    elif p in ('21', '22', '23', '24'):
        return '21'
    else:
        return '22'

def sql_str(v):
    if v is None:
        return 'NULL'
    return f"'{v}'"

def sql_num(v):
    if v is None:
        return 'NULL'
    return str(v)

# ─── Main ──────────────────────────────────────────────────────────────────────
def main():
    print("Reading stats files...")
    bat_season  = read_batting_season()
    bat_career  = read_batting_career()
    pit_season  = read_pitching_season()
    pit_career  = read_pitching_career()

    print(f"  Batting 2025 (PA>=100): {len(bat_season)} players")
    print(f"  Pitching 2025 (IP>=20): {len(pit_season)} players")

    # Exclude V7 names
    bat_names = {n for n in bat_season if n not in V7_NAMES}
    pit_names = {n for n in pit_season if n not in V7_NAMES}

    # Players in both: keep as batters if PA >= 100 (already filtered)
    dual = bat_names & pit_names
    print(f"  Dual-role (batter+pitcher): {len(dual)} → treating as batters: {sorted(dual)}")
    pit_names -= dual

    print(f"  Final batters: {len(bat_names)}, pitchers: {len(pit_names)}")

    # Build player records
    players = []

    def make_batter(name):
        s = bat_season[name]
        c = bat_career.get(name)
        ab  = calc_batter_abilities(s, c)
        team = s['Team'].strip()
        tm_id = TEAM_MAP.get(team, 0)
        pos = s.get('Pos.', 'DH').strip()
        posn_cd = pos_to_posn_cd(pos)
        repr_posn = posn_to_repr(posn_cd)

        hand_raw = s.get('Handedness', '').strip()
        hand = HAND_MAP.get(hand_raw, 'RR')
        school = extract_school(s.get('School', ''))
        draft_str = s.get('Draft', '')
        drft_rnd, drft_no = extract_draft(draft_str)
        salary = war_to_salary(ab['WAR'])
        prfc = clamp(max(40, ab['OVRL'] - 5), 20, 80)

        school_raw = s.get('School', '').strip()
        is_foreign = (school_raw == '-') and ('자유선발' in draft_str or '용병' in draft_str)

        return {
            'name': name, 'type': 'B', 'tm_id': tm_id, 'pos': pos,
            'posn_cd': posn_cd, 'repr_posn': repr_posn, 'hand': hand,
            'school': None if is_foreign else school, 'drft_rnd': drft_rnd, 'drft_no': drft_no,
            'salary': salary, 'ovrl': ab['OVRL'], 'pot': ab['POT'],
            'abilities': {'CNT': ab['CNT'], 'PWR': ab['PWR'], 'RUN': ab['RUN'],
                          'THR': ab['THR'], 'STL': ab['STL']},
            'prfc': prfc,
            'birthdate': s.get('Birthdate', ''),
            'is_foreign': is_foreign,
        }

    def make_pitcher(name):
        s = pit_season[name]
        c = pit_career.get(name)
        ab = calc_pitcher_abilities(s, c)
        team = s['Team'].strip()
        tm_id = TEAM_MAP.get(team, 0)
        role = ab['role']
        posn_cd = pos_to_posn_cd('P', role)
        repr_posn = '10'

        hand_raw = s.get('Handedness', '').strip()
        hand = HAND_MAP.get(hand_raw, 'RR')
        school = extract_school(s.get('School', ''))
        draft_str = s.get('Draft', '')
        drft_rnd, drft_no = extract_draft(draft_str)
        salary = war_to_salary(ab['WAR'])
        prfc = clamp(max(40, ab['OVRL'] - 5), 20, 80)

        school_raw = s.get('School', '').strip()
        is_foreign = (school_raw == '-') and ('자유선발' in draft_str or '용병' in draft_str)

        return {
            'name': name, 'type': 'P', 'tm_id': tm_id, 'pos': 'P',
            'posn_cd': posn_cd, 'repr_posn': repr_posn, 'hand': hand,
            'school': None if is_foreign else school, 'drft_rnd': drft_rnd, 'drft_no': drft_no,
            'salary': salary, 'ovrl': ab['OVRL'], 'pot': ab['POT'],
            'abilities': {'VEL': ab['VEL'], 'CTL': ab['CTL'], 'BRK': ab['BRK'],
                          'STM': ab['STM'], 'P4S': ab['P4S']},
            'prfc': prfc,
            'birthdate': s.get('Birthdate', ''),
            'is_foreign': is_foreign,
        }

    for name in bat_names:
        try:
            players.append(make_batter(name))
        except Exception as e:
            print(f"  [WARN] batter {name}: {e}")

    for name in pit_names:
        try:
            players.append(make_pitcher(name))
        except Exception as e:
            print(f"  [WARN] pitcher {name}: {e}")

    # Sort: team_id ASC, batters before pitchers, then name
    players.sort(key=lambda p: (p['tm_id'], 0 if p['type'] == 'B' else 1, p['name']))

    print(f"  Total players to insert: {len(players)}")

    # Assign PLR_IDs starting at 101
    for i, p in enumerate(players):
        p['plr_id'] = 101 + i

    # ─── Generate SQL ────────────────────────────────────────────────────────
    lines = []
    lines.append("-- =====================================================")
    lines.append("-- 선수 기본 데이터 V18: 2025 시즌 KBO 선수 (PLR_ID: 101~)")
    lines.append("-- 타자: PA >= 100, 투수: IP >= 20")
    lines.append("-- V7 PLR_ID 1-100 선수 제외")
    lines.append("-- =====================================================")
    lines.append("")

    # Group by team for readability
    from itertools import groupby
    team_name_map = {1:'KIA 타이거즈',2:'삼성 라이온즈',3:'LG 트윈스',4:'두산 베어스',
                     5:'KT 위즈',6:'SSG 랜더스',7:'롯데 자이언츠',8:'한화 이글스',
                     9:'NC 다이노스',10:'키움 히어로즈'}

    current_tm = None
    plr_rows = []
    plr_tm_rows = []
    plr_cntrct_rows = []
    plr_posn_rows = []
    plr_ablt_rows = []

    for p in players:
        pid = p['plr_id']
        tm  = p['tm_id']
        sal = p['salary']

        ntnlt = 'NULL' if p.get('is_foreign') else "'대한민국'"
        frgn_yn = "'1'" if p.get('is_foreign') else "'0'"
        plr_rows.append(
            f"({pid}, '{p['name']}', NULL, NULL, NULL, NULL, "
            f"{sql_str(p['school'])}, "
            f"{sql_num(p['drft_rnd'])}, {sql_num(p['drft_no'])}, "
            f"'{p['hand']}', {sal}, {ntnlt}, {frgn_yn}, 'AT', "
            f"{p['ovrl']}, {p['pot']}, {tm})"
        )
        plr_tm_rows.append(
            f"({pid}, {tm}, '2025-01-01', NULL)"
        )
        plr_cntrct_rows.append(
            f"({pid}, {tm}, '2025-01-01', {sal}, '2027-12-31', '{p['repr_posn']}')"
        )
        plr_posn_rows.append(
            f"({pid}, '{p['posn_cd']}', {p['prfc']})"
        )
        for ab_cd, ab_val in p['abilities'].items():
            plr_ablt_rows.append(
                f"({pid}, '{ab_cd}', {ab_val})"
            )

    # Write PLR inserts in chunks to keep SQL readable
    CHUNK = 50

    def write_inserts(table, cols, rows, chunk_size=CHUNK):
        col_str = ', '.join(cols)
        for i in range(0, len(rows), chunk_size):
            batch = rows[i:i+chunk_size]
            lines.append(f"INSERT INTO {table} ({col_str}) VALUES")
            for j, r in enumerate(batch):
                comma = ',' if j < len(batch) - 1 else ';'
                lines.append(f"{r}{comma}")
            lines.append("")

    # PLR
    lines.append("-- ─── PLR (선수 기본 정보) ────────────────────────────────────────────────────")
    write_inserts("PLR",
        ["PLR_ID","PLR_NM","PLR_ENG_NM","PLR_HGT","PLR_WGT","PLR_BRTH_LOC",
         "PLR_HS_NM","PLR_DRFT_RND","PLR_DRFT_NO","PLR_BAT_PTCH_HAND_CD",
         "PLR_ANSL_SAL","PLR_NTNLT","PLR_FRGN_YN","PLR_STTS_CD",
         "PLR_OVRL_ABLT","PLR_POT_ABLT","TM_ID"],
        plr_rows)

    # PLR_TM
    lines.append("-- ─── PLR_TM (선수-팀 소속) ──────────────────────────────────────────────────")
    write_inserts("PLR_TM",
        ["PLR_ID","TM_ID","TM_BGNG_DT","TM_END_DT"],
        plr_tm_rows)

    # PLR_TM_CNTRCT
    lines.append("-- ─── PLR_TM_CNTRCT (계약 정보) ─────────────────────────────────────────────")
    write_inserts("PLR_TM_CNTRCT",
        ["PLR_ID","TM_ID","FA_CNTRCT_BGNG_DT","FA_AMT","FA_CNTRCT_END_DT","REPR_POSN_CD"],
        plr_cntrct_rows)

    # PLR_POSN
    lines.append("-- ─── PLR_POSN (포지션 숙련도) ───────────────────────────────────────────────")
    write_inserts("PLR_POSN",
        ["PLR_ID","POSN_CD","POSN_PRFC_ABLT"],
        plr_posn_rows)

    # PLR_ABLT
    lines.append("-- ─── PLR_ABLT (능력치) ──────────────────────────────────────────────────────")
    write_inserts("PLR_ABLT",
        ["PLR_ID","ABLT_CD","ABLT_VAL"],
        plr_ablt_rows, chunk_size=100)

    output = '\n'.join(lines)
    with open(OUT_FILE, 'w', encoding='utf-8') as f:
        f.write(output)
    print(f"\nWritten to: {OUT_FILE}")
    print(f"Players: {len(players)}, PLR_IDs: 101 - {100+len(players)}")
    print(f"PLR rows: {len(plr_rows)}, PLR_ABLT rows: {len(plr_ablt_rows)}")

if __name__ == '__main__':
    main()
