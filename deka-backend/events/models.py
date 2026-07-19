from django.db import models


class DekaEvent(models.Model):
  name = models.CharField(max_length=255, unique=True)

  class Meta:
    verbose_name = "Event"
    verbose_name_plural = "Events"

  def __str__(self) -> str:
    return self.name


class AthleteResult(models.Model):
  event = models.ForeignKey(DekaEvent, related_name="results", on_delete=models.CASCADE)
  athlete_name = models.CharField(max_length=255)

  gender = models.CharField(max_length=32, blank=True, null=True)
  deka_type = models.CharField(max_length=32, blank=True)
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
    ordering = ["event", "deka_type", "gender", "category", "age_group", "athlete_name"]
    constraints = [
      models.UniqueConstraint(
        fields=["event", "athlete_name", "deka_type", "category"],
        name="unique_result_per_athlete_per_event",
      )
    ]

  def __str__(self) -> str:
    return f"{self.athlete_name} ({self.event.name})"
