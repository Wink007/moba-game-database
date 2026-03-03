import os, re, glob

REPLACEMENTS = [
    # Backgrounds - dark page (8,15,28)
    (r'rgba\(8,\s*15,\s*28,\s*0\.65\)',    'var(--clr-bg-page-65)'),
    (r'rgba\(8,\s*15,\s*28,\s*0\.7\)',     'var(--clr-bg-page-70)'),
    (r'rgba\(8,\s*15,\s*28,\s*0\.8\)',     'var(--clr-bg-page-80)'),
    (r'rgba\(8,\s*15,\s*28,\s*0\.85\)',    'var(--clr-bg-page-85)'),
    (r'rgba\(8,\s*15,\s*28,\s*0\.9\)',     'var(--clr-bg-page-90)'),
    (r'rgba\(8,\s*15,\s*28,\s*0\.95\)',    'var(--clr-bg-page-95)'),
    # Overlay (15,23,42)
    (r'rgba\(15,\s*23,\s*42,\s*0\.3\)',    'var(--clr-overlay-30)'),
    (r'rgba\(15,\s*23,\s*42,\s*0\.4\)',    'var(--clr-overlay-40)'),
    (r'rgba\(15,\s*23,\s*42,\s*0\.5\)',    'var(--clr-overlay-50)'),
    (r'rgba\(15,\s*23,\s*42,\s*0\.6\)',    'var(--clr-overlay-60)'),
    (r'rgba\(15,\s*23,\s*42,\s*0\.7\)',    'var(--clr-overlay-70)'),
    (r'rgba\(15,\s*23,\s*42,\s*0\.8\)',    'var(--clr-overlay-80)'),
    (r'rgba\(15,\s*23,\s*42,\s*0\.9\)',    'var(--clr-overlay-90)'),
    (r'rgba\(15,\s*23,\s*42,\s*0\.95\)',   'var(--clr-overlay-95)'),
    # Cards (30,41,59)
    (r'rgba\(30,\s*41,\s*59,\s*0\.3\)',    'var(--clr-bg-card-30)'),
    (r'rgba\(30,\s*41,\s*59,\s*0\.35\)',   'var(--clr-bg-card-35)'),
    (r'rgba\(30,\s*41,\s*59,\s*0\.4\)',    'var(--clr-bg-card-40)'),
    (r'rgba\(30,\s*41,\s*59,\s*0\.45\)',   'var(--clr-bg-card-45)'),
    (r'rgba\(30,\s*41,\s*59,\s*0\.5\)',    'var(--clr-bg-card-50)'),
    (r'rgba\(30,\s*41,\s*59,\s*0\.55\)',   'var(--clr-bg-card-55)'),
    (r'rgba\(30,\s*41,\s*59,\s*0\.6\)',    'var(--clr-bg-card-60)'),
    (r'rgba\(30,\s*41,\s*59,\s*0\.65\)',   'var(--clr-bg-card-65)'),
    (r'rgba\(30,\s*41,\s*59,\s*0\.7\)',    'var(--clr-bg-card-70)'),
    (r'rgba\(30,\s*41,\s*59,\s*0\.75\)',   'var(--clr-bg-card-75)'),
    (r'rgba\(30,\s*41,\s*59,\s*0\.8\)',    'var(--clr-bg-card-80)'),
    (r'rgba\(30,\s*41,\s*59,\s*0\.85\)',   'var(--clr-bg-card-85)'),
    (r'rgba\(30,\s*41,\s*59,\s*0\.9\)',    'var(--clr-bg-card-90)'),
    (r'rgba\(30,\s*58,\s*108,\s*0\.\d+\)', 'var(--clr-accent-card)'),
    # Hex backgrounds
    (r'#0f172a\b',  'var(--clr-bg-page)'),
    (r'#1e293b\b',  'var(--clr-bg-base)'),
    (r'#243447\b',  'var(--clr-bg-elevated)'),
    (r'#152234\b',  'var(--clr-bg-deep)'),
    (r'#0d1b2e\b',  'var(--clr-bg-deeper)'),
    (r'#0a1628\b',  'var(--clr-bg-deepest)'),
    (r'#162032\b',  'var(--clr-bg-deep)'),
    (r'#1a2d42\b',  'var(--clr-bg-elevated)'),
    (r'#1c2f45\b',  'var(--clr-bg-elevated)'),
    (r'#1a2744\b',  'var(--clr-bg-elevated)'),
    (r'#0d1e30\b',  'var(--clr-bg-deep)'),
    (r'#0e1e32\b',  'var(--clr-bg-deep)'),
    (r'#0d1f33\b',  'var(--clr-bg-deep)'),
    (r'#1b2d3e\b',  'var(--clr-bg-elevated)'),
    (r'#182840\b',  'var(--clr-bg-deep)'),
    (r'#2d3f53\b',  'var(--clr-bg-elevated)'),
    # Text
    (r'(?<!#)#ffffff\b',  'var(--clr-text-1)'),
    (r'(?<!#)#fff\b',     'var(--clr-text-1)'),
    (r'#e2e8f0\b',  'var(--clr-text-2)'),
    (r'#cbd5e1\b',  'var(--clr-text-3b)'),
    (r'#bcc9d8\b',  'var(--clr-text-3)'),
    (r'#94a3b8\b',  'var(--clr-text-4)'),
    (r'#64748b\b',  'var(--clr-text-5)'),
    (r'#475569\b',  'var(--clr-text-5)'),
    (r'#334155\b',  'var(--clr-text-5)'),
    # Accent blue
    (r'#60a5fa\b',  'var(--clr-accent)'),
    (r'#3b82f6\b',  'var(--clr-accent-deep)'),
    (r'#2563eb\b',  'var(--clr-accent-deep)'),
    (r'#93c5fd\b',  'var(--clr-accent)'),
    # rgba accent (96,165,250)
    (r'rgba\(96,\s*165,\s*250,\s*0\.04\)', 'var(--clr-accent-04)'),
    (r'rgba\(96,\s*165,\s*250,\s*0\.05\)', 'var(--clr-accent-05)'),
    (r'rgba\(96,\s*165,\s*250,\s*0\.06\)', 'var(--clr-accent-06)'),
    (r'rgba\(96,\s*165,\s*250,\s*0\.07\)', 'var(--clr-accent-07)'),
    (r'rgba\(96,\s*165,\s*250,\s*0\.08\)', 'var(--clr-accent-08)'),
    (r'rgba\(96,\s*165,\s*250,\s*0\.1(?!\d)\)', 'var(--clr-accent-10)'),
    (r'rgba\(96,\s*165,\s*250,\s*0\.10\)', 'var(--clr-accent-10)'),
    (r'rgba\(96,\s*165,\s*250,\s*0\.12\)', 'var(--clr-accent-12)'),
    (r'rgba\(96,\s*165,\s*250,\s*0\.15\)', 'var(--clr-accent-15)'),
    (r'rgba\(96,\s*165,\s*250,\s*0\.18\)', 'var(--clr-accent-18)'),
    (r'rgba\(96,\s*165,\s*250,\s*0\.2(?!\d)\)', 'var(--clr-accent-20)'),
    (r'rgba\(96,\s*165,\s*250,\s*0\.20\)', 'var(--clr-accent-20)'),
    (r'rgba\(96,\s*165,\s*250,\s*0\.25\)', 'var(--clr-accent-25)'),
    (r'rgba\(96,\s*165,\s*250,\s*0\.3(?!\d)\)', 'var(--clr-accent-30)'),
    (r'rgba\(96,\s*165,\s*250,\s*0\.30\)', 'var(--clr-accent-30)'),
    (r'rgba\(96,\s*165,\s*250,\s*0\.4\)',  'var(--clr-accent-40)'),
    (r'rgba\(96,\s*165,\s*250,\s*0\.5\)',  'var(--clr-accent-50)'),
    # Borders (148,163,184)
    (r'rgba\(148,\s*163,\s*184,\s*0\.04\)', 'var(--clr-border-04)'),
    (r'rgba\(148,\s*163,\s*184,\s*0\.05\)', 'var(--clr-border-05)'),
    (r'rgba\(148,\s*163,\s*184,\s*0\.06\)', 'var(--clr-border-1)'),
    (r'rgba\(148,\s*163,\s*184,\s*0\.07\)', 'var(--clr-border-07)'),
    (r'rgba\(148,\s*163,\s*184,\s*0\.08\)', 'var(--clr-border-2)'),
    (r'rgba\(148,\s*163,\s*184,\s*0\.1(?!\d)\)', 'var(--clr-border-3)'),
    (r'rgba\(148,\s*163,\s*184,\s*0\.10\)', 'var(--clr-border-3)'),
    (r'rgba\(148,\s*163,\s*184,\s*0\.12\)', 'var(--clr-border-4)'),
    (r'rgba\(148,\s*163,\s*184,\s*0\.15\)', 'var(--clr-border-5)'),
    (r'rgba\(148,\s*163,\s*184,\s*0\.2(?!\d)\)', 'var(--clr-border-6)'),
    (r'rgba\(148,\s*163,\s*184,\s*0\.20\)', 'var(--clr-border-6)'),
    (r'rgba\(148,\s*163,\s*184,\s*0\.25\)', 'var(--clr-border-25)'),
    (r'rgba\(148,\s*163,\s*184,\s*0\.3(?!\d)\)', 'var(--clr-border-30)'),
    (r'rgba\(148,\s*163,\s*184,\s*0\.30\)', 'var(--clr-border-30)'),
    (r'rgba\(148,\s*163,\s*184,\s*0\.4\)',  'var(--clr-border-40)'),
    (r'rgba\(148,\s*163,\s*184,\s*0\.5(?!\d)\)', 'var(--clr-border-7)'),
    (r'rgba\(148,\s*163,\s*184,\s*0\.50\)', 'var(--clr-border-7)'),
    (r'rgba\(148,\s*163,\s*184,\s*0\.6\)',  'var(--clr-border-8)'),
    (r'rgba\(148,\s*163,\s*184,\s*0\.7\)',  'var(--clr-border-9)'),
    # Surfaces (71,85,105)
    (r'rgba\(71,\s*85,\s*105,\s*0\.1(?!\d)\)',  'var(--clr-surface-1b)'),
    (r'rgba\(71,\s*85,\s*105,\s*0\.15\)',  'var(--clr-surface-1c)'),
    (r'rgba\(71,\s*85,\s*105,\s*0\.2(?!\d)\)',  'var(--clr-surface-1)'),
    (r'rgba\(71,\s*85,\s*105,\s*0\.20\)',  'var(--clr-surface-1)'),
    (r'rgba\(71,\s*85,\s*105,\s*0\.25\)',  'var(--clr-surface-25)'),
    (r'rgba\(71,\s*85,\s*105,\s*0\.3(?!\d)\)',  'var(--clr-surface-2)'),
    (r'rgba\(71,\s*85,\s*105,\s*0\.30\)',  'var(--clr-surface-2)'),
    (r'rgba\(71,\s*85,\s*105,\s*0\.4\)',   'var(--clr-surface-3)'),
    (r'rgba\(71,\s*85,\s*105,\s*0\.5\)',   'var(--clr-surface-4)'),
    # White overlays
    (r'rgba\(255,\s*255,\s*255,\s*0\.03\)', 'var(--clr-white-03)'),
    (r'rgba\(255,\s*255,\s*255,\s*0\.04\)', 'var(--clr-white-04)'),
    (r'rgba\(255,\s*255,\s*255,\s*0\.05\)', 'var(--clr-white-05)'),
    (r'rgba\(255,\s*255,\s*255,\s*0\.06\)', 'var(--clr-white-06)'),
    (r'rgba\(255,\s*255,\s*255,\s*0\.07\)', 'var(--clr-white-07)'),
    (r'rgba\(255,\s*255,\s*255,\s*0\.08\)', 'var(--clr-white-08)'),
    (r'rgba\(255,\s*255,\s*255,\s*0\.1(?!\d)\)', 'var(--clr-white-10)'),
    (r'rgba\(255,\s*255,\s*255,\s*0\.10\)', 'var(--clr-white-10)'),
    (r'rgba\(255,\s*255,\s*255,\s*0\.12\)', 'var(--clr-white-12)'),
    (r'rgba\(255,\s*255,\s*255,\s*0\.15\)', 'var(--clr-white-15)'),
    (r'rgba\(255,\s*255,\s*255,\s*0\.2(?!\d)\)', 'var(--clr-white-20)'),
    (r'rgba\(255,\s*255,\s*255,\s*0\.20\)', 'var(--clr-white-20)'),
    (r'rgba\(255,\s*255,\s*255,\s*0\.25\)', 'var(--clr-white-25)'),
    (r'rgba\(255,\s*255,\s*255,\s*0\.3(?!\d)\)', 'var(--clr-white-30)'),
    (r'rgba\(255,\s*255,\s*255,\s*0\.4\)',  'var(--clr-white-40)'),
    (r'rgba\(255,\s*255,\s*255,\s*0\.5(?!\d)\)', 'var(--clr-white-50)'),
    (r'rgba\(255,\s*255,\s*255,\s*0\.6\)',  'var(--clr-white-60)'),
    (r'rgba\(255,\s*255,\s*255,\s*0\.7(?!\d)\)', 'var(--clr-white-70)'),
    (r'rgba\(255,\s*255,\s*255,\s*0\.75\)', 'var(--clr-white-75)'),
    (r'rgba\(255,\s*255,\s*255,\s*0\.8(?!\d)\)', 'var(--clr-white-80)'),
    (r'rgba\(255,\s*255,\s*255,\s*0\.9(?!\d)\)', 'var(--clr-white-90)'),
    # Black overlays
    (r'rgba\(0,\s*0,\s*0,\s*0\.1(?!\d)\)',  'var(--clr-black-10)'),
    (r'rgba\(0,\s*0,\s*0,\s*0\.15\)',  'var(--clr-black-15)'),
    (r'rgba\(0,\s*0,\s*0,\s*0\.2(?!\d)\)',  'var(--clr-black-20)'),
    (r'rgba\(0,\s*0,\s*0,\s*0\.25\)',  'var(--clr-black-25)'),
    (r'rgba\(0,\s*0,\s*0,\s*0\.3(?!\d)\)',  'var(--clr-black-30)'),
    (r'rgba\(0,\s*0,\s*0,\s*0\.35\)',  'var(--clr-black-35)'),
    (r'rgba\(0,\s*0,\s*0,\s*0\.4(?!\d)\)',  'var(--clr-black-40)'),
    (r'rgba\(0,\s*0,\s*0,\s*0\.5(?!\d)\)',  'var(--clr-black-50)'),
    (r'rgba\(0,\s*0,\s*0,\s*0\.55\)',  'var(--clr-black-55)'),
    (r'rgba\(0,\s*0,\s*0,\s*0\.6(?!\d)\)',  'var(--clr-black-60)'),
    (r'rgba\(0,\s*0,\s*0,\s*0\.7(?!\d)\)',  'var(--clr-black-70)'),
    (r'rgba\(0,\s*0,\s*0,\s*0\.75\)',  'var(--clr-black-75)'),
    (r'rgba\(0,\s*0,\s*0,\s*0\.8(?!\d)\)',  'var(--clr-black-80)'),
    (r'rgba\(0,\s*0,\s*0,\s*0\.9(?!\d)\)',  'var(--clr-black-90)'),
    # Status
    (r'#4ade80\b', 'var(--clr-success)'),
    (r'#22c55e\b', 'var(--clr-success)'),
    (r'rgba\(74,\s*222,\s*128,\s*0\.04\)', 'var(--clr-success-soft-04)'),
    (r'rgba\(74,\s*222,\s*128,\s*0\.05\)', 'var(--clr-success-soft-05)'),
    (r'rgba\(74,\s*222,\s*128,\s*0\.\d+\)', 'var(--clr-success-soft)'),
    (r'#ef4444\b', 'var(--clr-danger)'),
    (r'#f87171\b', 'var(--clr-danger)'),
    (r'rgba\(239,\s*68,\s*68,\s*0\.04\)',  'var(--clr-danger-soft-04)'),
    (r'rgba\(239,\s*68,\s*68,\s*0\.05\)',  'var(--clr-danger-soft-05)'),
    (r'rgba\(239,\s*68,\s*68,\s*0\.\d+\)',  'var(--clr-danger-soft)'),
    (r'#fbbf24\b', 'var(--clr-warning)'),
    (r'#f59e0b\b', 'var(--clr-warning)'),
    (r'rgba\(251,\s*191,\s*36,\s*0\.04\)', 'var(--clr-warning-soft-04)'),
    (r'rgba\(251,\s*191,\s*36,\s*0\.05\)', 'var(--clr-warning-soft-05)'),
    (r'rgba\(251,\s*191,\s*36,\s*0\.\d+\)', 'var(--clr-warning-soft)'),
    # Cinematic (203,213,225)
    (r'rgba\(203,\s*213,\s*225,\s*0\.75\)', 'var(--clr-text-3)'),
    (r'rgba\(203,\s*213,\s*225,\s*0\.5\)',  'var(--clr-border-7)'),
    (r'rgba\(203,\s*213,\s*225,\s*0\.3\)',  'var(--clr-border-30)'),
    (r'rgba\(203,\s*213,\s*225,\s*0\.2\)',  'var(--clr-border-6)'),
    (r'rgba\(203,\s*213,\s*225,\s*0\.1\)',  'var(--clr-border-3)'),
    (r'rgba\(203,\s*213,\s*225,\s*0\.05\)', 'var(--clr-border-05)'),
    # Missing accent opacity levels
    (r'rgba\(96,\s*165,\s*250,\s*0\.45\)',  'var(--clr-accent-45)'),
    (r'rgba\(96,\s*165,\s*250,\s*0\.6\)',   'var(--clr-accent-60)'),
    (r'rgba\(96,\s*165,\s*250,\s*0\.7\)',   'var(--clr-accent-70)'),
    (r'rgba\(96,\s*165,\s*250,\s*0\.8\)',   'var(--clr-accent-80)'),
    (r'rgba\(96,\s*165,\s*250,\s*0\.9\)',   'var(--clr-accent-90)'),
    # Missing border opacity levels
    (r'rgba\(148,\s*163,\s*184,\s*0\.35\)', 'var(--clr-border-35)'),
    (r'rgba\(148,\s*163,\s*184,\s*0\.8\)',  'var(--clr-border-80)'),
    (r'rgba\(148,\s*163,\s*184,\s*0\.9\)',  'var(--clr-border-90)'),
    # Legacy blue accent (74,158,255) = old --color-accent-rgb
    (r'rgba\(74,\s*158,\s*255,\s*0\.01\)',  'var(--clr-accent-04)'),
    (r'rgba\(74,\s*158,\s*255,\s*0\.08\)',  'var(--clr-accent-08)'),
    (r'rgba\(74,\s*158,\s*255,\s*0\.1\)',   'var(--clr-accent-10)'),
    (r'rgba\(74,\s*158,\s*255,\s*0\.12\)',  'var(--clr-accent-12)'),
    (r'rgba\(74,\s*158,\s*255,\s*0\.15\)',  'var(--clr-accent-15)'),
    (r'rgba\(74,\s*158,\s*255,\s*0\.2\)',   'var(--clr-accent-20)'),
    (r'rgba\(74,\s*158,\s*255,\s*0\.3\)',   'var(--clr-accent-30)'),
    (r'rgba\(74,\s*158,\s*255,\s*0\.4\)',   'var(--clr-accent-40)'),
    # blue-500 (59,130,246) = same semantic accent
    (r'rgba\(59,\s*130,\s*246,\s*0\.1\)',   'var(--clr-accent-10)'),
    (r'rgba\(59,\s*130,\s*246,\s*0\.15\)',  'var(--clr-accent-15)'),
    (r'rgba\(59,\s*130,\s*246,\s*0\.2\)',   'var(--clr-accent-20)'),
    (r'rgba\(59,\s*130,\s*246,\s*0\.25\)',  'var(--clr-accent-25)'),
    (r'rgba\(59,\s*130,\s*246,\s*0\.3\)',   'var(--clr-accent-30)'),
    (r'rgba\(59,\s*130,\s*246,\s*0\.35\)',  'var(--clr-accent-35)'),
    (r'rgba\(59,\s*130,\s*246,\s*0\.4\)',   'var(--clr-accent-40)'),
    (r'rgba\(59,\s*130,\s*246,\s*0\.5\)',   'var(--clr-accent-50)'),
    (r'rgba\(59,\s*130,\s*246,\s*0\.6\)',   'var(--clr-accent-60)'),
    (r'rgba\(59,\s*130,\s*246,\s*0\.9\)',   'var(--clr-accent-90)'),
    # green-400 (34,197,94) = success
    (r'rgba\(34,\s*197,\s*94,\s*0\.08\)',   'var(--clr-success-soft)'),
    (r'rgba\(34,\s*197,\s*94,\s*0\.15\)',   'var(--clr-success-soft)'),
    (r'rgba\(34,\s*197,\s*94,\s*0\.3\)',    'var(--clr-success-30)'),
    (r'rgba\(34,\s*197,\s*94,\s*0\.6\)',    'var(--clr-success-60)'),
    # purple (168,85,247) and (139,92,246) = skill/emblem accent
    (r'#a78bfa\b',                           'var(--clr-purple)'),
    (r'rgba\(168,\s*85,\s*247,\s*0\.15\)',  'var(--clr-purple-15)'),
    (r'rgba\(168,\s*85,\s*247,\s*0\.3\)',   'var(--clr-purple-30)'),
    (r'rgba\(168,\s*85,\s*247,\s*0\.6\)',   'var(--clr-purple-60)'),
    (r'rgba\(139,\s*92,\s*246,\s*0\.3\)',   'var(--clr-purple-30)'),
    (r'rgba\(139,\s*92,\s*246,\s*0\.15\)', 'var(--clr-purple-15)'),
    # purple more levels
    (r'rgba\(168,\s*85,\s*247,\s*0\.08\)', 'var(--clr-purple-08)'),
    (r'rgba\(168,\s*85,\s*247,\s*0\.2\)',  'var(--clr-purple-20)'),
    (r'rgba\(168,\s*85,\s*247,\s*0\.25\)', 'var(--clr-purple-25)'),
    (r'rgba\(168,\s*85,\s*247,\s*0\.35\)', 'var(--clr-purple-35)'),
    (r'rgba\(168,\s*85,\s*247,\s*0\.4\)',  'var(--clr-purple-40)'),
    (r'#8b5cf6\b',                          'var(--clr-purple)'),
    (r'#c084fc\b',                          'var(--clr-purple-light)'),
    # indigo (99, 102, 241)
    (r'rgba\(99,\s*102,\s*241,\s*0\.03\)', 'var(--clr-indigo-03)'),
    (r'rgba\(99,\s*102,\s*241,\s*0\.1\)',  'var(--clr-indigo-10)'),
    (r'rgba\(99,\s*102,\s*241,\s*0\.2\)',  'var(--clr-indigo-20)'),
    (r'rgba\(99,\s*102,\s*241,\s*0\.25\)', 'var(--clr-indigo-25)'),
    (r'rgba\(99,\s*102,\s*241,\s*0\.3\)',  'var(--clr-indigo-30)'),
    # success more levels (34,197,94)
    (r'rgba\(34,\s*197,\s*94,\s*0\.12\)',  'var(--clr-success-12)'),
    (r'rgba\(34,\s*197,\s*94,\s*0\.2\)',   'var(--clr-success-20)'),
    (r'rgba\(34,\s*197,\s*94,\s*0\.25\)',  'var(--clr-success-25)'),
    (r'rgba\(34,\s*197,\s*94,\s*0\.35\)',  'var(--clr-success-35)'),
    (r'rgba\(34,\s*197,\s*94,\s*0\.4\)',   'var(--clr-success-40)'),
    # emerald (16,185,129)
    (r'rgba\(16,\s*185,\s*129,\s*0\.2\)',  'var(--clr-success-20)'),
    (r'rgba\(16,\s*185,\s*129,\s*0\.3\)',  'var(--clr-success-30)'),
    # warning more levels (245,158,11)
    (r'rgba\(245,\s*158,\s*11,\s*0\.2\)',  'var(--clr-warning-20)'),
    (r'rgba\(245,\s*158,\s*11,\s*0\.3\)',  'var(--clr-warning-30)'),
    (r'rgba\(245,\s*158,\s*11,\s*0\.4\)',  'var(--clr-warning-40)'),
    # amber (234,179,8)
    (r'rgba\(234,\s*179,\s*8,\s*0\.08\)',  'var(--clr-warning-soft)'),
    (r'rgba\(234,\s*179,\s*8,\s*0\.15\)',  'var(--clr-warning-soft)'),
    # warning orange (230,138,9)
    (r'rgba\(230,\s*138,\s*9,\s*0\.12\)',  'var(--clr-warning-soft)'),
    (r'rgba\(230,\s*138,\s*9,\s*0\.15\)',  'var(--clr-warning-soft)'),
    # danger more levels
    (r'rgba\(220,\s*38,\s*38,\s*0\.25\)',  'var(--clr-danger-25)'),
    # slate-600 (71,85,105)
    (r'rgba\(71,\s*85,\s*105,\s*0\.12\)',  'var(--clr-text-4-12)'),
    (r'rgba\(71,\s*85,\s*105,\s*0\.8\)',   'var(--clr-text-4-80)'),
    # surface more levels (203,213,225)
    (r'rgba\(203,\s*213,\s*225,\s*0\.7\)', 'var(--clr-surface-3)'),
    (r'rgba\(203,\s*213,\s*225,\s*0\.9\)', 'var(--clr-surface-4)'),
    # white more levels
    (r'rgba\(255,\s*255,\s*255,\s*0\.02\)', 'var(--clr-white-03)'),
    (r'rgba\(255,\s*255,\s*255,\s*0\.28\)', 'var(--clr-white-30)'),
    (r'rgba\(255,\s*255,\s*255,\s*0\.45\)', 'var(--clr-white-40)'),
    (r'rgba\(255,\s*255,\s*255,\s*0\.85\)', 'var(--clr-white-80)'),
    # legacy accent (74,158,255)
    (r'rgba\(74,\s*158,\s*255,\s*0\.25\)', 'var(--clr-accent-25)'),
    # sky (99,179,237)
    (r'rgba\(99,\s*179,\s*237,\s*0\.12\)', 'var(--clr-accent-12)'),
    # warm brown / brand (180,120,60)
    (r'rgba\(180,\s*120,\s*60,\s*0\.08\)', 'var(--clr-warning-soft)'),
    # deep dark bg (10,14,28)
    (r'rgba\(10,\s*14,\s*28,\s*0\.98\)',   'var(--clr-bg-deepest)'),
    # blue-500 .08
    (r'rgba\(59,\s*130,\s*246,\s*0\.08\)', 'var(--clr-accent-08)'),
    # accent-35 for main accent blue
    (r'rgba\(96,\s*165,\s*250,\s*0\.35\)', 'var(--clr-accent-35)'),
    # more accent-96-165-250 levels
    (r'rgba\(96,\s*165,\s*250,\s*0\.02\)', 'var(--clr-accent-04)'),
    (r'rgba\(96,\s*165,\s*250,\s*0\.55\)', 'var(--clr-accent-60)'),
    (r'rgba\(96,\s*165,\s*250,\s*1\)',     'var(--clr-accent)'),
    # more legacy blue (74,158,255) levels
    (r'rgba\(74,\s*158,\s*255,\s*0\.06\)', 'var(--clr-accent-06)'),
    (r'rgba\(74,\s*158,\s*255,\s*0\.18\)', 'var(--clr-accent-18)'),
    (r'rgba\(74,\s*158,\s*255,\s*0\.35\)', 'var(--clr-accent-35)'),
    (r'rgba\(74,\s*158,\s*255,\s*0\.5\)',  'var(--clr-accent-50)'),
    (r'rgba\(74,\s*158,\s*255,\s*0\.6\)',  'var(--clr-accent-60)'),
    # more blue-500 (59,130,246) levels
    (r'rgba\(59,\s*130,\s*246,\s*0\.03\)', 'var(--clr-accent-04)'),
    (r'rgba\(59,\s*130,\s*246,\s*0\.12\)', 'var(--clr-accent-12)'),
    (r'rgba\(59,\s*130,\s*246,\s*0\.7\)',  'var(--clr-accent-70)'),
    # slate-700 (51,65,85)
    (r'rgba\(51,\s*65,\s*85,\s*0\.5\)',   'var(--clr-bg-card-55)'),
    (r'rgba\(51,\s*65,\s*85,\s*0\.6\)',   'var(--clr-bg-card-65)'),
    (r'rgba\(51,\s*65,\s*85,\s*0\.95\)',  'var(--clr-bg-elevated)'),
    # more white levels
    (r'rgba\(255,\s*255,\s*255,\s*0\.01\)', 'var(--clr-white-03)'),
    (r'rgba\(255,\s*255,\s*255,\s*0\.35\)', 'var(--clr-white-40)'),
    (r'rgba\(255,\s*255,\s*255,\s*0\.65\)', 'var(--clr-white-60)'),
    (r'rgba\(255,\s*255,\s*255,\s*0\.82\)', 'var(--clr-white-80)'),
    # more success levels (34,197,94)
    (r'rgba\(34,\s*197,\s*94,\s*0\.5\)',  'var(--clr-success-60)'),
    (r'rgba\(34,\s*197,\s*94,\s*0\.7\)',  'var(--clr-success-60)'),
    (r'rgba\(34,\s*197,\s*94,\s*0\.9\)',  'var(--clr-success)'),
    # more slate-600 (71,85,105)
    (r'rgba\(71,\s*85,\s*105,\s*0\.35\)', 'var(--clr-text-4-12)'),
    (r'rgba\(71,\s*85,\s*105,\s*0\.45\)', 'var(--clr-border-40)'),
    # dark bg specific (40,51,69) = between bg-base and bg-deep
    (r'rgba\(40,\s*51,\s*69,\s*0\.6\)',   'var(--clr-bg-card-65)'),
    # very dark solid
    (r'rgba\(30,\s*30,\s*35,\s*0\.9\)',   'var(--clr-bg-deepest)'),
    (r'rgba\(30,\s*30,\s*35,\s*0\.95\)',  'var(--clr-bg-deepest)'),
    (r'rgba\(40,\s*40,\s*45,\s*0\.9\)',   'var(--clr-bg-deepest)'),
    (r'rgba\(8,\s*12,\s*24,\s*0\.96\)',   'var(--clr-bg-deepest)'),
    (r'rgba\(26,\s*30,\s*58,\s*0\.9\)',   'var(--clr-bg-deepest)'),
    (r'rgba\(26,\s*52,\s*71,\s*0\.98\)',  'var(--clr-bg-deepest)'),
    # blue-800 (30, 64, 175)
    (r'rgba\(30,\s*64,\s*175,\s*0\.12\)', 'var(--clr-accent-12)'),
    # gold/yellow (255, 215, 0)
    (r'rgba\(255,\s*215,\s*0,\s*0\.15\)', 'var(--clr-warning-soft)'),
    # orange (251, 146, 60)
    (r'rgba\(251,\s*146,\s*60,\s*0\.12\)', 'var(--clr-warning-soft)'),
    # #f1f5f9 = light bg page color
    (r'#f1f5f9\b',                           'var(--clr-bg-page)'),
    # slate-200 (226,232,240) = light surface
    (r'rgba\(226,\s*232,\s*240,\s*0\.85\)', 'var(--clr-bg-card-85)'),
    (r'rgba\(226,\s*232,\s*240,\s*0\.9\)',  'var(--clr-bg-card-90)'),
    (r'rgba\(226,\s*232,\s*240,\s*0\.95\)', 'var(--clr-bg-card-90)'),
    # more slate-300 (203,213,225) levels
    (r'rgba\(203,\s*213,\s*225,\s*0\.6\)',  'var(--clr-surface-3)'),
    (r'rgba\(203,\s*213,\s*225,\s*0\.60\)', 'var(--clr-surface-3)'),
    (r'rgba\(203,\s*213,\s*225,\s*0\.8\)',  'var(--clr-surface-4)'),
    (r'rgba\(203,\s*213,\s*225,\s*0\.85\)', 'var(--clr-surface-4)'),
    # more slate-400 (148,163,184) levels
    (r'rgba\(148,\s*163,\s*184,\s*0\.45\)', 'var(--clr-border-40)'),
    (r'rgba\(148,\s*163,\s*184,\s*0\.75\)', 'var(--clr-border-80)'),
    (r'rgba\(148,\s*163,\s*184,\s*0\.85\)', 'var(--clr-border-90)'),
    # more slate-500/blue-gray (100,116,139) | (156,163,175)
    (r'rgba\(100,\s*116,\s*139,\s*0\.1\)',  'var(--clr-border-3)'),
    (r'rgba\(156,\s*163,\s*175,\s*0\.1\)',  'var(--clr-border-3)'),
    # more slate-600 (71,85,105) levels (already have .12 and .8)
    # more (15,23,42) = bg-page overlay
    (r'rgba\(15,\s*23,\s*42,\s*0\.55\)',   'var(--clr-overlay-50)'),
    (r'rgba\(15,\s*23,\s*42,\s*0\.65\)',   'var(--clr-overlay-70)'),
    # very dark navy bg variations → bg-deepest
    (r'rgba\(10,\s*15,\s*30,\s*0\.55\)',   'var(--clr-bg-page-65)'),
    (r'rgba\(10,\s*15,\s*30,\s*0\.6\)',    'var(--clr-bg-page-65)'),
    (r'rgba\(10,\s*15,\s*30,\s*0\.7\)',    'var(--clr-bg-page-70)'),
    (r'rgba\(10,\s*15,\s*30,\s*0\.95\)',   'var(--clr-bg-page-95)'),
    (r'rgba\(10,\s*15,\s*30,\s*0\.98\)',   'var(--clr-bg-deepest)'),
    (r'rgba\(10,\s*10,\s*15,\s*0\.85\)',   'var(--clr-bg-deepest)'),
    (r'rgba\(10,\s*17,\s*35,\s*0\.3\)',    'var(--clr-overlay-30)'),
    (r'rgba\(15,\s*20,\s*35,\s*0\.45\)',   'var(--clr-bg-page-65)'),
    (r'rgba\(15,\s*20,\s*35,\s*0\.5\)',    'var(--clr-bg-page-65)'),
    (r'rgba\(15,\s*20,\s*35,\s*0\.65\)',   'var(--clr-bg-page-70)'),
    (r'rgba\(15,\s*20,\s*35,\s*0\.7\)',    'var(--clr-bg-page-70)'),
    (r'rgba\(15,\s*20,\s*35,\s*0\.8\)',    'var(--clr-bg-page-80)'),
    (r'rgba\(15,\s*22,\s*40,\s*0\.95\)',   'var(--clr-bg-page-95)'),
    (r'rgba\(15,\s*22,\s*42,\s*0\.7\)',    'var(--clr-bg-page-70)'),
    (r'rgba\(15,\s*35,\s*50,\s*0\.97\)',   'var(--clr-bg-deepest)'),
    (r'rgba\(20,\s*14,\s*28,\s*0\.98\)',   'var(--clr-bg-deepest)'),
    (r'rgba\(20,\s*20,\s*25,\s*0\.95\)',   'var(--clr-bg-deepest)'),
    (r'rgba\(20,\s*28,\s*50,\s*0\.9\)',    'var(--clr-bg-deepest)'),
    (r'rgba\(20,\s*28,\s*55,\s*0\.85\)',   'var(--clr-bg-deepest)'),
    (r'rgba\(20,\s*30,\s*52,\s*0\.98\)',   'var(--clr-bg-deepest)'),
    (r'rgba\(19,\s*23,\s*28,\s*0\.333\)',  'var(--clr-overlay-30)'),
    (r'rgba\(19,\s*23,\s*28,\s*0\)',       'transparent'),
    # more purple (139,92,246) levels
    (r'rgba\(139,\s*92,\s*246,\s*0\.08\)', 'var(--clr-purple-08)'),
    (r'rgba\(139,\s*92,\s*246,\s*0\.1\)',  'var(--clr-purple-08)'),
    (r'rgba\(139,\s*92,\s*246,\s*0\.2\)',  'var(--clr-purple-20)'),
    (r'rgba\(139,\s*92,\s*246,\s*0\.4\)',  'var(--clr-purple-40)'),
    (r'rgba\(139,\s*92,\s*246,\s*0\.5\)',  'var(--clr-purple-60)'),
    (r'rgba\(139,\s*92,\s*246,\s*0\.7\)',  'var(--clr-purple-60)'),
    (r'rgba\(129,\s*140,\s*248,\s*0\.1\)', 'var(--clr-indigo-10)'),
    (r'rgba\(147,\s*51,\s*234,\s*0\.15\)', 'var(--clr-purple-15)'),
    (r'rgba\(167,\s*139,\s*250,\s*0\.4\)', 'var(--clr-purple-40)'),
    (r'rgba\(168,\s*85,\s*247,\s*0\.03\)', 'var(--clr-purple-08)'),
    (r'rgba\(168,\s*85,\s*247,\s*0\.7\)',  'var(--clr-purple-60)'),
    (r'rgba\(186,\s*104,\s*200,\s*0\.12\)','var(--clr-purple-08)'),
    (r'rgba\(186,\s*104,\s*200,\s*0\.2\)', 'var(--clr-purple-20)'),
    (r'rgba\(186,\s*104,\s*200,\s*0\.25\)','var(--clr-purple-25)'),
    (r'rgba\(120,\s*60,\s*140,\s*0\.08\)', 'var(--clr-purple-08)'),
    # more danger (220,38,38) and (231,76,60) = red variants
    (r'rgba\(220,\s*38,\s*38,\s*0\.1\)',   'var(--clr-danger-soft)'),
    (r'rgba\(220,\s*38,\s*38,\s*0\.12\)',  'var(--clr-danger-soft)'),
    (r'rgba\(220,\s*38,\s*38,\s*0\.15\)',  'var(--clr-danger-soft)'),
    (r'rgba\(220,\s*38,\s*38,\s*0\.6\)',   'var(--clr-danger)'),
    (r'rgba\(220,\s*38,\s*38,\s*0\.9\)',   'var(--clr-danger)'),
    (r'rgba\(231,\s*76,\s*60,\s*0\.15\)',  'var(--clr-danger-soft)'),
    (r'rgba\(231,\s*76,\s*60,\s*0\.25\)',  'var(--clr-danger-25)'),
    # red-400 (248,113,113)
    (r'rgba\(248,\s*113,\s*113,\s*0\.1\)', 'var(--clr-danger-soft)'),
    (r'rgba\(248,113,113,0\.1\)',           'var(--clr-danger-soft)'),
    (r'rgba\(248,\s*113,\s*113,\s*0\.2\)', 'var(--clr-danger-soft)'),
    (r'rgba\(248,\s*113,\s*113,\s*0\.4\)', 'var(--clr-danger-25)'),
    # more success/emerald
    (r'rgba\(16,\s*185,\s*129,\s*0\.1\)',  'var(--clr-success-12)'),
    (r'rgba\(16,\s*185,\s*129,\s*0\.4\)',  'var(--clr-success-40)'),
    (r'rgba\(16,\s*185,\s*129,\s*0\.5\)',  'var(--clr-success-60)'),
    (r'rgba\(5,\s*150,\s*105,\s*0\.15\)',  'var(--clr-success-soft)'),
    # more warning
    (r'rgba\(245,\s*158,\s*11,\s*0\.1\)',  'var(--clr-warning-soft)'),
    (r'rgba\(234,\s*179,\s*8,\s*0\.3\)',   'var(--clr-warning-20)'),
    (r'rgba\(234,\s*179,\s*8,\s*0\.5\)',   'var(--clr-warning-30)'),
    (r'rgba\(230,\s*138,\s*9,\s*0\.5\)',   'var(--clr-warning-30)'),
    (r'rgba\(217,\s*119,\s*6,\s*0\.15\)',  'var(--clr-warning-soft)'),
    # black overlays (0,0,0)
    (r'rgba\(0,\s*0,\s*0,\s*0\.12\)',      'var(--clr-black-15)'),
    (r'rgba\(0,\s*0,\s*0,\s*\.7\)',        'var(--clr-black-70)'),
    (r'rgba\(0,\s*0,\s*0,\s*0\.65\)',      'var(--clr-black-60)'),
    (r'rgba\(0,\s*0,\s*0,\s*0\.85\)',      'var(--clr-black-80)'),
    # misc silver
    (r'rgba\(192,\s*192,\s*192,\s*0\.15\)','var(--clr-border-3)'),
    (r'rgba\(188,\s*201,\s*216,\s*0\.7\)', 'var(--clr-surface-3)'),
    # warm brown
    (r'rgba\(180,\s*120,\s*60,\s*0\.25\)', 'var(--clr-warning-soft)'),
    (r'rgba\(212,\s*165,\s*116,\s*0\.15\)','var(--clr-warning-soft)'),
    (r'rgba\(205,\s*127,\s*50,\s*0\.15\)', 'var(--clr-warning-soft)'),
    # solid hex colors (non-semantic, unique)
    (r'#f0f0f0\b',  'var(--clr-text-3)'),
    (r'#e0e0e0\b',  'var(--clr-text-3)'),
    (r'#1e2330\b',  'var(--clr-bg-deep)'),
    (r'#1e2130\b',  'var(--clr-bg-deep)'),
    (r'#141e34\b',  'var(--clr-bg-deeper)'),
    (r'#16a34a\b',  'var(--clr-success)'),
    (r'#9333ea\b',  'var(--clr-purple)'),
    (r'#c4b5fd\b',  'var(--clr-purple-light)'),
    (r'#a5b4fc\b',  'var(--clr-purple-light)'),
    (r'#8b92a6\b',  'var(--clr-text-3)'),
    (r'#999\b',     'var(--clr-text-3)'),
    (r'#e68a09\b',  'var(--clr-warning)'),
    (r'#e8eeff\b',  'var(--clr-accent-10)'),
    (r'#cd7f32\b',  'var(--clr-warning)'),
]

