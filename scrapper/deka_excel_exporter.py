from openpyxl import Workbook
from results_data import DekaResults
from typing import cast


def export_to_excel(deka:DekaResults, filename:str):
  print(f"Exporting {deka} to {filename} (total of {len(deka.types)} types)")

  wb = Workbook()
  wb.remove(wb.active)

  for deka_type in deka.types:
    #print(f"Adding sheet for {deka_type}")

    ws = wb.create_sheet(title=deka_type.name[:31])
    ws.append([deka_type.name])
    ws.append([])

    for category in deka_type.categories:
      #print(f"Category {category.name} has {len(category.athletes)} athletes")

      title_row = [category.name]
      ws.append([])
      ws.append(title_row)
      ws.append(["Name", "Time"])

      for athlete in category.athletes:
        row = [athlete.name, athlete.time]
        ws.append(row)
  
  wb.save(filename)

