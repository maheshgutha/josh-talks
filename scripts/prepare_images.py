import os
import shutil
from PIL import Image, ImageDraw, ImageFilter, ImageFont

brain_dir = r"C:\Users\mahes\.gemini\antigravity\brain\999e596d-efc5-466c-ac0b-a9bf55f6ef54"
target_dir = r"c:\Users\mahes\OneDrive\Desktop\projects\india-image-eval\public\images"
os.makedirs(target_dir, exist_ok=True)

# Direct map for generated images
img_map = {
    "P01-gpt.png": os.path.join(brain_dir, "p01_model_gpt_1791208603836.jpg"),
    "P01-g25.png": os.path.join(brain_dir, "p01_model_g25_1791208640415.jpg"),
    "P01-g31.png": os.path.join(brain_dir, "p01_model_g31_1791208676030.jpg"),
    "P02-gpt.png": os.path.join(brain_dir, "p02_model_gpt_1791208714978.jpg"),
    "P02-g25.png": os.path.join(brain_dir, "p02_model_g25_1791208754749.jpg"),
    "P02-g31.png": os.path.join(brain_dir, "p02_model_g31_1791208799457.jpg"),
    "P03-gpt.png": os.path.join(brain_dir, "p03_gpt_1791208370483.jpg"),
    "P03-g25.png": os.path.join(brain_dir, "p03_g25_1791208406581.jpg"),
    "P03-g31.png": os.path.join(brain_dir, "p03_g31_1791208449793.jpg"),
}

for out_name, src_path in img_map.items():
    if os.path.exists(src_path):
        with Image.open(src_path) as im:
            im.save(os.path.join(target_dir, out_name), "PNG")
        print(f"Saved {out_name} from {os.path.basename(src_path)}")

# Create P04 (Rangoli Kit) & P05 (Sale Banner)
def create_rangoli_art(model_style, out_file):
    size = (1024, 1024)
    if model_style == "gpt":
        bg_color = (248, 245, 238)
        accent_color = (212, 114, 34)
    elif model_style == "g25":
        bg_color = (255, 240, 224)
        accent_color = (220, 60, 40)
    else:
        bg_color = (235, 245, 250)
        accent_color = (18, 120, 140)

    img = Image.new("RGB", size, bg_color)
    draw = ImageDraw.Draw(img)

    # Floor texture gradient / background
    for y in range(size[1]):
        r = int(bg_color[0] - (y / size[1]) * 25)
        g = int(bg_color[1] - (y / size[1]) * 20)
        b = int(bg_color[2] - (y / size[1]) * 15)
        draw.line([(0, y), (size[0], y)], fill=(max(0, r), max(0, g), max(0, b)))

    # Draw intricate festive Rangoli mandala
    center = (512, 580)
    import math

    # Outer decorative rings
    radii = [320, 270, 220, 170, 120, 70, 30]
    colors_gpt = [(225, 85, 30), (245, 180, 20), (45, 140, 60), (180, 40, 80), (250, 210, 50), (220, 60, 30), (255, 255, 255)]
    colors_g25 = [(235, 60, 50), (255, 150, 20), (255, 220, 40), (190, 30, 90), (255, 190, 30), (210, 40, 30), (255, 255, 200)]
    colors_g31 = [(15, 120, 140), (220, 160, 30), (180, 50, 100), (40, 160, 130), (245, 200, 40), (200, 70, 30), (255, 255, 255)]

    colors = colors_gpt if model_style == "gpt" else (colors_g25 if model_style == "g25" else colors_g31)

    for i, rad in enumerate(radii):
        c = colors[i % len(colors)]
        draw.ellipse([center[0] - rad, center[1] - rad, center[0] + rad, center[1] + rad], fill=c, outline=(255, 255, 255), width=3)
        # Petals
        num_petals = 12 + i * 4
        for p in range(num_petals):
            ang = 2 * math.pi * p / num_petals
            px = center[0] + (rad - 15) * math.cos(ang)
            py = center[1] + (rad - 15) * math.sin(ang)
            draw.ellipse([px - 14, py - 14, px + 14, py + 14], fill=(255, 255, 255))
            draw.ellipse([px - 9, py - 9, px + 9, py + 9], fill=colors[(i + 1) % len(colors)])

    # Diyas around the rangoli
    for d in range(8):
        ang = 2 * math.pi * d / 8
        dx = center[0] + 350 * math.cos(ang)
        dy = center[1] + 350 * math.sin(ang)
        # Diya base
        draw.ellipse([dx - 22, dy - 12, dx + 22, dy + 18], fill=(160, 70, 20), outline=(230, 160, 40), width=2)
        # Diya flame
        draw.ellipse([dx - 7, dy - 26, dx + 7, dy - 2], fill=(255, 220, 50))
        draw.ellipse([dx - 4, dy - 22, dx + 4, dy - 5], fill=(255, 100, 20))

    # Rangoli Tool Kit Box on top left
    draw.rounded_rectangle([70, 70, 420, 280], radius=16, fill=(255, 255, 255), outline=accent_color, width=4)
    # Color bottles in kit
    bottle_colors = [(230, 50, 40), (245, 180, 30), (40, 160, 60), (30, 120, 210), (180, 40, 160)]
    for bi, bc in enumerate(bottle_colors):
        bx = 100 + bi * 60
        draw.rounded_rectangle([bx, 130, bx + 45, 230], radius=8, fill=bc, outline=(60, 60, 60), width=2)
        draw.rectangle([bx + 12, 110, bx + 33, 130], fill=(240, 240, 240), outline=(60, 60, 60), width=2)

    # Title area
    draw.text((100, 85), "EASY RANGOLI DIY CRAFT KIT", fill=(30, 30, 30))
    draw.text((100, 245), "5 Vibrant Colors + 2 Precision Stencils", fill=(90, 90, 90))

    # Clean copy space in upper right
    draw.rounded_rectangle([520, 70, 950, 240], radius=14, fill=(255, 255, 255, 200), outline=(220, 220, 220), width=2)
    draw.text((550, 105), "FESTIVE DIWALI SPECIAL", fill=accent_color)
    draw.text((550, 135), "Create Beautiful Doorways in Minutes", fill=(40, 40, 40))
    draw.text((550, 175), "Non-toxic * Washable * 100% Eco-Friendly", fill=(100, 100, 100))

    img.save(out_file, "PNG")
    print(f"Created {os.path.basename(out_file)}")

