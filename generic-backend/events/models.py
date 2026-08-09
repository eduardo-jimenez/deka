from django.db import models


class RaceInfo(models.Model):
  name = models.CharField(max_length=255, unique=True)
  url = models.CharField(max_length=255, blank=True)
  zone_1 = models.CharField(max_length=64, blank=True)
  zone_2 = models.CharField(max_length=64, blank=True)
  zone_3 = models.CharField(max_length=64, blank=True)
  zone_4 = models.CharField(max_length=64, blank=True)
  zone_5 = models.CharField(max_length=64, blank=True)
  zone_6 = models.CharField(max_length=64, blank=True)
  zone_7 = models.CharField(max_length=64, blank=True)
  zone_8 = models.CharField(max_length=64, blank=True)
  zone_9 = models.CharField(max_length=64, blank=True)
  zone_10 = models.CharField(max_length=64, blank=True)

  class Meta:
    verbose_name = "RaceInfo"
    verbose_name_plural = "RaceInfos"

  def __str__(self) -> str:
    return self.name
  

class EventInfo(models.Model):
  race = models.ForeignKey(RaceInfo, related_name="events", on_delete=models.CASCADE)
  name = models.CharField(max_length=255, unique=True)
  city = models.CharField(max_length=64, blank=True)
  start_date = models.DateField(blank=True, null=True)
  end_date = models.DateField(blank=True, null=True)

  class Meta:
    verbose_name = "EventInfo"
    verbose_name_plural = "EventInfos"

  def __str__(self) -> str:
    return self.name


class AthleteResult(models.Model):
  event = models.ForeignKey(EventInfo, related_name="results", on_delete=models.CASCADE)
  athlete_name = models.CharField(max_length=255)

  gender = models.CharField(max_length=32, blank=True, null=True)
  category = models.CharField(max_length=64, blank=True)
  age_group = models.CharField(max_length=64, blank=True, null=True)

  total_time = models.DurationField(blank=True, null=True)

  run_1 = models.DurationField(blank=True, null=True)
  run_2 = models.DurationField(blank=True, null=True)
  run_3 = models.DurationField(blank=True, null=True)
  run_4 = models.DurationField(blank=True, null=True)
  run_5 = models.DurationField(blank=True, null=True)
  run_6 = models.DurationField(blank=True, null=True)
  run_7 = models.DurationField(blank=True, null=True)
  run_8 = models.DurationField(blank=True, null=True)
  run_9 = models.DurationField(blank=True, null=True)
  run_10 = models.DurationField(blank=True, null=True)
  zone_1 = models.DurationField(blank=True, null=True)
  zone_2 = models.DurationField(blank=True, null=True)
  zone_3 = models.DurationField(blank=True, null=True)
  zone_4 = models.DurationField(blank=True, null=True)
  zone_5 = models.DurationField(blank=True, null=True)
  zone_6 = models.DurationField(blank=True, null=True)
  zone_7 = models.DurationField(blank=True, null=True)
  zone_8 = models.DurationField(blank=True, null=True)
  zone_9 = models.DurationField(blank=True, null=True)
  zone_10 = models.DurationField(blank=True, null=True)

  class Meta:
    verbose_name = "Result"
    verbose_name_plural = "Results"
    ordering = ["event", "gender", "category", "age_group", "total_time", "athlete_name"]
    constraints = [
      models.UniqueConstraint(
        fields=["event", "athlete_name", "category"],
        name="unique_result_per_athlete_per_event",
      )
    ]

  def __str__(self) -> str:
    return f"{self.athlete_name} ({self.event.name})"

