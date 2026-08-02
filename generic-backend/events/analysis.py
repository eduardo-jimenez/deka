import math
from events.models import AthleteResult


MIN_RUN_TIME:float = 60.0
MAX_RUN_TIME:float = 300.0
MIN_ZONE_TIME:float = 25.0
MAX_ZONE_TIME:float = 300.0
PARTIAL_TIME_STEP:float = 5.0

MIN_TOTAL_TIME_RUNS:float = 840.0
MAX_TOTAL_TIME_RUNS:float = 2400.0
MIN_TOTAL_TIME_ZONES:float = 600.0
MAX_TOTAL_TIME_ZONES:float = 1800.0
TOTAL_RUN_ZONE_TIME_STEP:float = 30.0
MIN_TOTAL_TIME:float = 1500
MAX_TOTAL_TIME:float = 4200
TOTAL_TIME_STEP:float = 60.0

NUM_RUN_DIVS:int = int((MAX_RUN_TIME - MIN_RUN_TIME) / PARTIAL_TIME_STEP)
NUM_ZONE_DIVS:int = int((MAX_ZONE_TIME - MIN_ZONE_TIME) / PARTIAL_TIME_STEP)
NUM_TOTAL_RUN_TIME_DIVS:int = int((MAX_TOTAL_TIME_RUNS - MIN_TOTAL_TIME_RUNS) / TOTAL_RUN_ZONE_TIME_STEP)
NUM_TOTAL_ZONES_TIME_DIVS:int = int((MAX_TOTAL_TIME_ZONES - MIN_TOTAL_TIME_ZONES) / TOTAL_RUN_ZONE_TIME_STEP)
NUM_TOTAL_TIME_DIVS:int = int((MAX_TOTAL_TIME - MIN_TOTAL_TIME) / TOTAL_TIME_STEP)


def get_run_div_min_max_time(index: int) -> tuple[float, float]:
  minTime = MIN_RUN_TIME + index * PARTIAL_TIME_STEP
  maxTime = minTime + PARTIAL_TIME_STEP

  return (minTime, maxTime)

def get_zone_div_min_max_time(index: int) -> tuple[float, float]:
  minTime = MIN_ZONE_TIME + index * PARTIAL_TIME_STEP
  maxTime = minTime + PARTIAL_TIME_STEP

  return (minTime, maxTime)

def get_total_run_time_div_min_max_time(index: int) -> tuple[float, float]:
  minTime = MIN_TOTAL_TIME_RUNS + index * TOTAL_RUN_ZONE_TIME_STEP
  maxTime = minTime + TOTAL_RUN_ZONE_TIME_STEP

  return (minTime, maxTime)

def get_total_zones_time_div_min_max_time(index: int) -> tuple[float, float]:
  minTime = MIN_TOTAL_TIME_ZONES + index * TOTAL_RUN_ZONE_TIME_STEP
  maxTime = minTime + TOTAL_RUN_ZONE_TIME_STEP

  return (minTime, maxTime)

def get_total_time_div_min_max_time(index: int) -> tuple[float, float]:
  minTime = MIN_TOTAL_TIME + index * TOTAL_TIME_STEP
  maxTime = minTime + TOTAL_TIME_STEP

  return (minTime, maxTime)


def get_run_div_index(time: float) -> int:
  if time < MIN_RUN_TIME or time >= MAX_RUN_TIME:
    return -1
  
  index = int((time - MIN_RUN_TIME) / PARTIAL_TIME_STEP)

  return index

def get_zone_div_index(time: float) -> int:
  if time < MIN_ZONE_TIME or time >= MAX_ZONE_TIME:
    return -1
  
  index = int((time - MIN_ZONE_TIME) / PARTIAL_TIME_STEP)

  return index

def get_total_run_time_div_index(time: float) -> int:
  if time < MIN_TOTAL_TIME_RUNS or time >= MAX_TOTAL_TIME_RUNS:
    return -1
  
  index = int((time - MIN_TOTAL_TIME_RUNS) / TOTAL_RUN_ZONE_TIME_STEP)

  return index

def get_total_zones_time_div_index(time: float) -> int:
  if time < MIN_TOTAL_TIME_ZONES or time >= MAX_TOTAL_TIME_ZONES:
    return -1
  
  index = int((time - MIN_TOTAL_TIME_ZONES) / TOTAL_RUN_ZONE_TIME_STEP)

  return index

def get_total_time_div_index(time: float) -> int:
  if time < MIN_TOTAL_TIME or time >= MAX_TOTAL_TIME:
    return -1
  
  index = int((time - MIN_TOTAL_TIME) / TOTAL_TIME_STEP)

  return index


