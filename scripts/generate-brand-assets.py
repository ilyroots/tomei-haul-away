#!/usr/bin/env python3
"""Generate Tomei Haul Away brand assets and placeholder photography."""

import math
import os
from pathlib import Path

import io
import struct

from PIL import Image, ImageDraw, ImageFilter, ImageFont

# Brand palette
NAVY = "#0B1F33"
NAVY_DARK = "#071625"
ORANGE = "#F26A21"
ORANGE_DARK = "#D95712"
CREAM = "#F7F4ED"
CHARCOAL = "#17212B"
SLATE = "#607080"
WHITE = "#FFFFFF"
BORDER = "#D8DAD8"

PROJECT_ROOT = Path(__file__).resolve().parent.parent
LOGO_DIR = PROJECT_ROOT / "public" / "images" / "logos"
PLACEHOLDER_DIR = PROJECT_ROOT / "public" / "images" / "placeholders"


def hex_to_rgb(hex_color: str):
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i : i + 2], 16) for i in (0, 2, 4))


def create_canvas(width: int, height: int, color: str):
    img = Image.new("RGBA", (width, height), hex_to_rgb(color) + (255,))
    return img


def save_webp(img: Image.Image, path: Path, quality: int = 90):
    # Convert to RGB if no transparency needed; keep RGBA only when alpha matters
    if img.mode == "RGBA":
        # WebP supports alpha; keep it
        img.save(path, "WEBP", quality=quality, method=6)
    else:
        img.save(path, "WEBP", quality=quality, method=6)


def save_png(img: Image.Image, path: Path):
    img.save(path, "PNG")


def save_ico(images: list[Image.Image], path: Path):
    """Save multiple PNG-encoded resolutions into a single .ico file."""
    png_data: list[bytes] = []
    for img in images:
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        png_data.append(buf.getvalue())

    out = io.BytesIO()
    out.write(struct.pack("<HHH", 0, 1, len(images)))
    offset = 6 + 16 * len(images)
    for img, data in zip(images, png_data):
        w = img.width if img.width < 256 else 0
        h = img.height if img.height < 256 else 0
        out.write(struct.pack("<BBBBHHII", w, h, 0, 0, 1, 32, len(data), offset))
        offset += len(data)
    for data in png_data:
        out.write(data)

    path.write_bytes(out.getvalue())


