import type { StoreSettings } from "@/lib/types";

export type TypographyOverride = {
  font?: string;
  color?: string;
  size?: string;
};

export function typographyStyle(
  settings: StoreSettings,
  kind: "heading" | "subheading",
  override?: TypographyOverride,
): Record<string, string> {
  const prefix = kind === "heading" ? "heading" : "subheading";
  const font = override?.font || settings[`${prefix}_font` as keyof StoreSettings];
  const color = override?.color || settings[`${prefix}_color` as keyof StoreSettings];
  const size = override?.size || settings[`${prefix}_size` as keyof StoreSettings];

  return {
    ...(typeof font === "string" && font ? { fontFamily: font } : {}),
    ...(typeof color === "string" && color ? { color } : {}),
    ...(typeof size === "string" && size ? { fontSize: size } : {}),
  };
}

export function sectionTypography(
  config: Record<string, unknown> | null | undefined,
  kind: "heading" | "subheading",
): TypographyOverride {
  const prefix = kind === "heading" ? "heading" : "subheading";
  const font = config?.[`${prefix}_font`];
  const color = config?.[`${prefix}_color`];
  const size = config?.[`${prefix}_size`];
  return {
    ...(typeof font === "string" ? { font } : {}),
    ...(typeof color === "string" ? { color } : {}),
    ...(typeof size === "string" ? { size } : {}),
  };
}
