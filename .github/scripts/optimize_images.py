"""Keep Root & Brass images reasonably sized without changing their URLs."""
from pathlib import Path
from tempfile import NamedTemporaryFile

from PIL import Image, ImageOps


MAXIMUM_BYTES = 1_000_000
UPLOAD_MAXIMUM_BYTES = 350_000
UPLOAD_MAXIMUM_EDGE = 1200
IMAGE_DIRECTORIES = (Path("images"), Path("grimoire/images"), Path("journal/images"))
IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png"}


def limits_for(path: Path) -> tuple[int, int]:
    if path.is_relative_to(Path("images/uploads")):
        return UPLOAD_MAXIMUM_BYTES, UPLOAD_MAXIMUM_EDGE
    if path.name == "icon.png":
        return MAXIMUM_BYTES, 256
    if path.name == "logo.png":
        return MAXIMUM_BYTES, 700
    return MAXIMUM_BYTES, 1600


def optimize(path: Path) -> None:
    original_bytes = path.stat().st_size
    maximum_bytes, maximum_edge = limits_for(path)

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
                    quality=78 if path.is_relative_to(Path("images/uploads")) else 82,
                    optimize=True,
                    progressive=True,
                )
            else:
                if image.mode == "RGBA" or "transparency" in image.info:
                    image = image.convert("RGBA").quantize(
                        colors=192 if path.is_relative_to(Path("images/uploads")) else 256,
                        method=Image.Quantize.FASTOCTREE,
                    )
                else:
                    image = image.convert("RGB").quantize(
                        colors=192 if path.is_relative_to(Path("images/uploads")) else 256,
                        method=Image.Quantize.MEDIANCUT,
                    )
                image.save(temporary_path, format="PNG", optimize=True)

            optimized_bytes = temporary_path.stat().st_size
            if optimized_bytes < original_bytes or max(width, height) > maximum_edge:
                temporary_path.replace(path)
                print(f"{path}: {original_bytes:,} -> {optimized_bytes:,} bytes")
            else:
                temporary_path.unlink()
        except Exception:
            temporary_path.unlink(missing_ok=True)
            raise


for directory in IMAGE_DIRECTORIES:
    if directory.exists():
        for image_path in sorted(directory.rglob("*")):
            if image_path.is_file() and image_path.suffix.lower() in IMAGE_SUFFIXES:
                optimize(image_path)