NEW_TOKENS_DARK = """
  /* ── Extended overlays ── */
  --clr-bg-page-65:   rgba(8, 15, 28, 0.65);
  --clr-bg-page-70:   rgba(8, 15, 28, 0.70);
  --clr-bg-page-80:   rgba(8, 15, 28, 0.80);
  --clr-bg-page-85:   rgba(8, 15, 28, 0.85);
  --clr-bg-page-90:   rgba(8, 15, 28, 0.90);
  --clr-bg-page-95:   rgba(8, 15, 28, 0.95);
  --clr-overlay-30:   rgba(15, 23, 42, 0.30);
  --clr-overlay-50:   rgba(15, 23, 42, 0.50);
  --clr-overlay-70:   rgba(15, 23, 42, 0.70);
  --clr-overlay-80:   rgba(15, 23, 42, 0.80);
  --clr-overlay-90:   rgba(15, 23, 42, 0.90);
  --clr-overlay-95:   rgba(15, 23, 42, 0.95);
  --clr-bg-card-30:   rgba(30, 41, 59, 0.30);
  --clr-bg-card-35:   rgba(30, 41, 59, 0.35);
  --clr-bg-card-45:   rgba(30, 41, 59, 0.45);
  --clr-bg-card-55:   rgba(30, 41, 59, 0.55);
  --clr-bg-card-65:   rgba(30, 41, 59, 0.65);
  --clr-bg-card-70:   rgba(30, 41, 59, 0.70);
  --clr-bg-card-75:   rgba(30, 41, 59, 0.75);
  --clr-bg-card-80:   rgba(30, 41, 59, 0.80);
  --clr-bg-card-85:   rgba(30, 41, 59, 0.85);
  --clr-bg-card-90:   rgba(30, 41, 59, 0.90);
  --clr-bg-deeper:    #0d1b2e;
  --clr-bg-deepest:   #0a1628;
  --clr-text-3b:      #cbd5e1;
  --clr-accent-card:  rgba(30, 58, 108, 0.50);
  --clr-accent-04:    rgba(96, 165, 250, 0.04);
  --clr-accent-05:    rgba(96, 165, 250, 0.05);
  --clr-accent-06:    rgba(96, 165, 250, 0.06);
  --clr-accent-07:    rgba(96, 165, 250, 0.07);
  --clr-accent-18:    rgba(96, 165, 250, 0.18);
  --clr-border-04:    rgba(148, 163, 184, 0.04);
  --clr-border-05:    rgba(148, 163, 184, 0.05);
  --clr-border-07:    rgba(148, 163, 184, 0.07);
  --clr-border-25:    rgba(148, 163, 184, 0.25);
  --clr-border-30:    rgba(148, 163, 184, 0.30);
  --clr-border-40:    rgba(148, 163, 184, 0.40);
  --clr-surface-1b:   rgba(71, 85, 105, 0.10);
  --clr-surface-1c:   rgba(71, 85, 105, 0.15);
  --clr-surface-25:   rgba(71, 85, 105, 0.25);
  --clr-surface-3:    rgba(71, 85, 105, 0.40);
  --clr-surface-4:    rgba(71, 85, 105, 0.50);
  --clr-white-03:     rgba(255, 255, 255, 0.03);
  --clr-white-04:     rgba(255, 255, 255, 0.04);
  --clr-white-06:     rgba(255, 255, 255, 0.06);
  --clr-white-07:     rgba(255, 255, 255, 0.07);
  --clr-white-12:     rgba(255, 255, 255, 0.12);
  --clr-white-15:     rgba(255, 255, 255, 0.15);
  --clr-white-20:     rgba(255, 255, 255, 0.20);
  --clr-white-25:     rgba(255, 255, 255, 0.25);
  --clr-white-30:     rgba(255, 255, 255, 0.30);
  --clr-white-40:     rgba(255, 255, 255, 0.40);
  --clr-white-60:     rgba(255, 255, 255, 0.60);
  --clr-white-70:     rgba(255, 255, 255, 0.70);
  --clr-white-75:     rgba(255, 255, 255, 0.75);
  --clr-white-80:     rgba(255, 255, 255, 0.80);
  --clr-white-90:     rgba(255, 255, 255, 0.90);
  --clr-black-10:     rgba(0, 0, 0, 0.10);
  --clr-black-15:     rgba(0, 0, 0, 0.15);
  --clr-black-20:     rgba(0, 0, 0, 0.20);
  --clr-black-25:     rgba(0, 0, 0, 0.25);
  --clr-black-35:     rgba(0, 0, 0, 0.35);
  --clr-black-40:     rgba(0, 0, 0, 0.40);
  --clr-black-55:     rgba(0, 0, 0, 0.55);
  --clr-black-60:     rgba(0, 0, 0, 0.60);
  --clr-black-70:     rgba(0, 0, 0, 0.70);
  --clr-black-75:     rgba(0, 0, 0, 0.75);
  --clr-black-80:     rgba(0, 0, 0, 0.80);
  --clr-black-90:     rgba(0, 0, 0, 0.90);
  --clr-success-soft-04: rgba(74, 222, 128, 0.04);
  --clr-success-soft-05: rgba(74, 222, 128, 0.05);
  --clr-danger-soft-04:  rgba(239, 68, 68, 0.04);
  --clr-danger-soft-05:  rgba(239, 68, 68, 0.05);
  --clr-warning-soft-04: rgba(251, 191, 36, 0.04);
  --clr-warning-soft-05: rgba(251, 191, 36, 0.05);
  --clr-accent-35:    rgba(96, 165, 250, 0.35);
  --clr-accent-45:    rgba(96, 165, 250, 0.45);
  --clr-accent-60:    rgba(96, 165, 250, 0.60);
  --clr-accent-70:    rgba(96, 165, 250, 0.70);
  --clr-accent-80:    rgba(96, 165, 250, 0.80);
  --clr-accent-90:    rgba(96, 165, 250, 0.90);
  --clr-border-35:    rgba(148, 163, 184, 0.35);
  --clr-border-80:    rgba(148, 163, 184, 0.80);
  --clr-border-90:    rgba(148, 163, 184, 0.90);
  --clr-success-30:   rgba(74, 222, 128, 0.30);
  --clr-success-60:   rgba(74, 222, 128, 0.60);
  --clr-purple:       #a78bfa;
  --clr-purple-08:    rgba(167, 139, 250, 0.08);
  --clr-purple-15:    rgba(167, 139, 250, 0.15);
  --clr-purple-20:    rgba(167, 139, 250, 0.20);
  --clr-purple-25:    rgba(167, 139, 250, 0.25);
  --clr-purple-30:    rgba(167, 139, 250, 0.30);
  --clr-purple-35:    rgba(167, 139, 250, 0.35);
  --clr-purple-40:    rgba(167, 139, 250, 0.40);
  --clr-purple-60:    rgba(167, 139, 250, 0.60);
  --clr-purple-light: #c084fc;
  --clr-indigo-03:    rgba(99, 102, 241, 0.03);
  --clr-indigo-10:    rgba(99, 102, 241, 0.10);
  --clr-indigo-20:    rgba(99, 102, 241, 0.20);
  --clr-indigo-25:    rgba(99, 102, 241, 0.25);
  --clr-indigo-30:    rgba(99, 102, 241, 0.30);
  --clr-success-12:   rgba(74, 222, 128, 0.12);
  --clr-success-20:   rgba(74, 222, 128, 0.20);
  --clr-success-25:   rgba(74, 222, 128, 0.25);
  --clr-success-35:   rgba(74, 222, 128, 0.35);
  --clr-success-40:   rgba(74, 222, 128, 0.40);
  --clr-warning-20:   rgba(251, 191, 36, 0.20);
  --clr-warning-30:   rgba(251, 191, 36, 0.30);
  --clr-warning-40:   rgba(251, 191, 36, 0.40);
  --clr-danger-25:    rgba(239, 68, 68, 0.25);
  --clr-text-4-12:    rgba(71, 85, 105, 0.12);
  --clr-text-4-80:    rgba(71, 85, 105, 0.80);
"""

