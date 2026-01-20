# Phase 2: Device Registry - Context

**Gathered:** 2026-01-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Define comprehensive device presets with category organization. The registry is a data structure containing 50+ devices with viewport dimensions, scale factors, and category assignments. API functions expose devices for filtering by category.

</domain>

<decisions>
## Implementation Decisions

### Category boundaries
- Three categories only: `phones`, `tablets`, `pc-laptops`
- Foldable phones excluded entirely (too niche)
- Large phones (Pro Max, Ultra) always categorized as phones regardless of screen size
- Laptops and desktop monitors combined into single `pc-laptops` category
- All tablets together regardless of brand/OS — no subcategories, no e-readers

### Device selection criteria
- Include evergreen popular models still in common use (not just latest generation)
- Phone brands: Apple, Samsung, Google, plus Chinese brands (Xiaomi, OnePlus, Huawei) for global coverage
- PC screens: Common breakpoints (1366x768, 1920x1080, 2560x1440) PLUS ultrawide (3440x1440, 5120x1440) PLUS 4K+ (3840x2160)

### Device naming
- Technical names with dimensions: "iPhone 15 Pro Max (430x932)"
- Both marketing-recognizable AND includes viewport size

### Claude's Discretion
- Exact device model selection within criteria above
- Scale factor values per device
- Sort order within categories
- Data structure shape (flat vs nested)

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-device-registry*
*Context gathered: 2026-01-20*
