import re
import json

files = ["10k-roadmap.html", "elevate-blueprint.html", "identity-upgrade.html", "momentum-method.html", "morning-routine.html"]

magnets = []

for f in files:
    with open(f, 'r') as file:
        content = file.read()
    
    slug = f.replace('.html', '')
    
    h1_match = re.search(r'<h1[^>]*>(.*?)</h1>', content, re.DOTALL)
    title = h1_match.group(1).replace('<span class="text-teal">', '').replace('</span>', '').strip() if h1_match else ''
    
    info_match = re.search(r'<p style="font-size: 1.15rem[^>]*>(.*?)</p>', content, re.DOTALL)
    info = info_match.group(1).strip() if info_match else ''
    
    bullets_match = re.search(r'<ul class="benefits-list"[^>]*>(.*?)</ul>', content, re.DOTALL)
    if bullets_match:
        bullets_raw = bullets_match.group(1)
        bullets = re.findall(r'<li[^>]*>(.*?)</li>', bullets_raw, re.DOTALL)
        bullets_str = '\n'.join([b.strip() for b in bullets])
    else:
        bullets_str = ''
        
    btn_match = re.search(r'<button type="submit"[^>]*>\s*(.*?)\s*<', content, re.DOTALL)
    btn_text = btn_match.group(1).strip() if btn_match else ''
    
    header = 'FREE RESOURCES'
    
    mail_content = f"Here is your {title}. *Click here to download*."

    magnets.append({
        'slug': slug,
        'header': header,
        'title': title,
        'info': info,
        'bullet_points': bullets_str,
        'profile_photo': 'assets/john-atkins.jpeg',
        'button_text': btn_text,
        'mail_content': mail_content
    })

with open('seed.sql', 'w') as f:
    for m in magnets:
        info_safe = m['info'].replace("'", "''")
        bullets_safe = m['bullet_points'].replace("'", "''")
        title_safe = m['title'].replace("'", "''")
        mail_safe = m['mail_content'].replace("'", "''")
        f.write(f"INSERT OR IGNORE INTO lead_magnets (slug, header, info, bullet_points, profile_photo, title, button_text, mail_content) VALUES ('{m['slug']}', '{m['header']}', '{info_safe}', '{bullets_safe}', '{m['profile_photo']}', '{title_safe}', '{m['button_text']}', '{mail_safe}');\n")

print("seed.sql generated")