NEW_TOKENS_LIGHT = """
  /* ── Extended overlays ── */
  --clr-bg-page-65:   rgba(241, 245, 249, 0.65);
  --clr-bg-page-70:   rgba(241, 245, 249, 0.70);
  --clr-bg-page-80:   rgba(241, 245, 249, 0.80);
  --clr-bg-page-85:   rgba(241, 245, 249, 0.85);
  --clr-bg-page-90:   rgba(241, 245, 249, 0.90);
  --clr-bg-page-95:   rgba(241, 245, 249, 0.95);
  --clr-overlay-30:   rgba(241, 245, 249, 0.30);
  --clr-overlay-50:   rgba(241, 245, 249, 0.50);
  --clr-overlay-70:   rgba(241, 245, 249, 0.70);
  --clr-overlay-80:   rgba(241, 245, 249, 0.80);
  --clr-overlay-90:   rgba(241, 245, 249, 0.90);
  --clr-overlay-95:   rgba(241, 245, 249, 0.95);
  --clr-bg-card-30:   rgba(255, 255, 255, 0.30);
  --clr-bg-card-35:   rgba(255, 255, 255, 0.35);
  --clr-bg-card-45:   rgba(255, 255, 255, 0.45);
  --clr-bg-card-55:   rgba(255, 255, 255, 0.55);
  --clr-bg-card-65:   rgba(255, 255, 255, 0.65);
  --clr-bg-card-70:   rgba(255, 255, 255, 0.70);
  --clr-bg-card-75:   rgba(255, 255, 255, 0.75);
  --clr-bg-card-80:   rgba(255, 255, 255, 0.80);
  --clr-bg-card-85:   rgba(255, 255, 255, 0.85);
  --clr-bg-card-90:   rgba(255, 255, 255, 0.90);
  --clr-bg-deeper:    #dde4ed;
  --clr-bg-deepest:   #d0d9e4;
  --clr-text-3b:      #64748b;
  --clr-accent-card:  rgba(37, 99, 235, 0.08);
  --clr-accent-04:    rgba(37, 99, 235, 0.04);
  --clr-accent-05:    rgba(37, 99, 235, 0.05);
  --clr-accent-06:    rgba(37, 99, 235, 0.06);
  --clr-accent-07:    rgba(37, 99, 235, 0.07);
  --clr-accent-18:    rgba(37, 99, 235, 0.18);
  --clr-border-04:    rgba(15, 23, 42, 0.03);
  --clr-border-05:    rgba(15, 23, 42, 0.04);
  --clr-border-07:    rgba(15, 23, 42, 0.05);
  --clr-border-25:    rgba(15, 23, 42, 0.18);
  --clr-border-30:    rgba(15, 23, 42, 0.22);
  --clr-border-40:    rgba(15, 23, 42, 0.28);
  --clr-surface-1b:   rgba(203, 213, 225, 0.15);
  --clr-surface-1c:   rgba(203, 213, 225, 0.25);
  --clr-surface-25:   rgba(203, 213, 225, 0.50);
  --clr-surface-3:    rgba(203, 213, 225, 0.75);
  --clr-surface-4:    rgba(203, 213, 225, 0.90);
  --clr-white-03:     rgba(0, 0, 0, 0.02);
  --clr-white-04:     rgba(0, 0, 0, 0.03);
  --clr-white-06:     rgba(0, 0, 0, 0.04);
  --clr-white-07:     rgba(0, 0, 0, 0.05);
  --clr-white-12:     rgba(0, 0, 0, 0.07);
  --clr-white-15:     rgba(0, 0, 0, 0.09);
  --clr-white-20:     rgba(0, 0, 0, 0.12);
  --clr-white-25:     rgba(0, 0, 0, 0.15);
  --clr-white-30:     rgba(0, 0, 0, 0.18);
  --clr-white-40:     rgba(0, 0, 0, 0.24);
  --clr-white-60:     rgba(0, 0, 0, 0.36);
  --clr-white-70:     rgba(0, 0, 0, 0.42);
  --clr-white-75:     rgba(0, 0, 0, 0.45);
  --clr-white-80:     rgba(0, 0, 0, 0.48);
  --clr-white-90:     rgba(0, 0, 0, 0.54);
  --clr-black-10:     rgba(0, 0, 0, 0.06);
  --clr-black-15:     rgba(0, 0, 0, 0.09);
  --clr-black-20:     rgba(0, 0, 0, 0.12);
  --clr-black-25:     rgba(0, 0, 0, 0.15);
  --clr-black-35:     rgba(0, 0, 0, 0.20);
  --clr-black-40:     rgba(0, 0, 0, 0.22);
  --clr-black-55:     rgba(0, 0, 0, 0.28);
  --clr-black-60:     rgba(0, 0, 0, 0.30);
  --clr-black-70:     rgba(0, 0, 0, 0.35);
  --clr-black-75:     rgba(0, 0, 0, 0.38);
  --clr-black-80:     rgba(0, 0, 0, 0.40);
  --clr-black-90:     rgba(0, 0, 0, 0.45);
  --clr-success-soft-04: rgba(22, 163, 74, 0.04);
  --clr-success-soft-05: rgba(22, 163, 74, 0.05);
  --clr-danger-soft-04:  rgba(220, 38, 38, 0.04);
  --clr-danger-soft-05:  rgba(220, 38, 38, 0.05);
  --clr-warning-soft-04: rgba(217, 119, 6, 0.04);
  --clr-warning-soft-05: rgba(217, 119, 6, 0.05);
  --clr-accent-35:    rgba(37, 99, 235, 0.35);
  --clr-accent-45:    rgba(37, 99, 235, 0.45);
  --clr-accent-60:    rgba(37, 99, 235, 0.60);
  --clr-accent-70:    rgba(37, 99, 235, 0.70);
  --clr-accent-80:    rgba(37, 99, 235, 0.80);
  --clr-accent-90:    rgba(37, 99, 235, 0.90);
  --clr-border-35:    rgba(15, 23, 42, 0.25);
  --clr-border-80:    rgba(15, 23, 42, 0.55);
  --clr-border-90:    rgba(15, 23, 42, 0.65);
  --clr-success-30:   rgba(22, 163, 74, 0.30);
  --clr-success-60:   rgba(22, 163, 74, 0.60);
  --clr-purple:       #7c3aed;
  --clr-purple-08:    rgba(124, 58, 237, 0.08);
  --clr-purple-15:    rgba(124, 58, 237, 0.15);
  --clr-purple-20:    rgba(124, 58, 237, 0.20);
  --clr-purple-25:    rgba(124, 58, 237, 0.25);
  --clr-purple-30:    rgba(124, 58, 237, 0.30);
  --clr-purple-35:    rgba(124, 58, 237, 0.35);
  --clr-purple-40:    rgba(124, 58, 237, 0.40);
  --clr-purple-60:    rgba(124, 58, 237, 0.60);
  --clr-purple-light: #a78bfa;
  --clr-indigo-03:    rgba(79, 70, 229, 0.03);
  --clr-indigo-10:    rgba(79, 70, 229, 0.10);
  --clr-indigo-20:    rgba(79, 70, 229, 0.20);
  --clr-indigo-25:    rgba(79, 70, 229, 0.25);
  --clr-indigo-30:    rgba(79, 70, 229, 0.30);
  --clr-success-12:   rgba(22, 163, 74, 0.12);
  --clr-success-20:   rgba(22, 163, 74, 0.20);
  --clr-success-25:   rgba(22, 163, 74, 0.25);
  --clr-success-35:   rgba(22, 163, 74, 0.35);
  --clr-success-40:   rgba(22, 163, 74, 0.40);
  --clr-warning-20:   rgba(217, 119, 6, 0.20);
  --clr-warning-30:   rgba(217, 119, 6, 0.30);
  --clr-warning-40:   rgba(217, 119, 6, 0.40);
  --clr-danger-25:    rgba(220, 38, 38, 0.25);
  --clr-text-4-12:    rgba(71, 85, 105, 0.12);
  --clr-text-4-80:    rgba(71, 85, 105, 0.80);
"""