def draw_rounded_rect(draw, xy, radius, fill, outline=None, width=1):
    x1, y1, x2, y2 = xy
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def draw_house(draw, x, y, width, height, color, roof_color=None, window_color=None):
    """Draw a simple stylized house."""
    roof_color = roof_color or ORANGE
    body_w = int(width * 0.9)
    body_h = int(height * 0.65)
    body_x = x + (width - body_w) // 2
    body_y = y + height - body_h
    # Body
    draw.rectangle([body_x, body_y, body_x + body_w, body_y + body_h], fill=color)
    # Roof
    roof_points = [
        (body_x - body_w // 10, body_y),
        (body_x + body_w // 2, y),
        (body_x + body_w + body_w // 10, body_y),
    ]
    draw.polygon(roof_points, fill=roof_color)
    # Door
    door_w = body_w // 4
    door_h = body_h // 2
    door_x = body_x + (body_w - door_w) // 2
    door_y = body_y + body_h - door_h
    draw.rectangle([door_x, door_y, door_x + door_w, door_y + door_h], fill=NAVY_DARK)
    # Windows
    if window_color:
        win_size = body_w // 5
        win_y = body_y + body_h // 6
        draw.rectangle(
            [body_x + body_w // 8, win_y, body_x + body_w // 8 + win_size, win_y + win_size],
            fill=window_color,
        )
        draw.rectangle(
            [
                body_x + body_w - body_w // 8 - win_size,
                win_y,
                body_x + body_w - body_w // 8,
                win_y + win_size,
            ],
            fill=window_color,
        )


def draw_truck(draw, x, y, width, height, body_color=NAVY, cab_color=ORANGE, wheel_color=CHARCOAL):
    """Draw a stylized dump/haul truck silhouette."""
    wheel_r = int(height * 0.13)
    chassis_y = y + height - wheel_r * 2
    # Cab (front-right)
    cab_w = int(width * 0.32)
    cab_h = int(height * 0.62)
    cab_x = x + width - cab_w
    cab_y = chassis_y - cab_h + wheel_r
    draw.rectangle([cab_x, cab_y, cab_x + cab_w, cab_y + cab_h], fill=cab_color)
    # Cab window
    win_margin = cab_w // 6
    draw.rectangle(
        [cab_x + win_margin, cab_y + win_margin, cab_x + cab_w - win_margin // 2, cab_y + cab_h // 2],
        fill=CREAM,
    )
    # Dump bed (rear-left) with sloped front
    bed_w = int(width * 0.62)
    bed_h = int(height * 0.55)
    bed_x = x
    bed_y = chassis_y - bed_h + wheel_r
    bed_points = [
        (bed_x, bed_y + bed_h),  # rear bottom
        (bed_x, bed_y),  # rear top
        (bed_x + bed_w, bed_y + bed_h * 0.25),  # front top (low)
        (bed_x + bed_w, bed_y + bed_h),  # front bottom
    ]
    draw.polygon(bed_points, fill=body_color)
    # Bed ribs
    for i in range(1, 4):
        rx = bed_x + bed_w * i // 4
        draw.line([(rx, bed_y + 8), (rx, bed_y + bed_h - 8)], fill=CREAM, width=3)
    # Chassis line
    draw.rectangle([x, chassis_y, x + width, chassis_y + wheel_r // 2], fill=wheel_color)
    # Wheels
    wheel_y = y + height - wheel_r
    centers = [x + bed_w // 5, x + bed_w * 2 // 5, cab_x + cab_w // 2]
    for cx in centers:
        draw.ellipse(
            [cx - wheel_r, wheel_y - wheel_r, cx + wheel_r, wheel_y + wheel_r], fill=wheel_color
        )
        draw.ellipse(
            [cx - wheel_r // 2, wheel_y - wheel_r // 2, cx + wheel_r // 2, wheel_y + wheel_r // 2],
            fill=CREAM,
        )


def draw_furniture(draw, x, y, width, height, color=NAVY, cushion_color=CREAM):
    """Draw a stylized couch."""
    back_h = int(height * 0.45)
    seat_h = int(height * 0.3)
    arm_w = int(width * 0.12)
    # Back
    draw.rectangle([x + arm_w, y, x + width - arm_w, y + back_h], fill=color)
    # Seat
    draw.rectangle(
        [x + arm_w, y + back_h, x + width - arm_w, y + back_h + seat_h], fill=cushion_color
    )
    # Arms
    draw.rectangle([x, y + back_h // 2, x + arm_w, y + back_h + seat_h], fill=color)
    draw.rectangle(
        [x + width - arm_w, y + back_h // 2, x + width, y + back_h + seat_h], fill=color
    )
    # Legs
    leg_w = arm_w // 2
    leg_h = height - back_h - seat_h
    leg_y = y + back_h + seat_h
    for lx in [x + arm_w // 2, x + width - arm_w - leg_w // 2]:
        draw.rectangle([lx, leg_y, lx + leg_w, leg_y + leg_h], fill=CHARCOAL)


def draw_appliance(draw, x, y, width, height, color=NAVY, detail_color=CREAM):
    """Draw a stylized refrigerator/appliance."""
    draw.rounded_rectangle([x, y, x + width, y + height], radius=width // 10, fill=color)
    # Door line
    draw.rectangle([x + width // 2 - 2, y + height // 10, x + width // 2 + 2, y + height * 9 // 10], fill=detail_color)
    # Handle
    draw.rectangle([x + width * 3 // 4, y + height // 5, x + width * 3 // 4 + 6, y + height // 2], fill=detail_color)


def draw_pile(draw, x, y, width, height, colors, count=8):
    """Draw an abstract pile of items/junk."""
    for i in range(count):
        bx = x + int((i % 4) * width * 0.22 + width * 0.05)
        by = y + height - int((i // 4 + 1) * height * 0.38) - int((i % 3) * height * 0.08)
        bw = int(width * 0.18)
        bh = int(height * 0.3)
        draw.rectangle([bx, by, bx + bw, by + bh], fill=colors[i % len(colors)])


def draw_tree(draw, x, y, width, height, trunk_color=CHARCOAL, foliage_color=NAVY):
    """Draw a stylized tree."""
    trunk_w = width // 4
    trunk_h = height // 3
    draw.rectangle(
        [x + (width - trunk_w) // 2, y + height - trunk_h, x + (width + trunk_w) // 2, y + height],
        fill=trunk_color,
    )
    r = min(width, height * 2 // 3) // 2
    cx = x + width // 2
    cy = y + r
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=foliage_color)


def draw_garage(draw, x, y, width, height, color=NAVY, door_color=ORANGE):
    """Draw a stylized garage."""
    draw.rectangle([x, y + height // 3, x + width, y + height], fill=color)
    # Roof
    draw.polygon([(x, y + height // 3), (x + width // 2, y), (x + width, y + height // 3)], fill=CHARCOAL)
    # Door
    door_w = width // 2
    door_h = height * 2 // 3
    door_x = x + (width - door_w) // 2
    door_y = y + height - door_h
    draw.rectangle([door_x, door_y, door_x + door_w, door_y + door_h], fill=door_color)
    # Horizontal lines on door
    for ly in range(door_y + door_h // 5, door_y + door_h, door_h // 5):
        draw.rectangle([door_x, ly, door_x + door_w, ly + 2], fill=NAVY_DARK)


def draw_piano(draw, x, y, width, height, color=NAVY, key_color=CREAM):
    """Draw a stylized upright piano."""
    draw.rectangle([x, y + height // 4, x + width, y + height], fill=color)
    # Top board
    draw.rectangle([x + width // 10, y, x + width, y + height // 4], fill=color)
    # Keys
    draw.rectangle([x + width // 10, y + height * 3 // 4, x + width, y + height], fill=key_color)
    # Legs
    leg_w = width // 10
    leg_h = height // 8
    for lx in [x + width // 10, x + width - leg_w * 2]:
        draw.rectangle([lx, y + height, lx + leg_w, y + height + leg_h], fill=CHARCOAL)


def draw_branch(draw, x, y, width, height, color=CHARCOAL):
    """Draw a stylized branch with leaves."""
    draw.line([(x, y + height), (x + width // 2, y), (x + width, y + height // 2)], fill=color, width=6)
    for lx in [x + width // 4, x + width // 2, x + width * 3 // 4]:
        ly = y + height - (lx - x) * height // width
        draw.ellipse([lx - 8, ly - 8, lx + 8, ly + 8], fill=NAVY)


def draw_lumber(draw, x, y, width, height, colors):
    """Draw a stack of lumber/drywall."""
    rows = 4
    bh = height // rows
    for i in range(rows):
        draw.rectangle([x, y + i * bh, x + width, y + (i + 1) * bh - 4], fill=colors[i % len(colors)])


def draw_box(draw, x, y, size, color=NAVY):
    """Draw a 3D-ish box."""
    draw.rectangle([x, y, x + size, y + size], fill=color)
    # Flap
    draw.polygon([(x, y), (x + size, y), (x + size // 2, y - size // 4)], fill=ORANGE)


def draw_hot_tub(draw, x, y, width, height, color=NAVY, rim_color=ORANGE):
    """Draw a stylized hot tub."""
    draw.rounded_rectangle([x, y + height // 4, x + width, y + height], radius=width // 6, fill=color)
    draw.ellipse([x + width // 8, y, x + width * 7 // 8, y + height // 2], fill=rim_color)


def draw_people(draw, x, y, width, height, color=NAVY, count=2):
    """Draw stylized people silhouettes."""
    person_w = width // (count + 1)
    for i in range(count):
        px = x + person_w // 2 + i * (person_w + person_w // 4)
        head_r = person_w // 3
        body_h = height * 2 // 3
        draw.ellipse([px - head_r, y, px + head_r, y + head_r * 2], fill=color)
        draw.rectangle(
            [px - head_r, y + head_r * 2, px + head_r, y + head_r * 2 + body_h], fill=color
        )


def draw_clipboard(draw, x, y, width, height, color=NAVY, paper_color=WHITE):
    """Draw a stylized clipboard/estimate."""
    draw.rounded_rectangle([x, y, x + width, y + height], radius=width // 12, fill=color)
    # Paper
    margin = width // 8
    draw.rectangle([x + margin, y + margin * 2, x + width - margin, y + height - margin], fill=paper_color)
    # Lines
    line_y = y + margin * 3
    for _ in range(4):
        draw.rectangle([x + margin + 4, line_y, x + width - margin - 4, line_y + 4], fill=SLATE)
        line_y += margin
    # Checkmark
    draw.polygon(
        [
            (x + width * 3 // 4, y + margin * 3),
            (x + width * 3 // 4 + 8, y + margin * 3 + 10),
            (x + width * 3 // 4 + 18, y + margin * 3 - 4),
        ],
        fill=ORANGE,
    )


def draw_calendar(draw, x, y, width, height, color=NAVY, header_color=ORANGE):
    """Draw a stylized calendar."""
    draw.rounded_rectangle([x, y, x + width, y + height], radius=width // 12, fill=color)
    # Header
    draw.rectangle([x, y, x + width, y + height // 5], fill=header_color)
    # Rings
    for rx in [x + width // 4, x + width * 3 // 4]:
        draw.ellipse([rx - 4, y - 8, rx + 4, y + 8], fill=CHARCOAL)
    # Days
    cell_w = (width - 16) // 5
    cell_h = (height - height // 5 - 16) // 4
    for row in range(4):
        for col in range(5):
            cx = x + 8 + col * cell_w
            cy = y + height // 5 + 8 + row * cell_h
            draw.rectangle([cx, cy, cx + cell_w - 2, cy + cell_h - 2], fill=CREAM if (row + col) % 2 else WHITE)


def draw_map_pins(draw, x, y, width, height, colors):
    """Draw stylized map pins over a faint map grid."""
    # Grid
    for gx in range(x, x + width, width // 5):
        draw.line([(gx, y), (gx, y + height)], fill=BORDER, width=1)
    for gy in range(y, y + height, height // 4):
        draw.line([(x, gy), (x + width, gy)], fill=BORDER, width=1)
    # Pins
    positions = [(0.2, 0.3), (0.5, 0.6), (0.75, 0.25), (0.35, 0.75), (0.85, 0.7)]
    for i, (px, py) in enumerate(positions):
        cx = int(x + px * width)
        cy = int(y + py * height)
        draw.polygon([(cx, cy - 24), (cx - 12, cy), (cx + 12, cy)], fill=colors[i % len(colors)])
        draw.ellipse([cx - 6, cy - 30, cx + 6, cy - 18], fill=WHITE)


def generate_logo_variations():
    LOGO_DIR.mkdir(parents=True, exist_ok=True)
    horizontal = Image.open(LOGO_DIR / "tomei-logo-horizontal.png").convert("RGBA")
    w, h = horizontal.size

    # --- Icon mark: crop the left mark, trim, and square-pad ---
    # The mark (T + trailer) occupies roughly the left 900px of the logo.
    mark_crop = horizontal.crop((0, 0, 900, h))
    # Trim transparent border
    bbox = mark_crop.getbbox()
    mark_trimmed = mark_crop.crop(bbox)
    mw, mh = mark_trimmed.size
    size = max(mw, mh)
    icon = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    icon.paste(mark_trimmed, ((size - mw) // 2, (size - mh) // 2), mark_trimmed)
    # Scale to a few useful sizes while keeping square aspect
    icon_512 = icon.resize((512, 512), Image.LANCZOS)
    save_png(icon_512, LOGO_DIR / "tomei-logo-icon.png")

    # --- Stacked logo: icon above the full horizontal logo ---
    # Use the complete horizontal logo so the company name is fully readable.
    target_horizontal_w = int(size * 1.35)
    scale = target_horizontal_w / w
    horizontal_scaled = horizontal.resize((target_horizontal_w, int(h * scale)), Image.LANCZOS)
    hw, hh = horizontal_scaled.size
    pad = 60
    stacked_w = max(size, hw) + pad * 2
    stacked_h = size + hh + pad * 3
    stacked = Image.new("RGBA", (stacked_w, stacked_h), (0, 0, 0, 0))
    icon_for_stack = icon.resize((size, size), Image.LANCZOS)
    stacked.paste(icon_for_stack, ((stacked_w - size) // 2, pad), icon_for_stack)
    stacked.paste(horizontal_scaled, ((stacked_w - hw) // 2, pad + size + pad), horizontal_scaled)
    save_png(stacked, LOGO_DIR / "tomei-logo-stacked.png")

    # --- Social sharing image: 1200x630 navy background with logo ---
    social = Image.new("RGBA", (1200, 630), hex_to_rgb(NAVY) + (255,))
    # Scale logo to fit comfortably
    target_logo_w = 900
    scale = target_logo_w / w
    logo_scaled = horizontal.resize((target_logo_w, int(h * scale)), Image.LANCZOS)
    lw, lh = logo_scaled.size
    # Add a cream backing rectangle so the navy wordmark remains readable
    backing_pad = 50
    backing = Image.new(
        "RGBA",
        (lw + backing_pad * 2, lh + backing_pad * 2),
        hex_to_rgb(CREAM) + (255,),
    )
    backing.paste(logo_scaled, (backing_pad, backing_pad), logo_scaled)
    bx = (1200 - backing.width) // 2
    by = (630 - backing.height) // 2
    social.paste(backing, (bx, by), backing)
    save_webp(social, LOGO_DIR / "tomei-logo-social.webp", quality=95)

    # --- Favicon multi-resolution ICO ---
    favicon_path = PROJECT_ROOT / "src" / "app" / "favicon.ico"
    ico_sizes = [16, 32, 48, 64, 128, 256]
    ico_images = []
    for s in ico_sizes:
        ico_img = icon.resize((s, s), Image.LANCZOS)
        # Flatten onto cream so the mark stays crisp at all sizes
        flat = Image.new("RGBA", (s, s), hex_to_rgb(CREAM) + (255,))
        flat.paste(ico_img, (0, 0), ico_img)
        ico_images.append(flat.convert("RGBA"))
    save_ico(ico_images, favicon_path)


def make_placeholder(width: int, height: int, draw_fn, filename: str, subdir: str, alt: str):
    img = create_canvas(width, height, CREAM)
    draw = ImageDraw.Draw(img)
    draw_fn(img, draw)
    out_dir = PLACEHOLDER_DIR / subdir
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / filename
    save_webp(img, out_path)
    return {"src": f"/images/placeholders/{subdir}/{filename}", "width": width, "height": height}


def draw_hero(img, draw):
    w, h = img.size
    # Sky/navy top
    draw.rectangle([0, 0, w, h], fill=NAVY)
    # Ground
    draw.rectangle([0, h * 3 // 4, w, h], fill=CREAM)
    # Sun
    draw.ellipse([w * 7 // 8 - 60, 60, w * 7 // 8 + 60, 180], fill=ORANGE)
    # Truck
    draw_truck(draw, w // 8, h // 3, w // 3, h // 3, body_color=NAVY, cab_color=ORANGE)
    # Houses in distance
    for i, hx in enumerate(range(w // 2, w - 100, 140)):
        draw_house(draw, hx, h * 3 // 4 - 80, 120, 80, color=WHITE, roof_color=ORANGE, window_color=NAVY)
    # Motion lines
    for i in range(3):
        y = h // 2 + i * 20
        draw.rectangle([w // 8 - 40, y, w // 8 - 10, y + 4], fill=CREAM)


def draw_furniture_removal(img, draw):
    w, h = img.size
    draw.rectangle([0, 0, w, h], fill=CREAM)
    draw_furniture(draw, w // 4, h // 3, w // 2, h // 2, color=NAVY, cushion_color=WHITE)
    draw_box(draw, w * 3 // 4, h // 2, 80, color=ORANGE)


def draw_appliance_removal(img, draw):
    w, h = img.size
    draw.rectangle([0, 0, w, h], fill=CREAM)
    draw_appliance(draw, w // 4, h // 4, w // 4, h // 2, color=NAVY)
    draw_appliance(draw, w // 2 + 40, h // 3, w // 5, h // 3, color=CHARCOAL)


def draw_garage_cleanout(img, draw):
    w, h = img.size
    draw.rectangle([0, 0, w, h], fill=NAVY)
    draw_garage(draw, w // 4, h // 4, w // 2, h // 2, color=WHITE, door_color=ORANGE)
    draw_pile(draw, w // 3, h * 2 // 3, w // 3, h // 4, [ORANGE, CREAM, SLATE])


def draw_estate_cleanout(img, draw):
    w, h = img.size
    draw.rectangle([0, 0, w, h], fill=CREAM)
    draw_house(draw, w // 4, h // 4, w // 2, h // 2, color=NAVY, roof_color=ORANGE, window_color=CREAM)
    draw_box(draw, w * 3 // 4, h // 2, 70, color=ORANGE)
    draw_furniture(draw, w // 6, h // 2, w // 4, h // 3, color=CHARCOAL, cushion_color=CREAM)


def draw_yard_debris(img, draw):
    w, h = img.size
    draw.rectangle([0, 0, w, h], fill=CREAM)
    draw_tree(draw, w // 8, h // 4, w // 4, h // 2, trunk_color=CHARCOAL, foliage_color=NAVY)
    draw_branch(draw, w // 2, h // 2, w // 3, h // 4, color=CHARCOAL)
    for i in range(3):
        draw.ellipse([w * 2 // 3 + i * 40, h * 2 // 3, w * 2 // 3 + 30 + i * 40, h * 2 // 3 + 20], fill=NAVY)


def draw_construction_debris(img, draw):
    w, h = img.size
    draw.rectangle([0, 0, w, h], fill=CREAM)
    draw_lumber(draw, w // 4, h // 3, w // 5, h // 2, [NAVY, CHARCOAL, ORANGE, CREAM])
    draw_box(draw, w * 3 // 5, h // 2, 90, color=NAVY)
    draw_appliance(draw, w // 8, h // 2, w // 6, h // 3, color=CHARCOAL)


def draw_storage_unit_cleanout(img, draw):
    w, h = img.size
    draw.rectangle([0, 0, w, h], fill=NAVY)
    # Storage unit door
    draw.rectangle([w // 4, h // 4, w * 3 // 4, h * 3 // 4], fill=WHITE)
    draw.rectangle([w // 4 + 20, h // 4 + 20, w * 3 // 4 - 20, h * 3 // 4 - 20], fill=NAVY)
    draw_box(draw, w // 3, h // 2, 70, color=ORANGE)
    draw_box(draw, w // 2, h * 2 // 3, 60, color=CREAM)


def draw_commercial_junk_removal(img, draw):
    w, h = img.size
    draw.rectangle([0, 0, w, h], fill=CREAM)
    # Commercial building
    draw.rectangle([w // 4, h // 3, w * 3 // 4, h * 3 // 4], fill=NAVY)
    for row in range(3):
        for col in range(4):
            draw.rectangle(
                [w // 4 + 30 + col * 50, h // 3 + 30 + row * 50, w // 4 + 60 + col * 50, h // 3 + 55 + row * 50],
                fill=ORANGE,
            )
    draw_truck(draw, w // 8, h // 2, w // 4, h // 3, body_color=CHARCOAL, cab_color=ORANGE)


def draw_single_item_pickup(img, draw):
    w, h = img.size
    draw.rectangle([0, 0, w, h], fill=CREAM)
    draw_furniture(draw, w // 3, h // 3, w // 3, h // 2, color=NAVY, cushion_color=WHITE)
    draw_truck(draw, w * 2 // 3 - 40, h // 2, w // 4, h // 4, body_color=CHARCOAL, cab_color=ORANGE)


def draw_specialty_item_removal(img, draw):
    w, h = img.size
    draw.rectangle([0, 0, w, h], fill=CREAM)
    draw_piano(draw, w // 3, h // 4, w // 4, h // 2, color=NAVY, key_color=WHITE)
    draw_hot_tub(draw, w * 2 // 3 - 40, h // 2, w // 4, h // 4, color=CHARCOAL)


def draw_team(img, draw):
    w, h = img.size
    draw.rectangle([0, 0, w, h], fill=NAVY)
    draw_people(draw, w // 4, h // 3, w // 2, h // 2, color=CREAM, count=2)
    draw_truck(draw, w * 3 // 4 - 60, h // 2, w // 4, h // 4, body_color=ORANGE, cab_color=CREAM)


def draw_process_quote(img, draw):
    w, h = img.size
    draw.rectangle([0, 0, w, h], fill=CREAM)
    draw_clipboard(draw, w // 3, h // 4, w // 3, h // 2, color=NAVY, paper_color=WHITE)


def draw_process_estimate(img, draw):
    w, h = img.size
    draw.rectangle([0, 0, w, h], fill=CREAM)
    draw_calendar(draw, w // 4, h // 4, w // 4, h // 2, color=NAVY)
    draw_clipboard(draw, w // 2 + 20, h // 3, w // 4, h // 3, color=ORANGE, paper_color=WHITE)


def draw_process_haul(img, draw):
    w, h = img.size
    draw.rectangle([0, 0, w, h], fill=NAVY)
    draw_truck(draw, w // 4, h // 3, w // 2, h // 3, body_color=ORANGE, cab_color=CREAM)


def draw_service_area(idx):
    def draw_fn(img, draw):
        w, h = img.size
        colors = [CREAM, NAVY, WHITE]
        bg = colors[idx % len(colors)]
        draw.rectangle([0, 0, w, h], fill=bg)
        # Neighborhood row
        house_colors = [NAVY, ORANGE, CHARCOAL, WHITE]
        for i, hx in enumerate(range(40, w - 100, 150)):
            hc = house_colors[(i + idx) % len(house_colors)]
            draw_house(draw, hx, h // 3, 120, 120, color=hc, roof_color=ORANGE if hc != ORANGE else NAVY, window_color=CREAM if hc in (NAVY, CHARCOAL) else NAVY)
        # Road
        draw.rectangle([0, h * 3 // 4, w, h], fill=CHARCOAL)
        draw_map_pins(draw, w // 4, h // 8, w // 2, h // 4, [ORANGE, NAVY])
    return draw_fn


def draw_before_after(before=True):
    def draw_fn(img, draw):
        w, h = img.size
        draw.rectangle([0, 0, w, h], fill=CREAM if before else WHITE)
        if before:
            draw_garage(draw, w // 6, h // 4, w // 4, h // 3, color=NAVY, door_color=ORANGE)
            draw_pile(draw, w // 3, h // 2, w // 2, h // 3, [ORANGE, CHARCOAL, SLATE, NAVY], count=12)
            draw_box(draw, w * 2 // 3, h // 3, 70, color=NAVY)
        else:
            draw_house(draw, w // 6, h // 4, w // 4, h // 3, color=NAVY, roof_color=ORANGE, window_color=CREAM)
            # Clean driveway
            draw.rectangle([w // 3, h * 2 // 3, w * 5 // 6, h * 5 // 6], fill=BORDER)
            draw_tree(draw, w * 2 // 3, h // 3, w // 5, h // 2, trunk_color=CHARCOAL, foliage_color=NAVY)
    return draw_fn


def draw_quote(img, draw):
    w, h = img.size
    draw.rectangle([0, 0, w, h], fill=NAVY)
    draw_clipboard(draw, w // 4, h // 3, w // 3, h // 3, color=ORANGE, paper_color=WHITE)
    draw_truck(draw, w * 2 // 3 - 40, h // 2, w // 4, h // 4, body_color=CREAM, cab_color=ORANGE)


def draw_schedule(img, draw):
    w, h = img.size
    draw.rectangle([0, 0, w, h], fill=CREAM)
    draw_calendar(draw, w // 4, h // 4, w // 3, h // 2, color=NAVY)
    draw_truck(draw, w * 2 // 3 - 40, h // 2, w // 4, h // 4, body_color=CHARCOAL, cab_color=ORANGE)


def draw_about_owner(img, draw):
    w, h = img.size
    draw.rectangle([0, 0, w, h], fill=NAVY)
    draw_people(draw, w // 3, h // 4, w // 3, h // 2, color=CREAM, count=1)


def draw_about_crew(img, draw):
    w, h = img.size
    draw.rectangle([0, 0, w, h], fill=CREAM)
    draw_people(draw, w // 4, h // 3, w // 2, h // 2, color=NAVY, count=3)
    draw_truck(draw, w * 3 // 4 - 80, h // 2, w // 4, h // 4, body_color=CHARCOAL, cab_color=ORANGE)


def draw_about_truck(img, draw):
    w, h = img.size
    draw.rectangle([0, 0, w, h], fill=NAVY)
    draw_truck(draw, w // 8, h // 3, w * 3 // 4, h // 3, body_color=ORANGE, cab_color=CREAM)


def draw_about_community(img, draw):
    w, h = img.size
    draw.rectangle([0, 0, w, h], fill=CREAM)
    for i, hx in enumerate(range(40, w - 100, 160)):
        hc = [NAVY, ORANGE, CHARCOAL, WHITE][i % 4]
        draw_house(draw, hx, h // 3, 130, 130, color=hc, roof_color=ORANGE if hc != ORANGE else NAVY, window_color=CREAM if hc in (NAVY, CHARCOAL) else NAVY)


def draw_contact(img, draw):
    w, h = img.size
    draw.rectangle([0, 0, w, h], fill=NAVY)
    draw_people(draw, w // 4, h // 3, w // 3, h // 2, color=CREAM, count=1)
    draw_truck(draw, w * 2 // 3 - 60, h // 2, w // 4, h // 4, body_color=ORANGE, cab_color=CREAM)


def draw_pricing(img, draw):
    w, h = img.size
    draw.rectangle([0, 0, w, h], fill=CREAM)
    draw_clipboard(draw, w // 4, h // 4, w // 3, h // 2, color=NAVY, paper_color=WHITE)
    # Dollar signs / price tags
    for i, x in enumerate(range(w * 2 // 3, w - 40, 60)):
        draw.rectangle([x, h // 3 + i * 30, x + 40, h // 3 + i * 30 + 24], fill=ORANGE if i % 2 else CHARCOAL)


def draw_final_cta(img, draw):
    w, h = img.size
    draw.rectangle([0, 0, w, h], fill=NAVY)
    draw_house(draw, w // 4, h // 3, w // 3, h // 2, color=WHITE, roof_color=ORANGE, window_color=NAVY)
    draw_truck(draw, w * 2 // 3 - 60, h // 2, w // 3, h // 3, body_color=ORANGE, cab_color=CREAM)


def draw_quick_quote(img, draw):
    w, h = img.size
    draw.rectangle([0, 0, w, h], fill=CREAM)
    draw_clipboard(draw, w // 4, h // 3, w // 3, h // 3, color=NAVY)
    draw_box(draw, w * 2 // 3, h // 2, 80, color=ORANGE)


def generate_placeholders():
    w, h = 1200, 800
    results = []

    results.append(make_placeholder(w, h, draw_hero, "tomei-hero-crew-placeholder.webp", "hero", "Tomei Haul Away crew and truck on a residential street"))
    results.append(make_placeholder(w, h, draw_quick_quote, "tomei-quick-quote-placeholder.webp", "pages", "Quick quote form illustration"))
    results.append(make_placeholder(w, h, draw_pricing, "tomei-pricing-placeholder.webp", "pages", "Honest upfront pricing estimate"))
    results.append(make_placeholder(w, h, draw_quote, "tomei-quote-placeholder.webp", "pages", "Request a free quote"))
    results.append(make_placeholder(w, h, draw_schedule, "tomei-schedule-placeholder.webp", "pages", "Schedule an appointment"))
    results.append(make_placeholder(w, h, draw_about_owner, "tomei-about-owner-placeholder.webp", "pages", "Owner of Tomei Haul Away"))
    results.append(make_placeholder(w, h, draw_about_crew, "tomei-about-crew-placeholder.webp", "pages", "Tomei Haul Away crew"))
    results.append(make_placeholder(w, h, draw_about_truck, "tomei-about-truck-placeholder.webp", "pages", "Tomei Haul Away truck and equipment"))
    results.append(make_placeholder(w, h, draw_about_community, "tomei-about-community-placeholder.webp", "pages", "Communities served by Tomei Haul Away"))
    results.append(make_placeholder(w, h, draw_contact, "tomei-contact-placeholder.webp", "pages", "Contact Tomei Haul Away"))
    results.append(make_placeholder(w, h, draw_final_cta, "tomei-final-cta-placeholder.webp", "pages", "Clean space after junk removal"))

    # Service images
    services = [
        ("furniture-removal", draw_furniture_removal),
        ("appliance-removal", draw_appliance_removal),
        ("garage-home-cleanouts", draw_garage_cleanout),
        ("estate-cleanouts", draw_estate_cleanout),
        ("yard-debris", draw_yard_debris),
        ("construction-renovation-debris", draw_construction_debris),
        ("storage-unit-cleanouts", draw_storage_unit_cleanout),
        ("commercial-junk-removal", draw_commercial_junk_removal),
        ("single-item-pickup", draw_single_item_pickup),
        ("specialty-item-removal", draw_specialty_item_removal),
    ]
    for slug, fn in services:
        results.append(make_placeholder(w, h, fn, f"tomei-service-{slug}-placeholder.webp", "services", f"{slug.replace('-', ' ').title()} service illustration"))

    # Gallery before/after pairs
    for i in range(1, 7):
        results.append(make_placeholder(w, h, draw_before_after(True), f"tomei-gallery-before-{i:02d}-placeholder.webp", "gallery", f"Before cleanup job {i}"))
        results.append(make_placeholder(w, h, draw_before_after(False), f"tomei-gallery-after-{i:02d}-placeholder.webp", "gallery", f"After cleanup job {i}"))

    results.append(make_placeholder(w, h, draw_team, "tomei-team-placeholder.webp", "team", "Tomei Haul Away team"))
    results.append(make_placeholder(w, h, draw_process_quote, "tomei-process-quote-placeholder.webp", "process", "Step 1: Request a quote"))
    results.append(make_placeholder(w, h, draw_process_estimate, "tomei-process-estimate-placeholder.webp", "process", "Step 2: Review your estimate"))
    results.append(make_placeholder(w, h, draw_process_haul, "tomei-process-haul-placeholder.webp", "process", "Step 3: We haul it away"))

    for idx in range(5):
        results.append(make_placeholder(w, h, draw_service_area(idx), f"tomei-service-area-{idx + 1:02d}-placeholder.webp", "service-areas", f"Service area neighborhood illustration {idx + 1}"))

    return results


def main():
    generate_logo_variations()
    generate_placeholders()
    print("Brand assets generated successfully.")


if __name__ == "__main__":
    main()
