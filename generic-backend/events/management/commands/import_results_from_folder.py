from pathlib import Path

from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
  help = "Import all .xlsx files from a folder into the database using import_results"

  def add_arguments(self, parser):
    parser.add_argument("folder_path", type=str, help="Path to the folder containing .xlsx files to import")
    parser.add_argument(
      "--recursive",
      action="store_true",
      help="Recursively search subfolders for .xlsx files",
    )

  def handle(self, *args, **options):
    folder = Path(options["folder_path"]).expanduser().resolve()
    if not folder.exists():
      raise CommandError(f"Folder not found: {folder}")
    if not folder.is_dir():
      raise CommandError(f"Not a folder: {folder}")

    pattern = "**/*.xlsx" if options["recursive"] else "*.xlsx"
    files = sorted(folder.glob(pattern))

    if not files:
      raise CommandError(f"No .xlsx files found in: {folder}")

    for input_path in files:
      event_name = input_path.stem
      self.stdout.write(self.style.WARNING(f"Importing {input_path.name} as event '{event_name}'"))
      call_command("import_results", str(input_path), event=event_name, stdout=self.stdout, stderr=self.stderr)

    self.stdout.write(self.style.SUCCESS(f"Finished importing {len(files)} file(s) from {folder}"))