# --- Patch index.css ---
css_path = 'src/index.css'
with open(css_path) as f:
    css = f.read()

# Extra tokens added in second extension pass (purple, indigo, success/warning fine-tuning)
EXTRA_TOKENS_DARK = """
  --clr-accent-35:    rgba(96, 165, 250, 0.35);
  --clr-accent-45:    rgba(96, 165, 250, 0.45);
  --clr-accent-60:    rgba(96, 165, 250, 0.60);
  --clr-accent-70:    rgba(96, 165, 250, 0.70);
  --clr-accent-80:    rgba(96, 165, 250, 0.80);
  --clr-accent-90:    rgba(96, 165, 250, 0.90);
  --clr-border-35:    rgba(148, 163, 184, 0.35);
  --clr-border-80:    rgba(148, 163, 184, 0.80);
  --clr-border-90:    rgba(148, 163, 184, 0.90);
  --clr-success-30:   rgba(74, 222, 128, 0.30);
  --clr-success-60:   rgba(74, 222, 128, 0.60);
  --clr-purple:       #a78bfa;
  --clr-purple-08:    rgba(167, 139, 250, 0.08);
  --clr-purple-15:    rgba(167, 139, 250, 0.15);
  --clr-purple-20:    rgba(167, 139, 250, 0.20);
  --clr-purple-25:    rgba(167, 139, 250, 0.25);
  --clr-purple-30:    rgba(167, 139, 250, 0.30);
  --clr-purple-35:    rgba(167, 139, 250, 0.35);
  --clr-purple-40:    rgba(167, 139, 250, 0.40);
  --clr-purple-60:    rgba(167, 139, 250, 0.60);
  --clr-purple-light: #c084fc;
  --clr-indigo-03:    rgba(99, 102, 241, 0.03);
  --clr-indigo-10:    rgba(99, 102, 241, 0.10);
  --clr-indigo-20:    rgba(99, 102, 241, 0.20);
  --clr-indigo-25:    rgba(99, 102, 241, 0.25);
  --clr-indigo-30:    rgba(99, 102, 241, 0.30);
  --clr-success-12:   rgba(74, 222, 128, 0.12);
  --clr-success-20:   rgba(74, 222, 128, 0.20);
  --clr-success-25:   rgba(74, 222, 128, 0.25);
  --clr-success-35:   rgba(74, 222, 128, 0.35);
  --clr-success-40:   rgba(74, 222, 128, 0.40);
  --clr-warning-20:   rgba(251, 191, 36, 0.20);
  --clr-warning-30:   rgba(251, 191, 36, 0.30);
  --clr-warning-40:   rgba(251, 191, 36, 0.40);
  --clr-danger-25:    rgba(239, 68, 68, 0.25);
  --clr-text-4-12:    rgba(71, 85, 105, 0.12);
  --clr-text-4-80:    rgba(71, 85, 105, 0.80);
"""

