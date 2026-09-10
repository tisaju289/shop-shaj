import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function SmartLink({
  to,
  className,
  activeClassName,
  onClick,
  children,
}: {
  to: string;
  className?: string;
  activeClassName?: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  const isExternal = /^(https?:|mailto:|tel:)/i.test(to);

  if (isExternal) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noreferrer"
        className={className}
        onClick={onClick}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      to={to as never}
      className={className}
      onClick={onClick}
      activeProps={activeClassName ? { className: activeClassName } : undefined}
    >
      {children}
    </Link>
  );
}
