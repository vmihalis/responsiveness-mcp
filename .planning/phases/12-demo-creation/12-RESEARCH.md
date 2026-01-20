# Phase 12: Demo Creation - Research

**Researched:** 2026-01-20
**Domain:** Terminal GIF recording with VHS
**Confidence:** HIGH

## Summary

This phase covers creating a high-quality demo GIF showing the screenie CLI in action. The prior decision to use **VHS (charmbracelet/vhs)** is confirmed as the standard tool for programmatic terminal recording. VHS is a declarative terminal GIF recorder that uses `.tape` script files to define terminal interactions, producing reproducible demos ideal for README and landing page use.

The key challenge is achieving the **under 5MB file size** requirement while maintaining visual quality. This requires careful tuning of VHS settings (dimensions, framerate) combined with post-processing optimization using gifsicle.

**Primary recommendation:** Create a `.tape` script that demonstrates screenie capturing a real website (example.com or similar), with terminal dimensions optimized for small file size (~800x400), low framerate (10-15fps), and post-process with gifsicle for final optimization.

## Standard Stack

The established tools for terminal GIF demo creation:

### Core
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| VHS | 0.10.0 | Terminal GIF recording | Declarative, reproducible, programmatic - industry standard for CLI demos |
| ttyd | 1.7.7 | Terminal web sharing | Required VHS dependency |
| ffmpeg | latest | Video processing | Required VHS dependency for encoding |

### Supporting
| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| gifsicle | latest | GIF optimization | Post-processing to reduce file size with lossy compression |
| gifski | 1.34.x | High-quality GIF encoding | Alternative if extreme quality needed (larger files) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| VHS | asciinema | asciinema outputs .cast files requiring web player; VHS produces standalone GIFs |
| VHS | manual screen recording | Not reproducible, requires manual editing each time |
| gifsicle | online tools | CLI is automatable and reproducible |

**Installation (Arch Linux):**
```bash
# Install VHS and dependencies
sudo pacman -S vhs ttyd ffmpeg

# Install gifsicle for optimization
sudo pacman -S gifsicle
```

## Architecture Patterns

### Recommended Project Structure
```
/home/memehalis/responsiveness-mcp/
├── demo/
│   ├── demo.tape         # VHS script for recording
│   ├── demo.gif          # Output GIF (gitignored if large)
│   └── README.md         # Demo generation instructions
├── assets/               # Alternative location for demo assets
│   └── demo.gif
└── ...
```

### Pattern 1: VHS Tape File Structure
**What:** Declarative script defining terminal session
**When to use:** All terminal demo recordings
**Example:**
```tape
# Source: VHS documentation
# https://github.com/charmbracelet/vhs

# Output configuration
Output demo.gif

# Require dependencies to fail fast
Require screenie

# Terminal settings for small file size
Set Shell "bash"
Set FontSize 18
Set Width 800
Set Height 400
Set Padding 10
Set Framerate 15
Set TypingSpeed 75ms

# Hide setup commands
Hide
Type "cd /tmp/demo"
Enter
Sleep 500ms
Show

# Demo content
Type "screenie https://example.com --phones-only"
Sleep 500ms
Enter

# Wait for completion (use Wait command for async)
Sleep 10s
```

### Pattern 2: Size-Optimized Recording
**What:** VHS settings tuned for small file size
**When to use:** When GIF must be under 5MB
**Example:**
```tape
# Source: VHS documentation - smaller files
# https://github.com/charmbracelet/vhs/blob/main/README.md

# Smaller dimensions = smaller file
Set Width 800
Set Height 400
Set FontSize 16

# Lower framerate = fewer frames = smaller file
Set Framerate 10

# Faster playback = shorter duration = smaller file
Set PlaybackSpeed 1.5
```

