/**
 * Organic section-break signature element (see docs/DESIGN-SYSTEM.md "Visual
 * polish pass" — borrowed from Misfits Market's wavy section dividers,
 * reinterpreted as a horizon/field line to fit FarmNomad's own palette).
 * `fill` is the color of the section this divider introduces, so it should
 * match that section's background exactly, not the section above it — the
 * wave "belongs" to what comes after it, like a hill rising into view.
 */
export function WaveDivider({ fill, flip = false }: { fill: string; flip?: boolean }) {
  return (
    <div aria-hidden="true" className={flip ? "rotate-180" : undefined}>
      <svg
        className="block h-[34px] w-full md:h-[52px]"
        preserveAspectRatio="none"
        viewBox="0 0 1440 60"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M0,32 C240,60 480,4 720,20 C960,36 1200,58 1440,26 L1440,60 L0,60 Z" fill={fill} />
      </svg>
    </div>
  );
}
