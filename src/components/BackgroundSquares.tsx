"use client";

const LIT_SQUARES: Array<{
  col: number;
  row: number;
  tone: "ember" | "cyan";
  delay: string;
}> = [
  { col: 2, row: 1, tone: "cyan", delay: "0s" },
  { col: 5, row: 3, tone: "ember", delay: "1.4s" },
  { col: 8, row: 2, tone: "cyan", delay: "2.8s" },
  { col: 12, row: 1, tone: "ember", delay: "0.7s" },
  { col: 16, row: 4, tone: "cyan", delay: "3.3s" },
  { col: 20, row: 2, tone: "ember", delay: "1.9s" },
  { col: 23, row: 5, tone: "cyan", delay: "4.1s" },
  { col: 3, row: 7, tone: "ember", delay: "2.2s" },
  { col: 7, row: 9, tone: "cyan", delay: "0.9s" },
  { col: 14, row: 8, tone: "ember", delay: "3.7s" },
  { col: 19, row: 10, tone: "cyan", delay: "1.6s" },
  { col: 24, row: 8, tone: "ember", delay: "2.9s" },
  { col: 4, row: 13, tone: "cyan", delay: "3.1s" },
  { col: 11, row: 14, tone: "ember", delay: "0.4s" },
  { col: 21, row: 13, tone: "cyan", delay: "2.4s" },
];

export function BackgroundSquares() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none print:hidden"
    >
      {/* Ambient Atmospheric Glows */}
      <div className="absolute -top-28 right-[8%] h-[420px] w-[580px] rounded-full bg-[#ff4b33]/[0.09] blur-[130px]" />
      <div className="absolute top-[12%] left-[6%] h-[360px] w-[480px] rounded-full bg-cyan-400/[0.06] blur-[120px]" />
      <div className="absolute bottom-[-120px] left-1/2 h-[340px] w-[640px] -translate-x-1/2 rounded-full bg-[#ff5b45]/[0.05] blur-[130px]" />

      {/* Architectural 56px Square Grid + Lit Accent Squares */}
      <svg
        className="h-full w-full [mask-image:radial-gradient(ellipse_92%_82%_at_50%_26%,#000_38%,rgba(0,0,0,0.45)_72%,transparent_100%)]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Base 56x56 Square Tile */}
          <pattern
            id="ealpr-square-grid"
            width="56"
            height="56"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 56 0 L 0 0 0 56"
              fill="none"
              stroke="rgba(148, 163, 184, 0.09)"
              strokeWidth="1"
            />
          </pattern>

          {/* Major 224x224 (4x4) Architectural Block Accent + Corner Crosshairs */}
          <pattern
            id="ealpr-major-squares"
            width="224"
            height="224"
            patternUnits="userSpaceOnUse"
          >
            <rect
              width="224"
              height="224"
              fill="none"
              stroke="rgba(255, 255, 255, 0.045)"
              strokeWidth="1"
            />
            <path
              d="M -4 0 L 4 0 M 0 -4 L 0 4"
              stroke="rgba(34, 211, 238, 0.25)"
              strokeWidth="1"
            />
          </pattern>
        </defs>

        {/* Full-Screen Square Grid Layers */}
        <rect width="100%" height="100%" fill="url(#ealpr-square-grid)" />
        <rect width="100%" height="100%" fill="url(#ealpr-major-squares)" />

        {/* Scattered Softly Glowing Ember & Cyan Accent Squares */}
        <g>
          {LIT_SQUARES.map((sq, idx) => {
            const isEmber = sq.tone === "ember";
            return (
              <rect
                key={idx}
                x={sq.col * 56 + 0.5}
                y={sq.row * 56 + 0.5}
                width="55"
                height="55"
                rx="2"
                fill={
                  isEmber
                    ? "rgba(255, 75, 51, 0.085)"
                    : "rgba(34, 211, 238, 0.075)"
                }
                stroke={
                  isEmber
                    ? "rgba(255, 110, 78, 0.24)"
                    : "rgba(34, 211, 238, 0.22)"
                }
                strokeWidth="1"
                style={{ animationDelay: sq.delay }}
                className="animate-square-pulse"
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
