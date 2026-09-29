from pathlib import Path
from PIL import Image


ROOT = Path("/Users/furkanmacbook/Desktop/trade-tales-trek-main")
SOURCE_DIR = Path.home() / ".codex/generated_images/019f05e5-360a-7b62-a16f-952b5ac58fad"
SHEETS_DIR = ROOT / "public/characters/skinsheets"
SPRITES_DIR = ROOT / "public/characters/skins"
PORTRAITS_DIR = ROOT / "public/characters/portraits"

CHARACTER_ORDER = [
    ("elanus", ["base", "tesla", "mars", "neural"]),
    ("jeffrus", ["base", "blue", "press", "yacht"]),
    ("markus", ["base", "vr", "toga", "mma"]),
    ("billimus", ["base", "philanthrop", "vaccine", "windows"]),
    ("warrus", ["base", "cola", "berkshire", "buffet"]),
    ("oprahus", ["base", "book", "talk", "mogul"]),
    ("markust", ["base", "champ", "vuit", "icon"]),
    ("larrus", ["base", "yacht", "island", "samurai"]),
    ("stevus", ["base", "keynote", "vision", "orchard"]),
    ("cathrus", ["base", "studio", "breaking", "anchor"]),
]

FILES = sorted(SOURCE_DIR.glob("*.png"), key=lambda p: p.stat().st_mtime)
CELL_INDEXES = [(0, 0), (1, 0), (0, 1), (1, 1)]


def alpha_white(img: Image.Image) -> Image.Image:
    out = img.convert("RGBA")
    pixels = out.load()
    for y in range(out.size[1]):
        for x in range(out.size[0]):
            r, g, b, a = pixels[x, y]
            if r > 246 and g > 246 and b > 246:
                pixels[x, y] = (255, 255, 255, 0)
            elif r > 235 and g > 235 and b > 235:
                fade = max(0, 255 - int(((r + g + b) / 3 - 235) * 12))
                pixels[x, y] = (r, g, b, min(a, fade))
    return out


def bbox_non_white(img: Image.Image):
    pixels = img.convert("RGBA").load()
    xs = []
    ys = []
    for y in range(img.size[1]):
      for x in range(img.size[0]):
        r, g, b, a = pixels[x, y]
        if a > 0 and not (r > 245 and g > 245 and b > 245):
          xs.append(x)
          ys.append(y)
    if not xs:
        return (0, 0, img.size[0], img.size[1])
    return (min(xs), min(ys), max(xs) + 1, max(ys) + 1)


def fit_on_canvas(img: Image.Image, size: int, scale: float = 1.0):
    w, h = img.size
    usable = int(size * scale)
    factor = min(usable / w, usable / h)
    resized = img.resize((max(1, int(w * factor)), max(1, int(h * factor))), Image.NEAREST)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    x = (size - resized.size[0]) // 2
    y = size - resized.size[1] - int(size * 0.05)
    canvas.alpha_composite(resized, (x, y))
    return canvas


def portrait_from_body(img: Image.Image):
    bbox = bbox_non_white(img)
    left, top, right, bottom = bbox
    bw = right - left
    bh = bottom - top
    head_size = int(max(bw * 0.78, bh * 0.46))
    cx = (left + right) // 2
    cy = int(top + bh * 0.24)
    crop = (
        max(0, cx - head_size // 2),
        max(0, cy - head_size // 2),
        min(img.size[0], cx + head_size // 2),
        min(img.size[1], cy + head_size // 2),
    )
    head = img.crop(crop)
    return fit_on_canvas(head, 256, 0.82)


def process():
    SHEETS_DIR.mkdir(parents=True, exist_ok=True)
    SPRITES_DIR.mkdir(parents=True, exist_ok=True)
    PORTRAITS_DIR.mkdir(parents=True, exist_ok=True)

    if len(FILES) < len(CHARACTER_ORDER):
        raise RuntimeError(f"Expected {len(CHARACTER_ORDER)} sheets, found {len(FILES)}")

    for source, (character_id, skin_ids) in zip(FILES, CHARACTER_ORDER):
        sheet_target = SHEETS_DIR / f"{character_id}-sheet.png"
        sheet_target.write_bytes(source.read_bytes())

        sheet = Image.open(source).convert("RGBA")
        width, height = sheet.size
        cell_w = width // 2
        cell_h = height // 2

        for (cell_x, cell_y), skin_id in zip(CELL_INDEXES, skin_ids):
            left = cell_x * cell_w
            top = cell_y * cell_h
            cell = sheet.crop((left, top, left + cell_w, top + cell_h))
            bbox = bbox_non_white(cell)
            pad_x = 18
            pad_y = 14
            cropped = cell.crop(
                (
                    max(0, bbox[0] - pad_x),
                    max(0, bbox[1] - pad_y),
                    min(cell.size[0], bbox[2] + pad_x),
                    min(cell.size[1], bbox[3] + pad_y),
                )
            )
            transparent = alpha_white(cropped)
            sprite = fit_on_canvas(transparent, 384, 0.8)
            portrait = portrait_from_body(transparent)

            sprite.save(SPRITES_DIR / f"{character_id}-{skin_id}.png")
            portrait.save(PORTRAITS_DIR / f"{character_id}-{skin_id}.png")


if __name__ == "__main__":
    process()
