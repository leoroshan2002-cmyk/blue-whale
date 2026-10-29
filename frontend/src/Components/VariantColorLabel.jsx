const isHexColor = (value) => typeof value === "string" && /^#[\da-f]{3}(?:[\da-f]{3})?$/i.test(value);

export default function VariantColorLabel({ color, hex, prefix = "Color" }) {
  if (!color) return null;

  return (
    <span className="inline-flex items-center gap-2">
      {prefix}:{" "}
      {isHexColor(hex) && (
        <span
          aria-hidden="true"
          className="inline-block h-3 w-3 rounded-full border border-black/20"
          style={{ backgroundColor: hex }}
        />
      )}
      {color}
    </span>
  );
}
