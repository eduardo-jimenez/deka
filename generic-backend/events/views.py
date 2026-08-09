import logging
import json
from django.core.paginator import Paginator
from django.db.models import F, Q
from django.http import JsonResponse

from events.models import AthleteResult, EventInfo, RaceInfo
from events.analysis import AthleteAnalyzer


def races_available(request):
  logger = logging.getLogger(__name__)
  logger.info("Returning available events")

  races = RaceInfo.objects.order_by("name").values(
    "name", "url"
  )

  return JsonResponse({
    "count": races.count(),
    "results": list(races),
  })


def events_available(request):
  race_name = request.GET.get("race_name", "").strip()

  logger = logging.getLogger(__name__)
  logger.info(f"Returning available events for race {race_name}")

  events = EventInfo.objects.filter(race__name=race_name).order_by("start_date", "name").values(
    "id", "name", "city", "start_date", "end_date", "race__name"
  )

  return JsonResponse({
    "count": events.count(),
    "results": list(events),
  })


def athlete_results(request):
  race_name = request.GET.get("race_name", "").strip()
  if race_name is None or race_name == "":
    raise ValueError("race_name parameter is required")

  athlete_name = request.GET.get("athlete_name", "").strip()
  event_name = request.GET.get("event_name", "").strip()
  category = request.GET.get("category", "").strip()
  gender = request.GET.get("gender", "").strip()
  age_group = request.GET.get("age_group", "").strip()
  page_size = request.GET.get("page_size", "50")

  try:
    page_size = int(page_size)
  except ValueError:
    page_size = 50

  page_size = max(1, min(page_size, 100))

  logger = logging.getLogger(__name__)
  logger.info(f"Filtering athlete results with parameters: athlete_name={athlete_name}, event_name={event_name}, category={category}, gender={gender}, age_group={age_group}, page_size={page_size}")

  queryset = AthleteResult.objects.select_related("event")

  filters = Q()
  if race_name:
    filters &= Q(event__race__name__iexact=race_name)
  if athlete_name:
    filters &= Q(athlete_name__icontains=athlete_name)
  if event_name:
    filters &= Q(event__name__icontains=event_name)
  if category:
    filters &= Q(category__icontains=category)
  if gender:
    filters &= Q(gender__icontains=gender)
  if age_group:
    filters &= Q(age_group__icontains=age_group)

  queryset = queryset.filter(filters).order_by(F("total_time").asc(nulls_last=True))

  paginator = Paginator(queryset, page_size)
  page_number = request.GET.get("page", "1")
  try:
    page_number = int(page_number)
  except ValueError:
    page_number = 1

  page_obj = paginator.get_page(page_number)

  logger.info(f"Returning page {page_obj.number} of {paginator.num_pages} with {len(page_obj.object_list)} results out of {paginator.count} total results.")

  results = []
  for item in page_obj.object_list:
    results.append({
      "id": item.id,
      "athlete_name": item.athlete_name,
      "event_name": item.event.name,
      "gender": item.gender,
      "category": item.category,
      "age_group": item.age_group,
      "total_time": str(item.total_time) if item.total_time else None,
      "run_1": str(item.run_1) if item.run_1 else None,
      "run_2": str(item.run_2) if item.run_2 else None,
      "run_3": str(item.run_3) if item.run_3 else None,
      "run_4": str(item.run_4) if item.run_4 else None,
      "run_5": str(item.run_5) if item.run_5 else None,
      "run_6": str(item.run_6) if item.run_6 else None,
      "run_7": str(item.run_7) if item.run_7 else None,
      "run_8": str(item.run_8) if item.run_8 else None,
      "run_9": str(item.run_9) if item.run_9 else None,
      "run_10": str(item.run_10) if item.run_10 else None,
      "zone_1": str(item.zone_1) if item.zone_1 else None,
      "zone_2": str(item.zone_2) if item.zone_2 else None,
      "zone_3": str(item.zone_3) if item.zone_3 else None,
      "zone_4": str(item.zone_4) if item.zone_4 else None,
      "zone_5": str(item.zone_5) if item.zone_5 else None,
      "zone_6": str(item.zone_6) if item.zone_6 else None,
      "zone_7": str(item.zone_7) if item.zone_7 else None,
      "zone_8": str(item.zone_8) if item.zone_8 else None,
      "zone_9": str(item.zone_9) if item.zone_9 else None,
      "zone_10": str(item.zone_10) if item.zone_10 else None,
    })
    logger.debug(f"Processing athlete result: {item.athlete_name}")


  return JsonResponse({
    "count": paginator.count,
    "page": page_obj.number,
    "page_size": page_size,
    "pages": paginator.num_pages,
    "results": results,
  })


