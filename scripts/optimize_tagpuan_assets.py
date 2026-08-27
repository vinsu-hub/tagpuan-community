from pathlib import Path
from PIL import Image

source_root = Path('/home/ubuntu/webdev-static-assets')
target_root = Path('/home/ubuntu/tagpuan-community/client/public/assets/tagpuan')
logo_sources = {
    'tagpuanlogotransparent.png': 'tagpuan-lockup.webp',
    'TYPOGRAPHYONLY.png': 'tagpuan-type.webp',
    'LOGOONLY.png': 'tagpuan-hut.webp',
}
for source_name, target_name in logo_sources.items():
    source = source_root / source_name
    target = target_root / target_name
    with Image.open(source) as image:
        image = image.convert('RGBA')
        image.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
        image.save(target, 'WEBP', lossless=True, method=6)
        print(f'{source_name} -> {target_name} ({target.stat().st_size} bytes, mode={image.mode})')
