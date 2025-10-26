# scrape_deka.py
import requests
from datetime import datetime
from config import DEKA_SEARCH_URL, HEADERS, SEARCH_KEYWORDS
from scrape_deka_page import scrape_deka_event
from deka_excel_exporter import export_to_excel


def search_deka_event(deka_event: str) -> str:
  """Execute the search in myresults for the given deka event"""
  print(f"Searching for deka event {deka_event}...")
  params = {
    "type": -1,
    "country": 0,
    "filter": deka_event,
    "searchMode": "undefined",
    "activeevents": 250,
    "group": 0,
    "user": 0,
    "geoLocation": "IP",
    "lang": "en",
  }

  response = requests.get(DEKA_SEARCH_URL, params=params, headers=HEADERS, timeout=15)
  response.raise_for_status()

  print(response)

  data = response.json()
  print(f"Search data found!: {len(data)} events '{deka_event}'")
  return data


def normalize_event(raw):
  """Convert raw JSON array into a dict with readable keys."""
  return {
    "id": raw[0],
    "type": raw[1],
    "name": raw[2],
    "start_date": raw[3],
    "end_date": raw[4],
    "city": raw[5],
    "country_code": raw[6],
    "latitude": raw[7],
    "longitude": raw[8],
    "country": raw[9],
    "category": raw[10],
    "extra": raw[11],
    "scraped_at": datetime.utcnow().isoformat(),
    "url": f"https://my.raceresult.com/{raw[0]}/",
  }



def main():
  raw_events = search_deka_event(SEARCH_KEYWORDS[4])
  events = [normalize_event(e) for e in raw_events]
  for e in events:
    print(f"- {e['name']} ({e['url']})")
    deka_results = scrape_deka_event(e)
    file_path = f"results_excel/DEKA-{e['city']}.xlsx"
    export_to_excel(deka_results, file_path)


if __name__ == "__main__":
  main()