def analyze_performance(request):
  athlete_id = request.GET.get("athlete_id", "").strip()
  race_name = request.GET.get("race_name", "").strip()
  event_name = request.GET.get("event_name", "").strip()
  gender = request.GET.get("gender", "").strip()

  logger = logging.getLogger(__name__)
  logger.info(f"Analyzing athlete with id {athlete_id}. Race = {race_name}. Event = {event_name}. Gender = {gender}")

  # First acquire the athlete info
  athlete_queryset = AthleteResult.objects.select_related("event")
  try:
    athlete = athlete_queryset.get(pk=athlete_id)
  except AthleteResult.DoesNotExist:
    return JsonResponse({"error": "Athlete not found"}, status=404)
  except AthleteResult.MultipleObjectsReturned:
    return JsonResponse({"error": "Multiple athletes found"}, status=400)

  # now let's try to get all athletes to analyze it against
  queryset = AthleteResult.objects.select_related("event")
  race = athlete.event.race
  filters = Q()
  filters &= Q(event__race=race)
  if race_name:
    filters &= Q(event__race__name__iexact=race_name)
  if event_name:
    filters &= Q(event__name__icontains=event_name)
  if gender:
    filters &= Q(gender__icontains=gender)
  athletes = queryset.filter(filters)

  # gather the total of athletes to compare with
  total_count = athletes.count()
  if (total_count == 0):
    return JsonResponse({"error": "No athletes found for the given parameters"}, status=404)

  # analyze the data
  analyzer = AthleteAnalyzer(athlete, athletes)
  analyzer.analyze()

  # generate the arrays of percetiles for run legs and zones
  run_time_percs = []
  zone_time_percs = []
  for i in range(10):
    # run_time_percs += f"{analyzer.get_run_time_percentile(i):.3f}"
    # zone_time_percs += f"{analyzer.get_zone_time_percentile(i):.3f}"
    run_time_percs.append(analyzer.get_run_time_percentile(i))
    zone_time_percs.append(analyzer.get_zone_time_percentile(i))

  return JsonResponse({
    "data": {
      "athlete_id": str(athlete.pk),
      "total_count": total_count,
      "total_time_perc": analyzer.get_total_time_percentile(),
      "total_run_time_perc": analyzer.get_total_run_time_percentile(),
      "total_zone_time_perc": analyzer.get_total_zone_time_percentile(),
      "run_time_percs": run_time_percs,
      "zone_time_percs": zone_time_percs,
      "total_time_buckets": analyzer.total_time_buckets,
      "total_run_time_buckets": analyzer.total_run_time_buckets,
      "total_zone_time_buckets": analyzer.total_zones_time_buckets,
      "run_time_buckets": analyzer.run_time_buckets,
      "zone_time_buckets": analyzer.zone_time_buckets,
      "num_better_total_times": analyzer.num_better_total_times,
      "num_better_total_run_times": analyzer.num_better_total_run_times,
      "num_better_total_zone_times": analyzer.num_better_total_zone_times,
      "num_better_run_times": analyzer.num_better_run_times,
      "num_better_zone_times": analyzer.num_better_zone_times,
      "race_progression": analyzer.race_progression,
    },
  })