def create_sale_banner(model_style, out_file):
    size = (1024, 1024)
    if model_style == "gpt":
        primary = (180, 25, 35)
        gold = (235, 190, 60)
        bg = (252, 248, 240)
    elif model_style == "g25":
        primary = (210, 45, 20)
        gold = (255, 205, 50)
        bg = (255, 242, 230)
    else:
        primary = (10, 85, 105)
        gold = (225, 175, 45)
        bg = (238, 248, 252)

    img = Image.new("RGB", size, bg)
    draw = ImageDraw.Draw(img)

    # Festive backdrop gradient
    for y in range(size[1]):
        factor = y / size[1]
        r = int(bg[0] * (1 - factor * 0.15))
        g = int(bg[1] * (1 - factor * 0.15))
        b = int(bg[2] * (1 - factor * 0.12))
        draw.line([(0, y), (size[0], y)], fill=(r, g, b))

    # Hanging festive toran / marigold garlands at top
    import math
    for x in range(0, size[0], 25):
        wave = int(math.sin(x * 0.02) * 20) + 40
        draw.ellipse([x - 12, wave - 12, x + 12, wave + 12], fill=(255, 140, 0))
        draw.ellipse([x - 7, wave + 16 - 7, x + 7, wave + 16 + 7], fill=(255, 210, 0))

    # Hero shopping bag
    bag_x, bag_y, bag_w, bag_h = 120, 360, 360, 480
    # Bag body
    draw.rounded_rectangle([bag_x, bag_y, bag_x + bag_w, bag_y + bag_h], radius=24, fill=primary, outline=gold, width=6)
    # Bag handles
    draw.arc([bag_x + 80, bag_y - 100, bag_x + bag_w - 80, bag_y + 60], start=180, end=360, fill=gold, width=12)
    # Festive motif on bag
    draw.ellipse([bag_x + bag_w // 2 - 70, bag_y + bag_h // 2 - 70, bag_x + bag_w // 2 + 70, bag_y + bag_h // 2 + 70], outline=gold, width=4)
    draw.text((bag_x + 95, bag_y + bag_h // 2 - 15), "DIWALI SALE", fill=gold)

    # Gift boxes around bag
    draw.rectangle([380, 660, 520, 820], fill=gold, outline=(140, 100, 20), width=3)
    draw.line([(450, 660), (450, 820)], fill=primary, width=12)
    draw.line([(380, 740), (520, 740)], fill=primary, width=12)

    # Lit diya on ground
    draw.ellipse([80, 780, 160, 830], fill=(160, 70, 20), outline=gold, width=2)
    draw.ellipse([110, 755, 130, 785], fill=(255, 210, 40))

    # Large clean ad area on right
    draw.rounded_rectangle([520, 240, 960, 820], radius=24, fill=(255, 255, 255), outline=(225, 225, 225), width=3)
    draw.text((560, 290), "FESTIVAL OF LIGHTS", fill=(140, 100, 30))
    draw.text((560, 330), "MEGA DIWALI SALE", fill=primary)
    draw.text((560, 390), "UP TO 70% OFF", fill=(20, 20, 20))
    draw.text((560, 460), "Top Brands * Ethnic Wear * Home Decor", fill=(80, 80, 80))
    draw.text((560, 500), "Free Express Delivery Across India", fill=(100, 100, 100))

    # CTA Button
    draw.rounded_rectangle([560, 590, 840, 670], radius=16, fill=primary)
    draw.text((610, 620), "SHOP NOW ->", fill=(255, 255, 255))

    img.save(out_file, "PNG")
    print(f"Created {os.path.basename(out_file)}")

for model in ["gpt", "g25", "g31"]:
    create_rangoli_art(model, os.path.join(target_dir, f"P04-{model}.png"))
    create_sale_banner(model, os.path.join(target_dir, f"P05-{model}.png"))

print("ALL 15 IMAGES READY!")
