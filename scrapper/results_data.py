from __future__ import annotations
#from typing import Optional
from datetime import timedelta


def parse_duration(s:str) -> timedelta:
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
    raise ValueError(f"Unexpected duration format: {s}")

  return timedelta(hours=h, minutes=m, seconds=s)


class DekaResults:
  name:str = ""
  types:list[DekaTypeResults] = []

  def __str__(self):
    return f"DEKA results for {self.name}"
  
  
class DekaTypeResults:
  name:str = ""
  deka:DekaResults = None
  categories:list[CategoryResults] = []

  def __str__(self):
    return f"DEKA results for {self.name} in {self.deka}"


class CategoryResults:
  name:str = ""
  is_teams:bool = False
  deka_type:DekaTypeResults = None
  athletes:list[AthleteResult] = []

  def __str__(self):
    return f"Category {self.name}"


class AthleteResult:
  name:str = ""
  category:str = ""
  time = timedelta


  def from_json(self, is_teams:bool, data_json_list:list):
    #print(f"parsing {data_json_list} for athlete data [is_teams = {is_teams}]")
    self.name = data_json_list[4]
    self.time = parse_duration(data_json_list[10])

  def __str__(self):
    return f"{self.name} - {self.time}"
