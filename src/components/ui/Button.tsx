import { cn } from "@/lib/utils";
import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "inverse";
type Size = "md" | "lg";

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-grove-600 text-white hover:bg-grove-700 shadow-soft hover:shadow-lifted focus-visible:outline-grove-700",
  secondary:
    "bg-transparent text-ink-900 border border-ink-400 hover:border-ink-900 hover:bg-ink-50 focus-visible:outline-grove-700",
  ghost: "bg-transparent text-ink-700 hover:text-ink-900 hover:bg-ink-100 focus-visible:outline-grove-700",
  // Used on dark/colored surfaces (e.g. inside CTABanner's grove-700 band) —
  // needs its own light-colored ring rather than the site's default grove
  // one, which would nearly disappear against a similarly-dark backdrop.
  inverse:
    "bg-paper-100 text-ink-900 hover:bg-white shadow-soft hover:shadow-lifted focus-visible:outline-paper-100",
};

const sizeStyles: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 ease-confident focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
};

type ButtonAsLink = CommonProps & {
  href: string;
  external?: boolean;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

type ButtonAsButton = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

export function Button(props: ButtonAsLink | ButtonAsButton) {
  const { variant = "primary", size = "lg", className, ...rest } = props;
  const classes = cn(base, variantStyles[variant], sizeStyles[size], className);

  if ("href" in rest && rest.href) {
    const { href, external, ...anchorProps } = rest as ButtonAsLink;
    if (external) {
      return (
        <a href={href} target="_blank" rel="noreferrer noopener" className={classes} {...anchorProps}>
          {props.children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...anchorProps}>
        {props.children}
      </Link>
    );
  }

  const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button className={classes} {...buttonProps}>
      {props.children}
    </button>
  );
}
