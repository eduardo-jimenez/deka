import os
from datetime import timedelta
from pathlib import Path

import openpyxl
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from events.models import AthleteResult, DekaEvent


class Command(BaseCommand):
    help = "Import athlete results from an .xlsx file into the database"

    def add_arguments(self, parser):
        parser.add_argument("file_path", type=str, help="Path to the .xlsx file to import")
        parser.add_argument(
            "--event",
            type=str,
            default=None,
            help="Event name to associate with all imported rows. Defaults to the first sheet name.",
        )
        parser.add_argument(
            "--sheet",
            type=int,
            default=0,
            help="Worksheet index to import from (default: 0)",
        )

    def handle(self, *args, **options):
        
        # Get the input file from the command line arguments and validate it
        input_path = Path(options["file_path"]).expanduser().resolve()
        if not input_path.exists():
            raise CommandError(f"File not found: {input_path}")
        if input_path.suffix.lower() != ".xlsx":
            raise CommandError("Only .xlsx files are supported")

        # Get the event name from the command line argument and create or retrieve the event from the database
        event_name = options["event"] or input_path.stem
        event, created = DekaEvent.objects.get_or_create(name=event_name)
        if created:
            self.stdout.write(self.style.SUCCESS(f"Created event: {event.name}"))
        else:
            self.stdout.write(f"Using existing event: {event.name}")

        workbook = openpyxl.load_workbook(input_path, data_only=True)
        sheet = workbook.worksheets[options["sheet"]]
        rows = list(sheet.iter_rows(values_only=True))
        if not rows:
            raise CommandError("The selected sheet is empty")

        headers = [self._normalize_header(value) for value in rows[0]]
        data_rows = rows[1:]

        if not headers:
            raise CommandError("No headers were found in the selected sheet")

        self.stdout.write(f"Importing from sheet '{sheet.title}' with {len(data_rows)} rows")

        imported = 0
        skipped = 0

        with transaction.atomic():
            for index, row in enumerate(data_rows, start=2):
                values = dict(zip(headers, row))
                athlete_name = self._get_value(values, ["athlete_name", "name", "athlete", "athlete name"])
                if not athlete_name:
                    skipped += 1
                    continue

                gender = self._get_value(values, ["gender", "sex"])
                category = self._get_value(values, ["category", "category_name", "class"])
                age_group = self._get_value(values, ["age_group", "age group", "age-group", "age"])

                total_time = self._parse_duration(self._get_value(values, ["total_time", "total", "time", "mark"]))
                partial_fields = {}
                for i in range(1, 11):
                    partial_fields[f"run_length_{i}"] = self._parse_duration(self._get_value(values, [f"run_length_{i}", f"run{i}", f"run_{i}", f"run-length-{i}"]))
                for i in range(1, 11):
                    partial_fields[f"exercise_{i}"] = self._parse_duration(self._get_value(values, [f"exercise_{i}", f"exercise{i}", f"exercise_{i}"]))

                athlete_result, created = AthleteResult.objects.get_or_create(
                    event=event,
                    athlete_name=str(athlete_name).strip(),
                    category=str(category or "").strip() or "",
                    gender=str(gender or "").strip() or "",
                    age_group=str(age_group or "").strip() or "",
                    defaults={
                        "total_time": total_time,
                        **partial_fields,
                    },
                )

                if created:
                    imported += 1
                else:
                    athlete_result.total_time = total_time
                    athlete_result.gender = str(gender or "").strip() or ""
                    athlete_result.category = str(category or "").strip() or ""
                    athlete_result.age_group = str(age_group or "").strip() or ""
                    for field_name, value in partial_fields.items():
                        setattr(athlete_result, field_name, value)
                    athlete_result.save(update_fields=[
                        "total_time",
                        "gender",
                        "category",
                        "age_group",
                        *partial_fields.keys(),
                    ])

        self.stdout.write(self.style.SUCCESS(f"Imported {imported} new results; updated {len(data_rows) - imported - skipped} existing results; skipped {skipped} rows"))

    def _normalize_header(self, value):
        if value is None:
            return ""
        return str(value).strip().lower().replace(" ", "_").replace("-", "_")

    def _get_value(self, values, possible_keys):
        for key in possible_keys:
            if key in values and values[key] not in (None, ""):
                return values[key]
        return None

    def _parse_duration(self, value):
        if value in (None, ""):
            return None
        if isinstance(value, timedelta):
            return value
        if isinstance(value, (int, float)):
            return timedelta(seconds=float(value))
        text = str(value).strip()
        if not text:
            return None
        if ":" in text:
            parts = text.split(":")
            if len(parts) == 2:
                minutes, seconds = parts
                return timedelta(minutes=int(minutes), seconds=float(seconds))
            if len(parts) == 3:
                hours, minutes, seconds = parts
                return timedelta(hours=int(hours), minutes=int(minutes), seconds=float(seconds))
        try:
            seconds = float(text)
            return timedelta(seconds=seconds)
        except ValueError:
            return None
