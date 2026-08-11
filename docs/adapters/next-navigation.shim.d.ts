/**
 * Minimal type shim for `next/navigation` so the Next.js adapter example can
 * be typechecked without installing Next. The signatures mirror Next 14/15's
 * app-router client hooks (the subset the example uses).
 */
declare module "next/navigation" {
  export function usePathname(): string;
  export function useRouter(): {
    push(href: string, options?: { scroll?: boolean }): void;
    replace(href: string, options?: { scroll?: boolean }): void;
    back(): void;
    forward(): void;
    refresh(): void;
    prefetch(href: string): void;
  };
}
