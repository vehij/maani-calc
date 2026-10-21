// Isometric "stack of frames" — the studio's take on the building render in the
// reference dashboard: floors of film frames, one floor lit in orange.

type P = [number, number];

const S = 22; // scale
const CX = 200;
const CY = 110;

function iso(x: number, y: number, z: number): P {
  return [CX + (x - y) * 0.866 * S, CY + (x + y) * 0.5 * S - z * S];
}

function poly(points: P[]) {
  return points.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
}

function box(x0: number, y0: number, z0: number, w: number, d: number, h: number) {
  const x1 = x0 + w;
  const y1 = y0 + d;
  const z1 = z0 + h;
  return {
    top: poly([iso(x0, y0, z1), iso(x1, y0, z1), iso(x1, y1, z1), iso(x0, y1, z1)]),
    right: poly([iso(x1, y0, z0), iso(x1, y1, z0), iso(x1, y1, z1), iso(x1, y0, z1)]),
    left: poly([iso(x0, y1, z0), iso(x1, y1, z0), iso(x1, y1, z1), iso(x0, y1, z1)]),
  };
}

export function FilmStack({ className, litFloor = 3 }: { className?: string; litFloor?: number }) {
  const W = 7;
  const D = 5;
  const floors = 5;
  const plate = 0.28;
  const story = 1.45;
  const inset = 0.35;
  const elements: React.ReactNode[] = [];

  // ground shadow
  elements.push(
    <polygon
      key="shadow"
      points={poly([iso(-1, -1, 0), iso(W + 1.4, -1, 0), iso(W + 1.4, D + 1.4, 0), iso(-1, D + 1.4, 0)])}
      fill="url(#fs-shadow)"
    />,
  );

  for (let f = 0; f < floors; f++) {
    const z = f * story;
    const lit = f === litFloor;
    // floor plate (drawn first: the body sits on top of it)
    const p = box(0, 0, z, W, D, plate);
    elements.push(
      <g key={`p${f}`}>
        <polygon points={p.left} fill="#e9ebee" />
        <polygon points={p.right} fill="#dadde1" />
        <polygon points={p.top} fill="#f6f7f8" />
      </g>,
    );
    // recessed body with frames
    const body = box(inset, inset, z + plate, W - inset * 2, D - inset * 2, story - plate);
    elements.push(
      <g key={`b${f}`}>
        <polygon points={body.left} fill={lit ? "#f7a476" : "#d9dcdf"} />
        <polygon points={body.right} fill={lit ? "#ee8a55" : "#c9cdd1"} />
      </g>,
    );
    // frames on the left (y = D) face
    const cols = 6;
    for (let i = 0; i < cols; i++) {
      const fw = (W - inset * 2) / cols;
      const x0 = inset + i * fw + 0.12;
      const x1 = x0 + fw - 0.24;
      const za = z + plate + 0.2;
      const zb = z + story - 0.2;
      const y = D - inset + 0.001;
      elements.push(
        <polygon
          key={`fl${f}-${i}`}
          points={poly([iso(x0, y, za), iso(x1, y, za), iso(x1, y, zb), iso(x0, y, zb)])}
          fill={lit ? (i % 2 ? "#f2692c" : "#ff8b4d") : "#eef0f2"}
          stroke={lit ? "#d9561c" : "#b9bec4"}
          strokeWidth="0.8"
        />,
      );
    }
    // frames on the right (x = W) face
    const rows = 4;
    for (let i = 0; i < rows; i++) {
      const fd = (D - inset * 2) / rows;
      const y0 = inset + i * fd + 0.12;
      const y1 = y0 + fd - 0.24;
      const za = z + plate + 0.2;
      const zb = z + story - 0.2;
      const x = W - inset + 0.001;
      elements.push(
        <polygon
          key={`fr${f}-${i}`}
          points={poly([iso(x, y0, za), iso(x, y1, za), iso(x, y1, zb), iso(x, y0, zb)])}
          fill={lit ? "#e5733a" : "#e2e5e8"}
          stroke={lit ? "#c94f17" : "#adb3ba"}
          strokeWidth="0.8"
        />,
      );
    }
  }
  // roof
  const roof = box(0, 0, floors * story, W, D, plate);
  elements.push(
    <g key="roof">
      <polygon points={roof.left} fill="#e9ebee" />
      <polygon points={roof.right} fill="#dadde1" />
      <polygon points={roof.top} fill="#fafafa" />
    </g>,
  );
  // camera on the roof
  const cam = box(2.4, 1.6, floors * story + plate, 2, 1.4, 1);
  const lens = box(4.4, 1.95, floors * story + plate + 0.3, 0.9, 0.7, 0.45);
  elements.push(
    <g key="cam">
      <polygon points={cam.left} fill="#3a3e45" />
      <polygon points={cam.right} fill="#2a2d32" />
      <polygon points={cam.top} fill="#4b5058" />
      <polygon points={lens.left} fill="#2a2d32" />
      <polygon points={lens.right} fill="#f2692c" />
      <polygon points={lens.top} fill="#3a3e45" />
    </g>,
  );

  return (
    <svg viewBox="40 -110 360 400" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="fs-shadow">
          <stop offset="0" stopColor="#000" stopOpacity="0.14" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      {elements}
    </svg>
  );
}
