# scrape_deka.py
import requests
from datetime import date, datetime
from config import DEKA_SEARCH_URL, HEADERS, SEARCH_KEYWORDS, SEARCH_KEYWORDS_DEV
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
  if not data is None:
    print(f"Search data found!: {len(data)} events '{deka_event}'")
  else:
    print(f"No search data found for '{deka_event}'")

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


# Searches for DEKA events in raceresults and scrapes the results
def scrape_searching_deka_events():
  search_keywords = SEARCH_KEYWORDS_DEV #SEARCH_KEYWORDS
  for i in range(0, len(search_keywords)):
    raw_events = search_deka_event(search_keywords[i])
    if (raw_events is None) or (len(raw_events) == 0):
      print(f"No events found for '{search_keywords[i]}'")
      continue

    events = [normalize_event(e) for e in raw_events]
    for e in events:
      print(f"- {e['name']} ({e['url']})")
      event_date = datetime.fromisoformat(e['start_date']).date()

      deka_results = scrape_deka_event(e, event_date)
      file_path = f"results_excel/{deka_results.get_event_name()}.xlsx"
      export_to_excel(deka_results, file_path)


def scrape_deka_links():
  # read DEKA_Links.csv which should have a list of events
  with open("DEKA_Links.csv", "r") as f:
    lines = f.readlines()
    for line in lines:
      if line.startswith("#"):
        continue

      parts = line.split(",")
      if len(parts) < 4:
        print(f"Invalid line in DEKA_Links.csv: {line}")
        continue

      # gather event details from the line
      event_name = parts[0].strip()
      event_url = parts[1].strip()
      event_city = parts[2].strip()
      event_date_str = parts[3].strip()
      event_date_parts = event_date_str.split("/")
      if len(event_date_parts) != 3:
        print(f"Invalid date format in DEKA_Links.csv: {event_date_str}")
        continue
      event_date = date(int(event_date_parts[2]), int(event_date_parts[1]), int(event_date_parts[0]))
      event_id = event_url.split("/")[-2]  # Extract the event ID from the URL

      # create a dictionary to pass with the event info
      event = {
        "id": event_id,
        "name": event_name,
        "url": event_url,
        "city": event_city,
        "date": event_date.isoformat(),
      }

      # scrape the event results
      print(f"Scraping DEKA event: {event_name} ({event_url})")
      deka_results = scrape_deka_event(event, event_date)

      # export them to a file
      file_path = f"results_excel/{event_name}.xlsx"
      export_to_excel(deka_results, file_path)

def main():
  #scrape_searching_deka_events()
  scrape_deka_links()

if __name__ == "__main__":
  main()