class AthleteTimes:
  def __init__(self, athlete: AthleteResult):
    self.athlete = athlete
    self.total_time:float = athlete.total_time.total_seconds() if athlete.total_time else -1.0
    self.run_times:list[float] = [
      athlete.run_1.total_seconds() if athlete.run_1 else MAX_RUN_TIME,
      athlete.run_2.total_seconds() if athlete.run_2 else MAX_RUN_TIME,
      athlete.run_3.total_seconds() if athlete.run_3 else MAX_RUN_TIME,
      athlete.run_4.total_seconds() if athlete.run_4 else MAX_RUN_TIME,
      athlete.run_5.total_seconds() if athlete.run_5 else MAX_RUN_TIME,
      athlete.run_6.total_seconds() if athlete.run_6 else MAX_RUN_TIME,
      athlete.run_7.total_seconds() if athlete.run_7 else MAX_RUN_TIME,
      athlete.run_8.total_seconds() if athlete.run_8 else MAX_RUN_TIME,
      athlete.run_9.total_seconds() if athlete.run_9 else MAX_RUN_TIME,
      athlete.run_10.total_seconds() if athlete.run_10 else MAX_RUN_TIME,
    ]
    self.zone_times:list[float] = [
      athlete.zone_1.total_seconds() if athlete.zone_1 else MAX_ZONE_TIME,
      athlete.zone_2.total_seconds() if athlete.zone_2 else MAX_ZONE_TIME,
      athlete.zone_3.total_seconds() if athlete.zone_3 else MAX_ZONE_TIME,
      athlete.zone_4.total_seconds() if athlete.zone_4 else MAX_ZONE_TIME,
      athlete.zone_5.total_seconds() if athlete.zone_5 else MAX_ZONE_TIME,
      athlete.zone_6.total_seconds() if athlete.zone_6 else MAX_ZONE_TIME,
      athlete.zone_7.total_seconds() if athlete.zone_7 else MAX_ZONE_TIME,
      athlete.zone_8.total_seconds() if athlete.zone_8 else MAX_ZONE_TIME,
      athlete.zone_9.total_seconds() if athlete.zone_9 else MAX_ZONE_TIME,
      athlete.zone_10.total_seconds() if athlete.zone_10 else MAX_ZONE_TIME,
    ]
    self.total_run_time:float = sum(self.run_times)
    self.total_zone_time:float = sum(self.zone_times)
    self.times_after_station:list[float] = []
    prevTime = 0.0
    for i in range(20):
      index:int = int(i / 2)
      if i % 2 == 0:
        stationTime = self.run_times[index]
      else:
        stationTime = self.zone_times[index]
      newTime:float = prevTime + stationTime
      self.times_after_station.append(newTime)
      prevTime = newTime



class AthleteAnalyzer:
  def __init__(self, athlete: AthleteResult, comparison_athletes):
    self.athlete = athlete
    self.comparison_athletes = comparison_athletes

    self.total_time_buckets: list[int] = [0] * NUM_TOTAL_TIME_DIVS
    self.total_run_time_buckets: list[int] = [0] * NUM_TOTAL_RUN_TIME_DIVS
    self.total_zones_time_buckets: list[int] = [0] * NUM_TOTAL_ZONES_TIME_DIVS
    self.run_time_buckets: list[list[int]] = [
        [0] * NUM_RUN_DIVS for _ in range(10)
    ]
    self.zone_time_buckets: list[list[int]] = [
        [0] * NUM_ZONE_DIVS for _ in range(10)
    ]

    self.num_better_total_times:int = 0
    self.num_better_total_run_times:int = 0
    self.num_better_total_zone_times:int = 0
    self.num_better_run_times:list[int] = [0] * 10
    self.num_better_zone_times:list[int] = [0] * 10
    self.race_progression:list[int] = [0] * 20


  def analyze(self):
    # get the athlete info
    athleteTimes: AthleteTimes = AthleteTimes(self.athlete)

    # iterate over all athletes
    for a in self.comparison_athletes:
      # get the times for this athlete
      aTimes: AthleteTimes = AthleteTimes(a)

      # update the buckets
      index = get_total_time_div_index(aTimes.total_time)
      if index >= 0:
        self.total_time_buckets[index] += 1
      index = get_total_run_time_div_index(aTimes.total_run_time)
      if index >= 0:
        self.total_run_time_buckets[index] += 1
      index = get_total_zones_time_div_index(aTimes.total_zone_time)
      if index >= 0:
        self.total_zones_time_buckets[index] += 1
      for i in range(10):
        index = get_run_div_index(aTimes.run_times[i])
        if index >= 0:
          self.run_time_buckets[i][index] += 1
        index = get_zone_div_index(aTimes.zone_times[i])
        if index >= 0:
          self.zone_time_buckets[i][index] += 1

      # if the a is not athlete, update the num_better... where appropriate
      if self.athlete.pk == a.pk:
        continue

      if aTimes.total_time < athleteTimes.total_time:
        self.num_better_total_times += 1
      if aTimes.total_run_time < athleteTimes.total_run_time:
        self.num_better_total_run_times += 1
      if aTimes.total_zone_time < athleteTimes.total_zone_time:
        self.num_better_total_zone_times += 1
      for i in range(10):
        if aTimes.run_times[i] < athleteTimes.run_times[i]:
          self.num_better_run_times[i] += 1
        if aTimes.zone_times[i] < athleteTimes.zone_times[i]:
          self.num_better_zone_times[i] += 1

      # update the race progression
      for i in range(20):
        if aTimes.times_after_station[i] < athleteTimes.times_after_station[i]:
          self.race_progression[i] += 1


  def round_percentile(self, percentile: float):
    return round(percentile * 1000) / 10

  def get_total_time_percentile(self):
    percentile = self.num_better_total_times / len(self.comparison_athletes)
    percentile = self.round_percentile(percentile)
    return percentile

  def get_total_run_time_percentile(self):
    percentile = self.num_better_total_run_times / len(self.comparison_athletes)
    percentile = self.round_percentile(percentile)
    return percentile

  def get_total_zone_time_percentile(self):
    percentile = self.num_better_total_zone_times / len(self.comparison_athletes)
    percentile = self.round_percentile(percentile)
    return percentile

  def get_run_time_percentile(self, index:int):
    percentile = self.num_better_run_times[index] / len(self.comparison_athletes)
    percentile = self.round_percentile(percentile)
    return percentile

  def get_zone_time_percentile(self, index:int):
    percentile = self.num_better_zone_times[index] / len(self.comparison_athletes)
    percentile = self.round_percentile(percentile)
    return percentile