import logging
from django.core.paginator import Paginator
from django.db.models import Q
from django.http import JsonResponse

from events.models import AthleteResult


def athlete_results(request):
  athlete_name = request.GET.get("athlete_name", "").strip()
  event_name = request.GET.get("event_name", "").strip()
  deka_type = request.GET.get("deka_type", "").strip()
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
  logger.info(f"Filtering athlete results with parameters: athlete_name={athlete_name}, event_name={event_name}, deka_type={deka_type}, category={category}, gender={gender}, age_group={age_group}, page_size={page_size}")

  queryset = AthleteResult.objects.select_related("event")

  filters = Q()
  if athlete_name:
    filters &= Q(athlete_name__icontains=athlete_name)
  if event_name:
    filters &= Q(event__name__icontains=event_name)
  if deka_type:
    filters &= Q(deka_type__iexact=deka_type)
  if category:
    filters &= Q(category__icontains=category)
  if gender:
    filters &= Q(gender__iexact=gender)
  if age_group:
    filters &= Q(age_group__icontains=age_group)

  queryset = queryset.filter(filters)

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
      "deka_type": item.deka_type,
      "category": item.category,
      "gender": item.gender,
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
