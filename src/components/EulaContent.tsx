const EULA_SECTIONS: { h: string; b: string }[] = [
  {
    h: "1. Acceptance of Terms",
    b: "By using the Software, you confirm that you have read, understood, and agreed to be legally bound by this Agreement. If you are using the Software on behalf of an organization, you represent that you are authorized to bind that organization.",
  },
  {
    h: "2. License Grant",
    b: "Subject to your compliance with this Agreement, you are granted a limited, non-exclusive, non-transferable, revocable license to use the Software for internal engineering screening, education, and design-support purposes only. You may not sublicense, rent, lease, sell, redistribute, reverse engineer, decompile, or create derivative works.",
  },
  {
    h: "3. Engineering Disclaimer",
    b: "The Software is a decision-support tool only. It does not replace professional engineering judgment, qualified review, or compliance verification against the latest approved revisions of project codes, client specifications, and governing standards (ASME B31.3, MSS SP-58/69/89/127, PFI ES-26, API, ISO and applicable national codes). All outputs must be independently verified by a qualified piping engineer before being used for procurement, fabrication, construction, commissioning, or operation.",
  },
  {
    h: "4. No Professional Liability",
    b: "The Software does not constitute professional engineering services, certification, or stamped deliverables. The User is solely responsible for verifying every result and obtaining sign-off from a qualified, licensed engineer.",
  },
  {
    h: "5. Local Data Storage",
    b: "The Software stores design inputs, saved projects and overrides locally on your device using browser storage. You are solely responsible for backing up this data.",
  },
  {
    h: "6. No Warranties (AS IS)",
    b: 'THE SOFTWARE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE.',
  },
  {
    h: "7. Limitation of Liability",
    b: "TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL THE OWNERS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY OR PUNITIVE DAMAGES, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. USE OF THE SOFTWARE IS ENTIRELY AT THE USER'S OWN RISK.",
  },
  {
    h: "8. Intellectual Property",
    b: "References to ASME, API, ISO and other third-party standards are the property of their respective organizations and are used solely for identification.",
  },
  {
    h: "9. Termination",
    b: "This license remains in effect until terminated. Upon termination you must cease all use of the Software.",
  },
  {
    h: "10. Updates",
    b: "Continued use after a material update to this Agreement constitutes acceptance of the revised terms.",
  },
];

export function EulaContent() {
  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <p>
        This End User License Agreement (&quot;Agreement&quot;) is a binding legal agreement between
        you (the &quot;User&quot;) and the Owners governing your use of the Pipe Support Smart
        Assist (the &quot;Software&quot;).
      </p>
      {EULA_SECTIONS.map((s) => (
        <div key={s.h}>
          <h3 className="mb-1 font-semibold text-foreground">{s.h}</h3>
          <p className="text-muted-foreground">{s.b}</p>
        </div>
      ))}
      <p className="border-t border-border pt-3 text-xs text-muted-foreground">
        Copyright 2026 Pipe Support Smart Assist. All rights reserved.
      </p>
    </div>
  );
}