### Pattern 3: Post-Processing with gifsicle
**What:** Lossy compression to reduce GIF size
**When to use:** After VHS generation to meet size requirements
**Example:**
```bash
# Source: gifsicle documentation
# https://www.lcdf.org/gifsicle/man.html

# Aggressive optimization with lossy compression
gifsicle -O3 --lossy=80 --colors 256 demo.gif -o demo-optimized.gif

# Check file size
du -h demo-optimized.gif

# If still too large, reduce colors further
gifsicle -O3 --lossy=80 --colors 128 demo.gif -o demo-smaller.gif
```

### Anti-Patterns to Avoid
- **Recording real user interaction:** Use VHS tape files for reproducibility, not screen capture
- **Large terminal dimensions:** 1200x600 produces huge files; keep under 900x500
- **High framerate:** 30fps is unnecessary for CLI demos; 10-15fps is sufficient
- **Full device list in demo:** 57 devices takes too long; use `--phones-only` or similar filter

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Terminal recording | Screen recorder + editing | VHS tape file | Reproducible, scriptable, no manual work |
| GIF optimization | Custom ffmpeg commands | gifsicle | Handles LZW, color reduction, frame optimization |
| Terminal styling | Custom CSS/themes | VHS themes | Built-in themes with proper terminal colors |
| Wait for async completion | Sleep with fixed time | VHS Wait command | Regex-based waiting handles variable timing |

**Key insight:** VHS's declarative approach means demos can be regenerated whenever the CLI changes, without manual re-recording.

## Common Pitfalls

### Pitfall 1: GIF File Size Explosion
**What goes wrong:** GIF exceeds 5MB, too slow to load
**Why it happens:** Default VHS settings optimize for quality, not size
**How to avoid:**
1. Use smaller dimensions (800x400 max)
2. Reduce framerate to 10-15fps
3. Post-process with gifsicle
4. Filter devices to show subset (e.g., `--phones-only`)
**Warning signs:** GIF over 3MB before optimization

### Pitfall 2: Missing VHS Dependencies
**What goes wrong:** VHS fails to record or export
**Why it happens:** ttyd or ffmpeg not installed
**How to avoid:** Use `Require` command at top of tape file
**Warning signs:** Error messages about missing programs

### Pitfall 3: Non-Reproducible Demo
**What goes wrong:** Demo shows stale output when CLI changes
**Why it happens:** Manual recording not tied to source
**How to avoid:**
1. Store .tape file in repo
2. Document regeneration process
3. Add npm script for regeneration
**Warning signs:** Demo doesn't match current CLI output

### Pitfall 4: Demo Takes Too Long
**What goes wrong:** GIF runs for 30+ seconds, loses viewer attention
**Why it happens:** Recording full 57-device capture
**How to avoid:**
1. Use device filter (`--phones-only` = ~14 devices)
2. Increase playback speed (`Set PlaybackSpeed 1.5`)
3. Target 5-15 second final duration
**Warning signs:** Tape file has `Sleep 30s` or similar

### Pitfall 5: Screenshot Real Session Instead of Script
**What goes wrong:** Demo includes personal info, wrong directory, mistakes
**Why it happens:** Using `vhs record` instead of tape file
**How to avoid:** Write tape file manually, never record real session
**Warning signs:** Using `vhs record` command

### Pitfall 6: Website Unavailable During Recording
**What goes wrong:** Demo shows error instead of successful capture
**Why it happens:** Demo targets website that goes down
**How to avoid:** Use reliable, public website (example.com, httpbin.org)
**Warning signs:** Demo captures localhost or personal project

## Code Examples

Verified patterns for this phase:

### Complete Demo Tape File
```tape
# screenie CLI demo
# Run with: vhs demo.tape

Output demo/demo.gif

# Dependencies
Require screenie

# Terminal configuration for small file size
Set Shell "bash"
Set FontSize 18
Set Width 850
Set Height 450
Set Padding 12
Set Framerate 12
Set TypingSpeed 50ms
Set Theme "Catppuccin Mocha"

# Optional: window decoration
Set WindowBar Colorful

# Demo sequence
Type "screenie https://example.com --phones-only"
Sleep 750ms
Enter

# Wait for progress output (adjust based on actual timing)
Sleep 12s

# Final pause to show completion
Sleep 2s
```

