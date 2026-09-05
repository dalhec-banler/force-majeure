# Visible consequences — development iteration

Branch: `development/visible-consequences`. September 4, 2026 (Chicago).

The author rejected the first cloud-seeding animation: bright soft blobs and screen-space rain streaks did not meet the existing visual standard. That renderer has been removed. The replacement composites multiscale cloud texture into the Earth shader at the seeded region, before the existing solar lighting. Clouds develop over five seconds; a textured precipitation veil develops beneath them. Both globe and flat-map projections use the same geographic field. Reduced motion fixes the new weather field in a mature static state.

This remains an art iteration, not an assertion that the author has accepted it. The small dated annotation and field report identify a recorded landing within the last review; their visual persistence does not extend the operation in the simulation. A renderer without WebGL retains the field report and annotation, but does not render this cloud texture.

Evidence:
- `rain-globe.png`: rejected first pass.
- `cloud-formation.png`: early formation in the replacement.
- `rain-globe-v2.png`: replacement after a fresh 1947 seeding operation.
- `rain-map-v2.png`: replacement in flat-map projection.

Validation: self-contained build remains below 4 MB; seven Node regression tests pass. Real-browser checks covered resume, a fresh seeding order, annual advancement, Locate, and switching globe/map. No season/frame errors were observed; the browser log also contained extension messaging errors. No frame-rate benchmark or full mobile-device pass has been performed.

Development changes carried by this branch also include save continuation consistency, restricted-funding containment, correct identification of cloud seeding for relief attribution, persistent driver stacking discounts, and tracing from resolved effects. Earlier saves display a warning before replaying under corrected rules. These are the first development slice; the broader audit backlog and strategic rebalance are not complete.
