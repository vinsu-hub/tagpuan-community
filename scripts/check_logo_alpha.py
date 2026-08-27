from pathlib import Path
from PIL import Image

root = Path('/home/ubuntu/webdev-static-assets')
for name in ['tagpuanlogotransparent', 'TYPOGRAPHYONLY', 'LOGOONLY']:
    print(f'[{name}]')
    for suffix in ('.png',):
        path = root / f'{name}{suffix}'
        if not path.exists():
            continue
        with Image.open(path) as image:
            alpha = image.getchannel('A') if 'A' in image.getbands() else None
            if alpha is None:
                print(f'  {suffix}: mode={image.mode}, no alpha channel')
            else:
                extrema = alpha.getextrema()
                transparent = sum(1 for value in alpha.getdata() if value == 0)
                print(f'  {suffix}: mode={image.mode}, alpha={extrema}, transparent_pixels={transparent}')
