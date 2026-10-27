"""Download the pictures of the old site (flow.unist.ac.kr) into the new site folder.

How to run (from the top folder of the site, the one that has index.html):
    python tools/fetch_images.py

- It reads tools/image_list.csv and saves each picture at the path in the "file" column.
- Pictures that are already there are skipped, so it is safe to run again.
- Photo-board pictures (images/photo/) are shrunk to 1600 px wide when Pillow is installed
  (pip install pillow). Without Pillow they are saved at full size.
- Run it before the old site is shut down.
"""
import csv
import io
import os
import sys
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIST = os.path.join(ROOT, 'tools', 'image_list.csv')
PHOTO_MAX_WIDTH = 1600

try:
    from PIL import Image
except ImportError:
    Image = None


def download(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def validate(data):
    # Some old-server error pages return HTTP 200, even for missing pictures.
    if Image is not None:
        with Image.open(io.BytesIO(data)) as im:
            im.verify()
    elif not data.startswith((b'\xff\xd8\xff', b'\x89PNG\r\n\x1a\n', b'GIF87a', b'GIF89a', b'BM', b'RIFF')):
        raise ValueError('Response is not a supported image (possibly an HTML error page)')


def shrink(path):
    if Image is None or not path.lower().endswith(('.jpg', '.jpeg', '.png')):
        return
    with Image.open(path) as im:
        if im.width <= PHOTO_MAX_WIDTH:
            return
        h = round(im.height * PHOTO_MAX_WIDTH / im.width)
        small = im.convert('RGB').resize((PHOTO_MAX_WIDTH, h), Image.LANCZOS)
    small.save(path, quality=85, optimize=True, progressive=True)


def main():
    with open(LIST, encoding='utf-8-sig', newline='') as f:
        rows = list(csv.DictReader(f))
    done, skipped, failed = 0, 0, []
    for i, row in enumerate(rows, 1):
        path = os.path.join(ROOT, row['file'])
        if os.path.exists(path):
            try:
                with open(path, 'rb') as existing:
                    validate(existing.read())
            except Exception:
                print(f'Retrying invalid image: {row["file"]}')
            else:
                skipped += 1
                continue
        os.makedirs(os.path.dirname(path), exist_ok=True)
        data, last = None, 'no address'
        for url in (row['source_url'], row.get('fallback_url', '')):
            if not url:
                continue
            try:
                candidate = download(url)
                validate(candidate)
                data = candidate
                break
            except Exception as e:
                last = f'{url} ({e})'
        if data is None:
            failed.append(f"{row['file']}  <-  {last}")
            continue
        # Preserve the extension so Pillow can determine the output format.
        base, ext = os.path.splitext(path)
        temporary = base + '.download' + ext
        try:
            with open(temporary, 'wb') as out:
                out.write(data)
            if row['file'].startswith('images/photo/'):
                shrink(temporary)
            os.replace(temporary, path)
        except Exception as e:
            failed.append(f"{row['file']}  <-  save/resize error ({e})")
            if os.path.exists(temporary):
                os.remove(temporary)
            continue
        done += 1
        print(f'[{i}/{len(rows)}] {row["file"]}')
    print(f'\nSaved {done}, already there {skipped}, failed {len(failed)}')
    for line in failed:
        print('  FAILED', line)
    return 1 if failed else 0


if __name__ == '__main__':
    sys.exit(main())
