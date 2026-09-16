"""Keep Root & Brass images reasonably sized without changing their URLs."""
from pathlib import Path
from tempfile import NamedTemporaryFile
import re

from PIL import Image, ImageOps, UnidentifiedImageError


MAXIMUM_BYTES = 1_000_000
UPLOAD_MAXIMUM_BYTES = 350_000
UPLOAD_MAXIMUM_EDGE = 1200
PLANT_MAXIMUM_BYTES = 250_000
PLANT_MAXIMUM_EDGE = 1000
IMAGE_DIRECTORIES = (Path("images"), Path("grimoire/images"), Path("journal/images"))
IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png"}
PLANT_CONTENT_DIRECTORY = Path("garden/plants")
IMAGE_FIELD = re.compile(r"^image:\s*[\"']?(/images/uploads/[^\"'\s]+)", re.MULTILINE)


def collect_plant_photos() -> set[Path]:
    photos: set[Path] = set()
    if not PLANT_CONTENT_DIRECTORY.exists():
        return photos

    for entry in PLANT_CONTENT_DIRECTORY.rglob("*"):
        if not entry.is_file() or entry.suffix.lower() not in {".html", ".md"}:
            continue
        try:
            text = entry.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        match = IMAGE_FIELD.search(text)
        if match:
            photos.add(Path(match.group(1).lstrip("/")))
    return photos


PLANT_PHOTOS = collect_plant_photos()


def is_upload(path: Path) -> bool:
    try:
        path.relative_to(Path("images/uploads"))
        return True
    except ValueError:
        return False


def is_plant_photo(path: Path) -> bool:
    return path in PLANT_PHOTOS


def limits_for(path: Path) -> tuple[int, int]:
    if is_plant_photo(path):
        return PLANT_MAXIMUM_BYTES, PLANT_MAXIMUM_EDGE
    if is_upload(path):
        return UPLOAD_MAXIMUM_BYTES, UPLOAD_MAXIMUM_EDGE
    if path.name == "icon.png":
        return MAXIMUM_BYTES, 256
    if path.name == "logo.png":
        return MAXIMUM_BYTES, 700
    return MAXIMUM_BYTES, 1600


def optimize(path: Path) -> None:
    original_bytes = path.stat().st_size
    maximum_bytes, maximum_edge = limits_for(path)

    try:
        with Image.open(path) as source:
            width, height = source.size
            if original_bytes <= maximum_bytes and max(width, height) <= maximum_edge:
                return

            image = ImageOps.exif_transpose(source)
            image.thumbnail((maximum_edge, maximum_edge), Image.Resampling.LANCZOS)

            with NamedTemporaryFile(dir=path.parent, suffix=path.suffix, delete=False) as temporary:
                temporary_path = Path(temporary.name)

            try:
                if path.suffix.lower() in {".jpg", ".jpeg"}:
                    image.convert("RGB").save(
                        temporary_path,
                        format="JPEG",
                        quality=76 if is_plant_photo(path) else 78 if is_upload(path) else 82,
                        optimize=True,
                        progressive=True,
                    )
                else:
                    if image.mode == "RGBA" or "transparency" in image.info:
                        image = image.convert("RGBA").quantize(
                            colors=160 if is_plant_photo(path) else 192 if is_upload(path) else 256,
                            method=Image.Quantize.FASTOCTREE,
                        )
                    else:
                        image = image.convert("RGB").quantize(
                            colors=160 if is_plant_photo(path) else 192 if is_upload(path) else 256,
                            method=Image.Quantize.MEDIANCUT,
                        )
                    image.save(temporary_path, format="PNG", optimize=True)

                optimized_bytes = temporary_path.stat().st_size
                if optimized_bytes < original_bytes or max(width, height) > maximum_edge:
                    temporary_path.replace(path)
                    label = "plant photo" if is_plant_photo(path) else "image"
                    print(f"{label} {path}: {original_bytes:,} -> {optimized_bytes:,} bytes")
                else:
                    temporary_path.unlink()
            except Exception:
                temporary_path.unlink(missing_ok=True)
                raise
    except (UnidentifiedImageError, OSError, ValueError) as exc:
        print(f"Skipping unreadable image {path}: {exc}")


print(f"Plant photos tracked for optimization: {len(PLANT_PHOTOS)}")
for directory in IMAGE_DIRECTORIES:
    if directory.exists():
        for image_path in sorted(directory.rglob("*")):
            if image_path.is_file() and image_path.suffix.lower() in IMAGE_SUFFIXES:
                optimize(image_path)
