import re
import requests
import urllib.parse
from datetime import timedelta, date
from config import HEADERS
from results_data import DekaResults, DekaTypeResults, CategoryResults, AthleteResult, parse_duration, DekaGender, DekaType
from urllib.parse import quote


def scrape_deka_event(event, event_date:date) -> DekaResults:
  print(f"Scraping DEKA results from [{event["name"]}]")

  """Get the general info with the different DEKA types we have results for (DEKA Fit, DEKA Fit Teams, DEKA Mile,...)"""
  eventId = event["id"]
  general_url = f"https://my.raceresult.com/{eventId}/RRPublish/data/config?lang=en&page=results&noVisitor=1&v=1"
  print(f"General URL = {general_url}")
  response = requests.get(general_url, headers=HEADERS, timeout=15)
  response.raise_for_status()

  generalData = response.json()
  #print(generalData)

  # find out the config
  config_url = f"https://my.raceresult.com/{eventId}/results/config?lang=en&noVisitor=1&oldFavs=&sanitize=true"
  print(f"Config URL = {config_url}")
  config_response = requests.get(config_url, headers=HEADERS, timeout=15)
  config_lists = []
  valid_contests = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  if (config_response.ok):
    config_response_json = config_response.json()
    config_contests = config_response_json["contests"].keys()
    if not config_contests is None:
      valid_contests = config_contests
    config_lists = config_response_json["TabConfig"]["Lists"]

  key = generalData["key"]
  server = generalData["server"]
  lists = generalData["lists"]
  #contests = generalData["contests"]

  deka = DekaResults()
  deka.name = event["name"]
  deka.city = event["city"]
  deka.date = event_date

  deka_types:list[DekaTypeResults] = []

  for listElem in lists:
    list_name = listElem["Name"]
    show_as = listElem["ShowAs"]
    contest = listElem["Contest"]
    leader = listElem["Leader"]

    # find out the details
    config_info = {}
    for info_in_config_list in config_lists:
      if info_in_config_list["Name"] == list_name:
        config_info = info_in_config_list
        break

    details = config_info["Details"] or "details1" 
    print(f"scraping results for [{list_name} (contest = {contest}, leader = {leader}, details = {details})]")

    deka_type = DekaTypeResults()
    deka_type.name = show_as
    deka_type.deka = deka

    # analyze the name to decide what kind of DEKA type this page represents
    if "mile" in list_name.lower() or "mile" in show_as.lower():
      deka_type.type = DekaType.MILE
    elif "strong" in list_name.lower() or "strong" in show_as.lower():
      deka_type.type = DekaType.STRONG
    elif "team" in list_name.lower() or "team" in show_as.lower():
      deka_type.type = DekaType.TEAMS
    else:
      deka_type.type = DekaType.FIT

    list_name_encoded = urllib.parse.quote(list_name)
    elem_url = (
      f"https://{server}/{eventId}/RRPublish/data/list?"
      f"key={key}&listname={list_name_encoded}"
      f"&page=results&contest={contest}&r=leader&l={leader}"
    )
    print(f"Fetching results from {elem_url}")
    response = requests.get(elem_url, headers=HEADERS, timeout=15)
    response.raise_for_status()
    elem_response_json = response.json()
    elem_data = elem_response_json["data"]

    categories:list[CategoryResults] = []
    encoded_category = ""

    for category1Name in elem_data:
      #print(f"Printing data for {category1Name}")
      category1 = elem_data[category1Name]
      if (isinstance(category1, list)):
        encoded_category = urllib.parse.quote(category1Name)
        category = scrape_deka_category(event, deka_type, key, server, list_name_encoded, details, contest, category1Name, encoded_category, 1)
        categories.append(category)
      else:
        for category2Name in category1:
          #print(f"Printing data for {category2Name}")
          category2 = category1[category2Name]
          if (isinstance(category2, list)):
            encoded_category = f"{urllib.parse.quote(category1Name)}%0C{urllib.parse.quote(category2Name)}"
            category = scrape_deka_category(event, deka_type, key, server, list_name_encoded, details, contest, category2Name, encoded_category, 2)
            categories.append(category)
          else:
            for category3Name in category2:
              #print(f"Printing data for {category3Name}")
              category3 = category2[category3Name]
              if (isinstance(category3, list)):
                encoded_category = f"{urllib.parse.quote(category1Name)}%0C{urllib.parse.quote(category2Name)}%0C{urllib.parse.quote(category3Name)}"
                category = scrape_deka_category(event, deka_type, key, server, list_name_encoded, details, contest, category3Name, encoded_category, 3)
                categories.append(category)
              else:
                for category4Name in category3:
                  #print(f"Printing data for {category4Name}")
                  category4 = category3[category4Name]
                  if (isinstance(category4, list)):
                    encoded_category = f"{urllib.parse.quote(category1Name)}%0C{urllib.parse.quote(category2Name)}%0C{urllib.parse.quote(category3Name)}%0C{urllib.parse.quote(category4Name)}"
                    category = scrape_deka_category(event, deka_type, key, server, list_name_encoded, details, contest, category4Name, encoded_category, 4)
                    categories.append(category)
                    # there shouldn't be more nested categories...

    deka_type.categories = categories
    if deka_type.categories and len(deka_type.categories) > 0:
      deka_types.append(deka_type)

  deka.types = deka_types

  return deka