EXTRA_TOKENS_LIGHT = """
  --clr-accent-35:    rgba(37, 99, 235, 0.35);
  --clr-accent-45:    rgba(37, 99, 235, 0.45);
  --clr-accent-60:    rgba(37, 99, 235, 0.60);
  --clr-accent-70:    rgba(37, 99, 235, 0.70);
  --clr-accent-80:    rgba(37, 99, 235, 0.80);
  --clr-accent-90:    rgba(37, 99, 235, 0.90);
  --clr-border-35:    rgba(15, 23, 42, 0.25);
  --clr-border-80:    rgba(15, 23, 42, 0.55);
  --clr-border-90:    rgba(15, 23, 42, 0.65);
  --clr-success-30:   rgba(22, 163, 74, 0.30);
  --clr-success-60:   rgba(22, 163, 74, 0.60);
  --clr-purple:       #7c3aed;
  --clr-purple-08:    rgba(124, 58, 237, 0.08);
  --clr-purple-15:    rgba(124, 58, 237, 0.15);
  --clr-purple-20:    rgba(124, 58, 237, 0.20);
  --clr-purple-25:    rgba(124, 58, 237, 0.25);
  --clr-purple-30:    rgba(124, 58, 237, 0.30);
  --clr-purple-35:    rgba(124, 58, 237, 0.35);
  --clr-purple-40:    rgba(124, 58, 237, 0.40);
  --clr-purple-60:    rgba(124, 58, 237, 0.60);
  --clr-purple-light: #a78bfa;
  --clr-indigo-03:    rgba(79, 70, 229, 0.03);
  --clr-indigo-10:    rgba(79, 70, 229, 0.10);
  --clr-indigo-20:    rgba(79, 70, 229, 0.20);
  --clr-indigo-25:    rgba(79, 70, 229, 0.25);
  --clr-indigo-30:    rgba(79, 70, 229, 0.30);
  --clr-success-12:   rgba(22, 163, 74, 0.12);
  --clr-success-20:   rgba(22, 163, 74, 0.20);
  --clr-success-25:   rgba(22, 163, 74, 0.25);
  --clr-success-35:   rgba(22, 163, 74, 0.35);
  --clr-success-40:   rgba(22, 163, 74, 0.40);
  --clr-warning-20:   rgba(217, 119, 6, 0.20);
  --clr-warning-30:   rgba(217, 119, 6, 0.30);
  --clr-warning-40:   rgba(217, 119, 6, 0.40);
  --clr-danger-25:    rgba(220, 38, 38, 0.25);
  --clr-text-4-12:    rgba(71, 85, 105, 0.12);
  --clr-text-4-80:    rgba(71, 85, 105, 0.80);
"""

