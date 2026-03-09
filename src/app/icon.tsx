import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#4a1870",
          borderRadius: "50%",
        }}
      >
        {/* left angle bracket */}
        <span
          style={{
            color: "#ffffff",
            fontSize: "11px",
            fontWeight: 700,
            fontFamily: "monospace",
            lineHeight: 1,
            letterSpacing: "-1px",
          }}
        >
          {"</>"}
        </span>
      </div>
    ),
    { ...size }
  );
}