def scrape_deka_athlete_list_name(eventId:str, details:str, athlete_pid:int, category:CategoryResults):
  view_url = f"https://my.raceresult.com/{eventId}/{details}/view?lang=en&noVisitor=1&mid=0&standalone=false&pid={athlete_pid}"
  #print(f"Athlete View URL = {view_url}")
  view_response = requests.get(view_url, headers=HEADERS, timeout=15)
  if not (category.is_teams):
    list_name = "Online%7CDetailList"
  else:
    list_name = "Online%7CDetailList-Team"
  if view_response.ok:
    view_json = view_response.json()
    view_elements = view_json.get("Elements", [])
    if view_elements and isinstance(view_elements, list):
      first_element = view_elements[0]
      view_children = first_element.get("Children", [])
      if view_children and isinstance(view_children, list):
        first_view_children = view_children[0]
        view_config = first_view_children.get("Config", {})
        config_list_name = view_config.get("List")
        if config_list_name:
          list_name = quote(config_list_name)

  return list_name

def scrape_deka_category(event, deka_type:DekaTypeResults, key:str, server:str, list_name_encoded:str, details:str, contest:str, category_name:str, encoded_category:str, categoryDepth:int) -> CategoryResults:

  # clean the category name removing the #NN_ from the start

  category = CategoryResults()
  category.name = clean_name(category_name)
  category.is_teams = "team" in encoded_category.lower()
  category.deka_type = deka_type

  print(f"Scraping DEKA category {category.name} ({encoded_category})")
  gender = DekaGender
  if "co-ed" in encoded_category.lower():
    category.gender = DekaGender.MIXED
  elif "female" in encoded_category.lower():
    category.gender = DekaGender.FEMALE
  else:
    category.gender = DekaGender.MALE

  eventId = event["id"]
  url = (
    f"https://{server}/{eventId}/results/list?"
    f"key={key}&listname={list_name_encoded}"
    f"&page=results&contest={contest}&fav=&r=group"
    f"&name={encoded_category}"
  )
  for i in range(categoryDepth):
    url += "%0C"

  #print(f"Fetching results for category {category_name} from {url}")
  response = requests.get(url, headers=HEADERS, timeout=15)
  response.raise_for_status()
  responseJson = response.json()
  responseData = responseJson["data"]
  #print(responseData)

  num_athletes = len(responseData)
  print(f"Scraping all {num_athletes} atheletes for {category_name}...")

  category_athletes:list[AthleteResult] = []
  for athleteData in responseData:
    if len(athleteData) > 8:
      athlete = AthleteResult()
      athlete.category = category
      athlete.gender = category.gender
      athlete.from_json(category.gender, athleteData)
      athlete_pid = athleteData[1]

      list_name = scrape_deka_athlete_list_name(eventId, details, athlete_pid, category)

      url_start = f"https://{server}/{eventId}/{details}/list?key={key}&listname={list_name}"

      athlete = scrape_athlete_result(athlete, url_start, key, contest, athlete_pid, details)
      #print(athlete)
      category_athletes.append(athlete)

  category.athletes = category_athletes
  print(f"Finished scraping category {category.name} with {len(category_athletes)} athlete results")

  return category



def scrape_athlete_result(athlete: AthleteResult, url_start:str, key:str, contest:str, pid: str, details:str) -> AthleteResult:

  url = f"{url_start}&page={details}&r=pid&pid={pid}&contest={contest}"

  try:
    response = requests.get(url, headers=HEADERS, timeout=15)
    response.raise_for_status()
    responseJson = response.json()
    raw_data = responseJson["data"][0]
    raw_data_fields = responseJson["DataFields"]
    #print(raw_data)
    #print(f"raw_data_fields: {len(raw_data_fields)}. raw_data = {len(raw_data)}")

    # we have to search in the raw_data_fields for some parameters
    run_times = []
    zone_times = []
    for index in range(1, 11):
      # find the run and zone times
      run_time_label_start = f"Format([Run{index}.DECIMAL]"
      zone_time_label_start = f"Format([Z{index}Result.DECIMAL]"
      run_time_index = next((i for i, s in enumerate(raw_data_fields) if s.startswith(run_time_label_start)), -1)
      zone_time_index = next((i for i, s in enumerate(raw_data_fields) if s.startswith(zone_time_label_start)), -1)
      #print(f"Run {index} time index = {run_time_index}, zone {index} time index = {zone_time_index}")

      # get now the data
      if (run_time_index >= 0):
        run_time_str = raw_data[run_time_index]
        run_time = parse_duration(run_time_str)
      else:
        run_time = timedelta(0)
      if (zone_time_index >= 0):
        zone_time_str = raw_data[zone_time_index]
        zone_time = parse_duration(zone_time_str)
      else:
        zone_time = timedelta(0)
      #print(f"Run {index} time = {run_time}. Zone {index} time = {zone_time}")

      # store the times
      run_times.append(run_time)
      zone_times.append(zone_time)

    athlete.run_times = run_times
    athlete.zone_times = zone_times

  except Exception as e:
    print(f"Error acquiring athlete data from url {url}: {e}")

  return athlete


def clean_name(name: str) -> str:
  # remove leading "#<digits>_" if present
  return re.sub(r"^#\d+_", "", name)