DARK_ANCHOR = '  /* Legacy aliases (backward compat) */'
LIGHT_ANCHOR = '  /* Legacy aliases */'

# NEW_TOKENS_DARK/LIGHT has full set; inject only what's missing
dark_css_block = css.split(DARK_ANCHOR)[0] if DARK_ANCHOR in css else ''
light_css_block = css.split('[data-theme="light"]')[-1] if '[data-theme="light"]' in css else ''

if '--clr-bg-page-65' not in dark_css_block:
    css = css.replace(DARK_ANCHOR, NEW_TOKENS_DARK + '\n  ' + DARK_ANCHOR.strip())
    print('Added dark tokens (full set)')
elif '--clr-purple-08' not in dark_css_block:
    css = css.replace(DARK_ANCHOR, EXTRA_TOKENS_DARK + '\n  ' + DARK_ANCHOR.strip())
    print('Added extra dark tokens')

if '--clr-bg-page-65' not in light_css_block:
    css = css.replace(LIGHT_ANCHOR, NEW_TOKENS_LIGHT + '\n  ' + LIGHT_ANCHOR.strip())
    print('Added light tokens (full set)')
elif '--clr-purple-08' not in light_css_block:
    css = css.replace(LIGHT_ANCHOR, EXTRA_TOKENS_LIGHT + '\n  ' + LIGHT_ANCHOR.strip())
    print('Added extra light tokens')

