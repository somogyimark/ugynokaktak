/** Shared SVG filters, rendered once at the app root (visually hidden). */
export function SvgDefs() {
  return (
    <svg aria-hidden="true" focusable="false" width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        {/* Rough, eroded edges for rubber stamps. */}
        <filter id="worn-edge" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.4" xChannelSelector="R" yChannelSelector="G" result="displaced" />
          <feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves="2" seed="3" result="holes" />
          <feColorMatrix in="holes" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.8 1.7" result="mask" />
          <feComposite in="displaced" in2="mask" operator="in" />
        </filter>
        {/* Slight ink bleed for typed text on cards. */}
        <filter id="ink-bleed" x="-2%" y="-10%" width="104%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="1" seed="11" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="0.9" />
        </filter>
      </defs>
    </svg>
  );
}
