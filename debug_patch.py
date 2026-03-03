#!/usr/bin/env python3
"""Debug LINE_BRACKET_RE on real Reddit format."""
import json, re, sys

LINE_BRACKET_RE = re.compile(
    r'^[ \t\uffa0\u3164\u00a0\u200b\u200c\u200d]*'
    r'(?:\*\s+\*\*|\*\*)?'
    r'\[([^\]\n\r]+)\]'
    r'(?:\*\*)?'
    r'[ \t\uffa0\u3164\u00a0\u200b\u200c\u200d\r]*$',
    re.MULTILINE
)

# Test: real Reddit format from 2.1.60-adv
sample = """To bring you a better gaming experience.

**[Introduction to the New Battle Loading System]**

* **[New Chat System]**

During battle loading, you can chat.

* **[Customizable Honor Badges]**

You can customize honor badges.

* **[New Interface Style]**

The art style has been revamped.
"""

print('=== MATCHES in real Reddit format ===')
for m in LINE_BRACKET_RE.finditer(sample):
    print(' MATCH:', repr(m.group(0)), '->', repr(m.group(1)))
