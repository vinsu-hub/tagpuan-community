from pathlib import Path
from PIL import Image

root = Path('/home/ubuntu/tagpuan-community/client/public/assets/tagpuan')
files = sorted(root.glob('*.png'))
for source in files:
    target = source.with_suffix('.webp')
    with Image.open(source) as image:
        image = image.convert('RGB')
        image.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
        image.save(target, 'WEBP', quality=78, method=6)
        print(f'{source.name} -> {target.name} ({target.stat().st_size} bytes)')
