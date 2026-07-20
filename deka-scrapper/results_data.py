from __future__ import annotations
from enum import Enum
from datetime import timedelta, date
from typing import Optional


def parse_duration(durationStr:str) -> timedelta:
  if durationStr == "" or durationStr == "--":
    return timedelta(0)

  parts = durationStr.split(':')
  parts = [p.strip() for p in parts]
  
  if len(parts) == 2:
    h = 0
    m = int(parts[0])
    s = float(parts[1])
  elif len(parts) == 3:
    h = int(parts[0])
    m = int(parts[1])
    s = float(parts[2])
  else:
    print(f"Warning! Error trying to parse duration ({durationStr}). Returning 0")
    h = 0
    m = 0
    s = 0

  return timedelta(hours=h, minutes=m, seconds=s)


class DekaType(Enum):
  FIT = 1
  TEAMS = 2
  MILE = 3
  STRONG = 4

  def get_name(type:DekaType) -> str:
    match type:
      case DekaType.FIT:
        return "DEKA Fit"
      case DekaType.TEAMS:
        return "DEKA Fit Teams"
      case DekaType.MILE:
        return "DEKA Mile"
      case DekaType.STRONG:
        return "DEKA Strong"


class DekaGender(Enum):
  MALE = 1
  FEMALE = 2
  MIXED = 3

  def get_name(gender:DekaGender) -> str:
    match gender:
      case DekaGender.MALE:
        return "Male"
      case DekaGender.FEMALE:
        return "Female"
      case DekaGender.MIXED:
        return "Mixed"


class DekaResults:
  name:str = ""
  city:str = ""
  date:date = date(2000, 1, 1)
  types:list[DekaTypeResults] = []

  def __str__(self):
    return f"{self.name} ({date})"
  
  def get_event_name(self):
    return f"{self.name} {date.year}"
  
  
class DekaTypeResults:
  name:str = ""
  type:DekaType = DekaType.FIT
  deka:Optional[DekaResults] = None
  categories:list[CategoryResults] = []

  def __str__(self):
    return f"DEKA results for {self.name} in {self.deka}"


class CategoryResults:
  name:str = ""
  is_teams:bool = False
  gender:DekaGender = DekaGender.MALE
  deka_type:Optional[DekaTypeResults] = None
  athletes:list[AthleteResult] = []

  def __str__(self):
    return f"Category {self.name}"


class AthleteResult:
  name:str = ""
  gender:DekaGender = DekaGender.MALE
  category:CategoryResults
  time = timedelta
  run_times:list[timedelta] = []
  zone_times:list[timedelta] = []
  penalty:timedelta

  def from_json(self, gender:DekaGender, data_list:list, data_fields:list):
    #print(f"parsing {data_json_list} for athlete data [is_teams = {is_teams}]")
    self.gender = gender

    name_index = next((i for i, s in enumerate(data_fields) if "displayname" in s.lower()), -1)
    if name_index >= 0 and name_index < len(data_list):
      self.name = data_list[name_index]
    
    final_time_index = next((i for i, s in enumerate(data_fields) if "finaltime" in s.lower()), -1)
    if final_time_index >= 0 and final_time_index < len(data_list):
      self.time = parse_duration(data_list[final_time_index])

  def __str__(self):
    return f"{self.name} - {self.time}"
