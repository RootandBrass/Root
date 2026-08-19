"""Keep uploaded Root & Brass images reasonably sized without changing URLs."""
from pathlib import Path
from tempfile import NamedTemporaryFile

from PIL import Image, ImageOps


MAXIMUM_BYTES = 1_000_000
IMAGE_DIRECTORIES = (Path("images"), Path("grimoire/images"), Path("journal/images"))
IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png"}


def optimize(path: Path) -> None:
    original_bytes = path.stat().st_size
    if original_bytes <= MAXIMUM_BYTES:
        return

    with Image.open(path) as source:
        image = ImageOps.exif_transpose(source)
        maximum_edge = 256 if path.name == "icon.png" else 700 if path.name == "logo.png" else 1600
        image.thumbnail((maximum_edge, maximum_edge), Image.Resampling.LANCZOS)

        with NamedTemporaryFile(dir=path.parent, suffix=path.suffix, delete=False) as temporary:
            temporary_path = Path(temporary.name)

        try:
            if path.suffix.lower() in {".jpg", ".jpeg"}:
                image.convert("RGB").save(
                    temporary_path, format="JPEG", quality=82, optimize=True, progressive=True
                )
            else:
                if image.mode == "RGBA" or "transparency" in image.info:
                    image = image.convert("RGBA").quantize(
                        colors=256, method=Image.Quantize.FASTOCTREE
                    )
                else:
                    image = image.convert("RGB").quantize(
                        colors=256, method=Image.Quantize.MEDIANCUT
                    )
                image.save(temporary_path, format="PNG", optimize=True)

            optimized_bytes = temporary_path.stat().st_size
            if optimized_bytes < original_bytes:
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
