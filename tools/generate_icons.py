import os

from PIL import Image, ImageDraw


def create_gradient(width: int, height: int, c1: tuple[int, int, int], c2: tuple[int, int, int]) -> Image.Image:
    image = Image.new("RGB", (width, height), c1)
    draw = ImageDraw.Draw(image)
    for y in range(height):
        r, g, b = [int(c1[i] + (c2[i] - c1[i]) * y / height) for i in range(3)]
        draw.line([(0, y), (width, y)], fill=(r, g, b))
    return image


def generate_assets() -> None:
    target_dir = "custom_components/climate_dashboard"
    os.makedirs(target_dir, exist_ok=True)

    # Colors (Dark Slate to Blue/Orange)
    # Slate: #1c1c1e -> (28, 28, 30)
    # Gradient to lighter: #2c2c2e -> (44, 44, 46)
    # Let's do a vibrant gradient for the ICON
    # Orange: #FF9500 (255, 149, 0)
    # Red/Orange: #FF3B30 (255, 59, 48)

    c1 = (255, 149, 0)  # Orange
    c2 = (255, 59, 48)  # Red

    size = 512
    icon = create_gradient(size, size, c1, c2)
    draw = ImageDraw.Draw(icon)

    # Draw "CD" text
    # Try to use a large default font or rectangle since specific fonts might not be available
    # We will draw a simple Thermostat-like circle

    center = size // 2
    radius = size // 3

    # White Circle Outline
    draw.ellipse((center - radius, center - radius, center + radius, center + radius), outline="white", width=20)

    # Inner dot
    dot_r = 40
    draw.ellipse((center - dot_r, center - dot_r, center + dot_r, center + dot_r), fill="white")

    # Ticks
    import math

    for i in range(0, 360, 45):
        angle = math.radians(i)
        start_r = radius - 40
        end_r = radius - 10

        x1 = center + start_r * math.cos(angle)
        y1 = center + start_r * math.sin(angle)
        x2 = center + end_r * math.cos(angle)
        y2 = center + end_r * math.sin(angle)

        draw.line([(x1, y1), (x2, y2)], fill="white", width=10)

    # Save Icon
    icon_path = os.path.join(target_dir, "icon.png")
    icon.save(icon_path)
    print(f"Generated {icon_path}")

    # Save Logo (Same for now)
    logo_path = os.path.join(target_dir, "logo.png")
    icon.save(logo_path)
    print(f"Generated {logo_path}")


if __name__ == "__main__":
    generate_assets()
