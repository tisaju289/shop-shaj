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
  return {
    font: typeof config?.[`${prefix}_font`] === "string" ? config[`${prefix}_font`] as string : undefined,
    color: typeof config?.[`${prefix}_color`] === "string" ? config[`${prefix}_color`] as string : undefined,
    size: typeof config?.[`${prefix}_size`] === "string" ? config[`${prefix}_size`] as string : undefined,
  };
}
