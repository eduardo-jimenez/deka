import requests
import urllib.parse
from datetime import datetime
from config import HEADERS
from results_data import DekaResults, DekaTypeResults, CategoryResults, AthleteResult


def scrape_deka_event(event) -> DekaResults:
  print(f"Scraping DEKA results from [{event["name"]}]")

  """Get the general info with the different DEKA types we have results for (DEKA Fit, DEKA Fit Teams, DEKA Mile,...)"""
  eventId = event["id"]
  general_url = f"https://my.raceresult.com/{eventId}/RRPublish/data/config?lang=en&page=results&noVisitor=1&v=1"
  print(f"General URL = {general_url}")
  response = requests.get(general_url, headers=HEADERS, timeout=15)
  response.raise_for_status()

  generalData = response.json()
  #print(generalData)

  key = generalData["key"]
  server = generalData["server"]
  lists = generalData["lists"]
  #contests = generalData["contests"]

  deka = DekaResults()
  deka.name = event["name"]

  deka_types:list[DekaTypeResults] = []

  for listElem in lists:
    list_name = listElem["Name"]
    show_as = listElem["ShowAs"]
    contest = listElem["Contest"]
    leader = listElem["Leader"]
    print(f"scraping results for [{list_name} (contest = {contest} & leader = {leader})]")

    deka_type = DekaTypeResults()
    deka_type.name = show_as
    deka_type.deka = deka
    deka_types.append(deka_type)

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
        category = scrape_deka_category(event, deka_type, key, server, list_name_encoded, contest, category1Name, encoded_category, 1)
        categories.append(category)
      else:
        for category2Name in category1:
          #print(f"Printing data for {category2Name}")
          category2 = category1[category2Name]
          if (isinstance(category2, list)):
            encoded_category = f"{urllib.parse.quote(category1Name)}%0C{urllib.parse.quote(category2Name)}"
            category = scrape_deka_category(event, deka_type, key, server, list_name_encoded, contest, category2Name, encoded_category, 2)
            categories.append(category)
          else:
            for category3Name in category2:
              #print(f"Printing data for {category3Name}")
              category3 = category2[category3Name]
              if (isinstance(category3, list)):
                encoded_category = f"{urllib.parse.quote(category1Name)}%0C{urllib.parse.quote(category2Name)}%0C{urllib.parse.quote(category3Name)}"
                category = scrape_deka_category(event, deka_type, key, server, list_name_encoded, contest, category3Name, encoded_category, 3)
                categories.append(category)
              else:
                for category4Name in category3:
                  #print(f"Printing data for {category4Name}")
                  category4 = category3[category4Name]
                  if (isinstance(category4, list)):
                    encoded_category = f"{urllib.parse.quote(category1Name)}%0C{urllib.parse.quote(category2Name)}%0C{urllib.parse.quote(category3Name)}%0C{urllib.parse.quote(category4Name)}"
                    category = scrape_deka_category(event, deka_type, key, server, list_name_encoded, contest, category4Name, encoded_category, 4)
                    categories.append(category)
                    # there shouldn't be more nested categories...

    deka_type.categories = categories

  deka.types = deka_types

  return deka


def scrape_deka_category(event, deka_type:DekaTypeResults, key:str, server:str, list_name_encoded:str, contest:str, category_name:str, encoded_category:str, categoryDepth:int) -> CategoryResults:
  print(f"Scraping DEKA category {category_name}")

  category = CategoryResults()
  category.name = category_name
  category.is_teams = "team" in encoded_category.lower()
  category.deka_type = deka_type

  eventId = event["id"]
  url = (
    f"https://{server}/{eventId}/RRPublish/data/list?"
    f"key={key}&listname={list_name_encoded}"
    f"&page=results&contest={contest}&r=group"
    f"&name={encoded_category}&f="
  )
  for i in range(categoryDepth):
    url += "%0C"

  print(f"Fetching results for category {category_name} from {url}")
  response = requests.get(url, headers=HEADERS, timeout=15)
  response.raise_for_status()
  responseJson = response.json()
  responseData = responseJson["data"]
  #print(responseData)

  category_athletes:list[AthleteResult] = []
  for athleteData in responseData:
    if len(athleteData) > 8:
      athlete = AthleteResult()
      athlete.category = category
      athlete.from_json(category.is_teams, athleteData)
      #print(athlete)
      category_athletes.append(athlete)

  category.athletes = category_athletes

  return category
