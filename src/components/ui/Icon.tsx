import { icons, type LucideProps } from "lucide-react";

export type IconName = keyof typeof icons;

type IconProps = LucideProps & {
  name: string;
};

/**
 * Renders a lucide-react icon by string name, so icon choices can live as
 * plain data in site-config.ts instead of importing components everywhere.
 * Falls back to a neutral dot if a name doesn't match (keeps content edits
 * from ever crashing the page).
 */
export function Icon({ name, ...props }: IconProps) {
  const LucideIcon = icons[name as IconName] ?? icons.Circle;
  return <LucideIcon aria-hidden="true" {...props} />;
}