### Post-Processing Script
```bash
#!/bin/bash
# demo/generate.sh

# Generate GIF with VHS
vhs demo/demo.tape

# Optimize for file size
gifsicle -O3 --lossy=80 --colors 200 demo/demo.gif -o demo/demo-optimized.gif

# Check size
SIZE=$(du -k demo/demo-optimized.gif | cut -f1)
if [ "$SIZE" -gt 5120 ]; then
  echo "Warning: GIF is ${SIZE}KB, exceeds 5MB target"
  # Try more aggressive optimization
  gifsicle -O3 --lossy=100 --colors 128 demo/demo.gif -o demo/demo-optimized.gif
fi

# Report final size
du -h demo/demo-optimized.gif
```

### npm Script Integration
```json
{
  "scripts": {
    "demo": "vhs demo/demo.tape && gifsicle -O3 --lossy=80 demo/demo.gif -o demo/demo.gif"
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Screen recording + editing | VHS tape files | 2022 | Reproducible, scriptable demos |
| asciinema (web player) | VHS (standalone GIF) | 2022 | No external player needed |
| GIF optimization via ffmpeg | gifsicle | N/A | Purpose-built tool, better results |

**Current (as of VHS 0.10.0):**
- WindowBar styling options for modern look
- Wait command supports regex for async completion
- Env command for environment variables
- Source command for modular tape files

## Open Questions

Things that couldn't be fully resolved:

1. **Optimal dimensions for 5MB target**
   - What we know: Smaller is better; 800x400 is reasonable starting point
   - What's unclear: Exact dimensions that guarantee under 5MB with 12-15 seconds of content
   - Recommendation: Test iteratively, start at 800x450, reduce if needed

2. **Best website to demo against**
   - What we know: example.com is reliable and public
   - What's unclear: Whether example.com has interesting responsive differences
   - Recommendation: Test a few options (example.com, httpbin.org, news site) and pick most visually interesting

3. **Demo duration balance**
   - What we know: Shorter = smaller file, but need to show value
   - What's unclear: Minimum duration to demonstrate workflow meaningfully
   - Recommendation: Target 8-12 seconds, show command + progress + completion

## Sources

### Primary (HIGH confidence)
- [VHS GitHub Repository](https://github.com/charmbracelet/vhs) - Complete documentation
- [VHS README](https://github.com/charmbracelet/vhs/blob/main/README.md) - Settings, commands, examples
- [Arch Linux Manual](https://man.archlinux.org/man/extra/vhs/vhs.1.en) - VHS 0.10.0 reference

### Secondary (MEDIUM confidence)
- [gifsicle man page](https://www.lcdf.org/gifsicle/man.html) - Optimization flags verified
- [DigitalOcean GIF Guide](https://www.digitalocean.com/community/tutorials/how-to-make-and-optimize-gifs-on-the-command-line) - gifsicle usage examples

### Tertiary (LOW confidence)
- WebSearch results for GIF optimization - general guidance, tools may vary

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - VHS is well-documented, widely used for CLI demos
- Architecture: HIGH - VHS tape file format is stable and documented
- Pitfalls: MEDIUM - Based on documentation and common issues in GitHub issues
- File size optimization: MEDIUM - Depends on content, requires testing

**Research date:** 2026-01-20
**Valid until:** 2026-04-20 (VHS 0.10.x stable, low churn)

---

## System Dependencies Check

Current system status (Arch Linux ML4W):
- ffmpeg: Installed at `/usr/bin/ffmpeg`
- ttyd: NOT installed (available as `extra/ttyd 1.7.7-2`)
- vhs: NOT installed (available as `extra/vhs 0.10.0-1`)
- gifsicle: Unknown (likely available in repos)

**Installation required:**
```bash
sudo pacman -S vhs ttyd gifsicle
```
