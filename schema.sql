CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    magnet_type TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lead_magnets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    header TEXT NOT NULL,
    info TEXT,
    bullet_points TEXT,
    profile_photo TEXT,
    title TEXT,
    button_text TEXT,
    email_button_text TEXT,
    mail_content TEXT,
    pdf_url TEXT
);

CREATE TABLE IF NOT EXISTS admin (
    username TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS otp_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL,
    expires_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
INSERT OR IGNORE INTO lead_magnets (slug, header, info, bullet_points, profile_photo, title, button_text, mail_content) VALUES ('10k-roadmap', 'FREE RESOURCES', 'The exact framework used by top performers to rewire their mindset, build non-negotiable habits, and scale their business effortlessly.', 'The 3 mindset shifts required to break the 10K/mo barrier
Daily habits of high-performing entrepreneurs
How to eliminate procrastination and execute relentlessly', 'assets/john-atkins.jpeg', 'Scale to 10K with the Roadmap', 'Send Me the Roadmap', 'Here is your Scale to 10K with the Roadmap. *Click here to download*.');
INSERT OR IGNORE INTO lead_magnets (slug, header, info, bullet_points, profile_photo, title, button_text, mail_content) VALUES ('elevate-blueprint', 'FREE RESOURCES', 'The exact framework used by top performers to rewire their mindset, build non-negotiable habits, and scale their business effortlessly.', 'The 3 mindset shifts required to elevate your thinking
How to break through limiting beliefs blocking your growth
Daily habits for an unstoppable and bulletproof mindset', 'assets/john-atkins.jpeg', 'Master your Mindset with the Elevate Blueprint', 'Send Me the Blueprint', 'Here is your Master your Mindset with the Elevate Blueprint. *Click here to download*.');
INSERT OR IGNORE INTO lead_magnets (slug, header, info, bullet_points, profile_photo, title, button_text, mail_content) VALUES ('identity-upgrade', 'FREE RESOURCES', 'The exact framework used by top performers to upgrade their self-image, align with their highest goals, and step into their true potential.', 'How to upgrade your self-image to match your most ambitious goals
The mindset shift required to align your actions with your true potential
Daily habits for reinforcing and cementing your new identity', 'assets/john-atkins.jpeg', 'Transform Your Self-Image with the Identity Upgrade', 'Send Me the Blueprint', 'Here is your Transform Your Self-Image with the Identity Upgrade. *Click here to download*.');
INSERT OR IGNORE INTO lead_magnets (slug, header, info, bullet_points, profile_photo, title, button_text, mail_content) VALUES ('momentum-method', 'FREE RESOURCES', 'The exact framework used by top performers to eliminate procrastination, execute relentlessly, and maintain unstoppable momentum in their business and life.', 'How to eliminate procrastination and execute relentlessly
The secret to maintaining consistency even when motivation drops
Daily habits to build and sustain unstoppable momentum', 'assets/john-atkins.jpeg', 'Build Unstoppable Consistency with the Momentum Method', 'Send Me the Method', 'Here is your Build Unstoppable Consistency with the Momentum Method. *Click here to download*.');
INSERT OR IGNORE INTO lead_magnets (slug, header, info, bullet_points, profile_photo, title, button_text, mail_content) VALUES ('morning-routine', 'FREE RESOURCES', 'The exact morning routine behind sharper focus, faster decisions, and the kind of momentum that changes everything for high-performing entrepreneurs.', 'The 7-step morning process top performers use to win the day
How to activate the identity of your goal achieved every morning
The simple routine that turns chaos into clarity - in 15 minutes or less', 'assets/john-atkins.jpeg', 'Win the Day with the CEO Morning Routine', 'Send Me the Routine', 'Here is your Win the Day with the CEO Morning Routine. *Click here to download*.');
