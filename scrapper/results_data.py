from __future__ import annotations
from enum import Enum
from datetime import timedelta, date


def parse_duration(s:str) -> timedelta:
  if s == "":
    return timedelta(0)

  parts = s.split(':')
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
    print(f"Warning! Error trying to parse duration ({s}). Returning 0")
    h = 0
    m = 0
    s = 0

  return timedelta(hours=h, minutes=m, seconds=s)


class DekaType(Enum):
  FIT = 1
  TEAMS = 2
  MILE = 3
  STRONG = 4

  def get_name(type:int) -> str:
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

  def get_name(gender:int) -> str:
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
  type:int = DekaType.FIT
  deka:DekaResults = None
  categories:list[CategoryResults] = []

  def __str__(self):
    return f"DEKA results for {self.name} in {self.deka}"


class CategoryResults:
  name:str = ""
  is_teams:bool = False
  gender:int = DekaGender.MALE
  deka_type:DekaTypeResults = None
  athletes:list[AthleteResult] = []

  def __str__(self):
    return f"Category {self.name}"


class AthleteResult:
  name:str = ""
  gender:int = DekaGender.MALE
  time = timedelta
  run_times:list[timedelta] = []
  zone_times:list[timedelta] = []

  def from_json(self, gender:int, data_json_list:list):
    #print(f"parsing {data_json_list} for athlete data [is_teams = {is_teams}]")
    self.gender = gender
    self.name = data_json_list[4]
    self.time = parse_duration(data_json_list[10])

  def __str__(self):
    return f"{self.name} - {self.time}"