with open(css_path, 'w') as f:
    f.write(css)

# --- Fix SCSS files ---
scss_files = glob.glob('src/**/*.scss', recursive=True)
total_lines = 0
changed_files = 0

for fpath in scss_files:
    with open(fpath) as f:
        original = f.read()
    content = original

    lines = content.split('\n')
    new_lines = []
    for line in lines:
        stripped = line.lstrip()
        # Skip SCSS variable declarations like $gold: #fcd34d;
        if re.match(r'^\$[a-zA-Z]', stripped) and ':' in stripped:
            new_lines.append(line)
            continue
        # Apply all replacements
        for pattern, replacement in REPLACEMENTS:
            line = re.sub(pattern, replacement, line)
        new_lines.append(line)

    content = '\n'.join(new_lines)
    if content != original:
        diff = sum(1 for a, b in zip(original.split('\n'), content.split('\n')) if a != b)
        total_lines += diff
        changed_files += 1
        with open(fpath, 'w') as f:
            f.write(content)

print(f'Fixed {total_lines} lines across {changed_files} files')

# --- Count remaining ---
remaining = 0
for fpath in glob.glob('src/**/*.scss', recursive=True):
    for line in open(fpath):
        s = line.lstrip()
        if re.match(r'^\$[a-zA-Z]', s) and ':' in s:
            continue
        if '//' in s:
            continue
        matches = re.findall(r'#[0-9a-fA-F]{3,6}|rgba\([^)]+\)', line)
        for m in matches:
            if 'var(--' not in m and 'rgba($' not in m:
                remaining += 1

print(f'Remaining hardcoded: {remaining}')
