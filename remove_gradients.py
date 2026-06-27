import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Replace background: 'linear-gradient(...)' inline styles
    # We want to find `linear-gradient(...)` and extract the first color
    # Regex to find linear-gradient(..., #hex ..., ...)
    def replacer(match):
        gradient_str = match.group(0)
        # Find the first color like #abc or #abcdef or rgb/rgba
        color_match = re.search(r'#[0-9a-fA-F]{3,6}|rgba?\([^)]+\)', gradient_str)
        if color_match:
            return color_match.group(0)
        return gradient_str

    new_content = re.sub(r'linear-gradient\([^)]+\)', replacer, content)

    # Also replace Tailwind gradient classes with bg-gray-900 (fallback) or parse them if possible.
    # But earlier I ran a grep for `bg-gradient-to` and it only found a few, which I already fixed, except maybe I missed some?
    # Let's run regex to remove bg-gradient-to-* and replace with a solid bg if needed,
    # actually, I'll just remove them or we can just use sed.
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith(('.tsx', '.ts', '.css', '.js')):
            process_file(os.path.join(root, file))
