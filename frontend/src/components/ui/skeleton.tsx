import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  bordered?: boolean;
}

export function Skeleton({
  className = '',
  bordered = false,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden bg-[#1e162a] ${
        bordered ? 'border-2 border-[#0e0917]' : ''
      } before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite] before:bg-gradient-to-r before:from-transparent before:via-[rgba(229,169,60,0.12)] before:to-transparent ${className}`}
      {...props}
    />
  );
}

/**
 * Comic Product Card Skeleton for Catalog and Wishlist grids
 */
export function ProductCardSkeleton() {
  return (
    <div className="product-card pointer-events-none select-none">
      {/* Cover Image Panel Skeleton */}
      <div className="relative h-[260px] border-b-[2.5px] border-[#0e0917] bg-[#140c1e] overflow-hidden">
        <Skeleton className="h-full w-full" />
        {/* Top badges skeleton */}
        <div className="absolute left-3 top-3 flex gap-2">
          <Skeleton className="h-6 w-20 border-2 border-[#0e0917] bg-[#2a1b38]" />
        </div>
        <div className="absolute right-3 top-3">
          <Skeleton className="h-6 w-16 border-2 border-[#0e0917] bg-[#2a1b38]" />
        </div>
        {/* Slashed bottom stripe skeleton */}
        <div className="absolute bottom-0 left-0 right-0 flex h-1.5 opacity-50">
          <div className="h-full w-3/4 bg-[#e5a93c]/30" />
          <div className="h-full w-1/4 bg-[#581c87]/30" />
        </div>
      </div>

      {/* Card Details Skeleton */}
      <div className="comic-halftone-purple flex flex-1 flex-col justify-between p-5 border-t border-[#0e0917]">
        <div>
          {/* Platform row skeleton */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-24 border border-[#0e0917] bg-[#231536]" />
            <Skeleton className="h-4 w-18 bg-[#231536]" />
          </div>
          {/* Title lines skeleton */}
          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-full bg-[#27183d]" />
            <Skeleton className="h-4 w-3/4 bg-[#27183d]" />
          </div>
        </div>

        {/* Price & Button skeleton */}
        <div className="mt-5">
          <div className="flex items-end justify-between">
            <Skeleton className="h-10 w-28 border-2 border-[#0e0917] bg-[#2a1b38] shadow-[2.5px_2.5px_0_#0e0917]" />
            <Skeleton className="h-4 w-14 bg-[#231536]" />
          </div>
          <Skeleton className="mt-4 h-[44px] w-full border-2 border-[#0e0917] bg-[#2a1b38] shadow-[3px_3px_0_#0e0917]" />
        </div>
      </div>
    </div>
  );
}

/**
 * Product Details Page Skeleton
 */
export function ProductDetailsSkeleton() {
  return (
    <div className="pb-10 pointer-events-none select-none">
      {/* Breadcrumb skeleton */}
      <div className="mb-9 flex items-center gap-2">
        <Skeleton className="h-4 w-14 bg-[#251838]" />
        <span className="text-[#3a2850]">/</span>
        <Skeleton className="h-4 w-20 bg-[#251838]" />
        <span className="text-[#3a2850]">/</span>
        <Skeleton className="h-4 w-36 bg-[#251838]" />
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(300px,430px)_1fr] xl:gap-14">
        {/* Left Column: Image Box & Gallery */}
        <aside className="space-y-7">
          <div className="relative min-h-[560px] overflow-hidden border-2 border-[#0e0917] bg-[#160d22] shadow-[6px_6px_0_#0e0917]">
            <Skeleton className="h-full w-full min-h-[560px]" />
            <div className="absolute inset-x-0 bottom-0 border-t-2 border-[#0e0917] bg-[#160d22]/95 p-7">
              <Skeleton className="h-4 w-24 bg-[#251838]" />
              <Skeleton className="mt-3 h-7 w-3/4 bg-[#251838]" />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                className="aspect-video border-2 border-[#0e0917] bg-[#251838] shadow-[2px_2px_0_#0e0917]"
              />
            ))}
          </div>

          <div className="comic-panel p-6 space-y-3">
            <Skeleton className="h-5 w-32 bg-[#251838]" />
            <Skeleton className="h-4 w-full bg-[#251838]" />
            <Skeleton className="h-4 w-5/6 bg-[#251838]" />
            <Skeleton className="h-4 w-4/6 bg-[#251838]" />
          </div>
        </aside>

        {/* Right Column: Title, Packages & Buy action */}
        <section>
          <div className="flex items-start justify-between gap-5">
            <div className="w-full space-y-3">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 border-2 border-[#0e0917] bg-[#251838]" />
                <Skeleton className="h-6 w-12 border-2 border-[#0e0917] bg-[#251838]" />
              </div>
              <Skeleton className="h-10 w-4/5 bg-[#251838]" />
              <Skeleton className="h-5 w-40 bg-[#251838]" />
            </div>
            <Skeleton className="h-12 w-12 shrink-0 border-2 border-[#0e0917] bg-[#251838] shadow-[3px_3px_0_#0e0917]" />
          </div>

          <div className="mt-6 space-y-2">
            <Skeleton className="h-4 w-full bg-[#251838]" />
            <Skeleton className="h-4 w-11/12 bg-[#251838]" />
            <Skeleton className="h-4 w-4/5 bg-[#251838]" />
          </div>

          {/* Package Editions */}
          <div className="mt-10">
            <Skeleton className="h-6 w-36 bg-[#251838]" />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="min-h-28 border-2 border-[#0e0917] bg-[#1a1224] p-5 shadow-[3px_3px_0_#0e0917] space-y-2"
                >
                  <Skeleton className="h-4 w-28 bg-[#281a3b]" />
                  <Skeleton className="h-6 w-20 bg-[#281a3b]" />
                </div>
              ))}
            </div>
          </div>

          {/* Checkout action panel */}
          <div className="comic-panel mt-10 p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Skeleton className="h-4 w-16 bg-[#251838]" />
                <Skeleton className="mt-2 h-8 w-32 bg-[#251838]" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-13 w-32 border-2 border-[#0e0917] bg-[#251838] shadow-[3px_3px_0_#0e0917]" />
                <Skeleton className="h-13 w-40 border-2 border-[#0e0917] bg-[#e5a93c]/20 shadow-[3px_3px_0_#0e0917]" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/**
 * Cart Page Skeleton
 */
export function CartPageSkeleton() {
  return (
    <div className="pb-8 pointer-events-none select-none">
      <div className="mb-10 space-y-2">
        <Skeleton className="h-6 w-32 border-2 border-[#0e0917] bg-[#e5a93c]/20" />
        <Skeleton className="h-10 w-64 bg-[#251838]" />
        <Skeleton className="h-4 w-72 bg-[#251838]" />
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(340px,0.8fr)]">
        {/* Cart items list skeleton */}
        <section className="comic-panel overflow-hidden">
          <header className="border-b-2 border-[#0e0917] bg-[#241338] px-6 py-5">
            <Skeleton className="h-4 w-32 bg-[#2e1d44]" />
          </header>
          <div className="divide-y-2 divide-[#0e0917]">
            {[1, 2].map((i) => (
              <div key={i} className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
                <Skeleton className="h-20 w-20 shrink-0 border-2 border-[#0e0917] bg-[#251838]" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48 bg-[#251838]" />
                  <Skeleton className="h-4 w-32 bg-[#251838]" />
                </div>
                <Skeleton className="h-6 w-24 bg-[#251838]" />
              </div>
            ))}
          </div>
        </section>

        {/* Sidebar Summary Skeleton */}
        <aside className="space-y-6">
          <section className="comic-panel p-6 space-y-3">
            <Skeleton className="h-4 w-40 bg-[#251838]" />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full border-2 border-[#0e0917] bg-[#1d1428]" />
            ))}
          </section>

          <section className="comic-panel p-6 space-y-4">
            <Skeleton className="h-4 w-28 bg-[#251838]" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16 bg-[#251838]" />
                <Skeleton className="h-4 w-16 bg-[#251838]" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20 bg-[#251838]" />
                <Skeleton className="h-4 w-14 bg-[#251838]" />
              </div>
            </div>
            <Skeleton className="h-12 w-full border-2 border-[#0e0917] bg-[#e5a93c]/20" />
          </section>
        </aside>
      </div>
    </div>
  );
}

/**
 * Profile Page Skeleton
 */
export function ProfilePageSkeleton() {
  return (
    <div className="grid items-start gap-10 pb-10 lg:grid-cols-[270px_1fr] pointer-events-none select-none">
      {/* Account Sidebar Skeleton */}
      <aside className="space-y-6">
        <div className="comic-panel p-6 space-y-4 text-center">
          <Skeleton className="mx-auto h-24 w-24 border-2 border-[#0e0917] bg-[#2a1b38]" />
          <div className="space-y-2">
            <Skeleton className="mx-auto h-5 w-32 bg-[#251838]" />
            <Skeleton className="mx-auto h-3 w-40 bg-[#251838]" />
          </div>
        </div>
        <div className="comic-panel divide-y divide-[#0e0917] overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 p-4 bg-[#1a1424]">
              <Skeleton className="h-4 w-4 bg-[#251838]" />
              <Skeleton className="h-4 w-24 bg-[#251838]" />
            </div>
          ))}
        </div>
      </aside>

      {/* Main Profile Form Skeleton */}
      <main className="min-w-0 space-y-6">
        <div>
          <Skeleton className="h-4 w-24 bg-[#e5a93c]/20" />
          <Skeleton className="mt-3 h-9 w-64 bg-[#251838]" />
          <Skeleton className="mt-2 h-4 w-80 bg-[#251838]" />
        </div>

        {/* Avatar Section Skeleton */}
        <div className="comic-panel flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
          <Skeleton className="h-28 w-28 shrink-0 border-2 border-[#0e0917] bg-[#2a1b38] shadow-[5px_5px_0_#0e0917]" />
          <div className="space-y-3 flex-1">
            <Skeleton className="h-5 w-24 bg-[#251838]" />
            <Skeleton className="h-4 w-56 bg-[#251838]" />
            <Skeleton className="h-11 w-36 border border-[#0e0917] bg-[#211d23]" />
          </div>
        </div>

        {/* Input Fields Skeleton */}
        <div className="comic-panel p-6 sm:p-8">
          <div className="grid gap-6 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-20 bg-[#251838]" />
                <Skeleton className="h-12 w-full border border-[#0e0917] bg-[#1c191f]" />
              </div>
            ))}
            <div className="space-y-2 sm:col-span-2">
              <Skeleton className="h-3 w-24 bg-[#251838]" />
              <Skeleton className="h-12 w-full border border-[#0e0917] bg-[#1c191f]" />
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <Skeleton className="h-12 w-36 border-2 border-[#0e0917] bg-[#e5a93c]/20 shadow-[3px_3px_0_#0e0917]" />
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * Wishlist Page Skeleton
 */
export function WishlistSkeleton() {
  return (
    <div className="mt-9 space-y-5 pointer-events-none select-none">
      {[1, 2, 3].map((i) => (
        <article
          key={i}
          className="comic-panel grid gap-5 p-5 sm:grid-cols-[120px_1fr_auto] sm:items-center sm:p-6"
        >
          <Skeleton className="h-30 w-30 border border-[#0e0917] bg-[#251838]" />
          <div className="min-w-0 space-y-2">
            <Skeleton className="h-6 w-3/4 max-w-sm bg-[#251838]" />
            <Skeleton className="h-4 w-1/3 max-w-xs bg-[#251838]" />
            <Skeleton className="mt-4 h-6 w-24 bg-[#251838]" />
          </div>
          <div className="flex gap-3 sm:justify-end">
            <Skeleton className="h-12 w-12 border border-[#0e0917] bg-[#1c191f]" />
            <Skeleton className="h-12 w-28 border border-[#0e0917] bg-[#e5a93c]/20" />
          </div>
        </article>
      ))}
    </div>
  );
}

/**
 * Checkout Page Skeleton
 */
export function CheckoutPageSkeleton() {
  return (
    <div className="mx-auto max-w-2xl py-8 pointer-events-none select-none space-y-6">
      <Skeleton className="h-6 w-36 bg-[#e5a93c]/20" />
      <div className="comic-panel p-6 sm:p-8 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40 bg-[#251838]" />
          <Skeleton className="h-4 w-60 bg-[#251838]" />
        </div>

        <div className="flex items-center justify-between border-y border-[#0e0917] bg-[#140c1e] px-4 py-5">
          <Skeleton className="h-5 w-48 bg-[#251838]" />
          <Skeleton className="h-6 w-20 bg-[#251838]" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-24 bg-[#251838]" />
          <div className="flex gap-2">
            <Skeleton className="h-11 flex-1 border border-[#0e0917] bg-[#1a1424]" />
            <Skeleton className="h-11 w-24 border border-[#0e0917] bg-[#251838]" />
          </div>
        </div>

        <Skeleton className="mt-6 h-12 w-full border-2 border-[#0e0917] bg-[#e5a93c]/20 shadow-[3px_3px_0_#0e0917]" />
      </div>
    </div>
  );
}

/**
 * Dashboard Page Skeleton
 */
export function DashboardSkeleton() {
  return (
    <div className="pointer-events-none select-none space-y-6">
      {/* 4 Metric cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <article key={i} className="border border-[#0e0917] bg-[#252028] p-5 space-y-3">
            <Skeleton className="h-3 w-20 bg-[#352542]" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-7 w-28 bg-[#352542]" />
              <Skeleton className="h-4 w-12 bg-[#352542]" />
            </div>
            <Skeleton className="h-3 w-32 bg-[#352542]" />
          </article>
        ))}
      </section>

      {/* Chart and Side Category panel */}
      <section className="grid gap-5 xl:grid-cols-[1.7fr_0.8fr]">
        <div className="border border-[#0e0917] bg-[#252028] p-5 space-y-5">
          <div className="flex items-start justify-between">
            <Skeleton className="h-4 w-32 bg-[#352542]" />
            <Skeleton className="h-6 w-24 bg-[#352542]" />
          </div>
          {/* Simulated chart bars */}
          <div className="h-72 flex items-end gap-3 pt-8 pb-4 px-2 border-b border-[#3a3040]">
            {[40, 65, 30, 85, 55, 95, 70, 45, 80, 60, 90, 75].map((h, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <Skeleton
                  style={{ height: `${h}%` }}
                  className="w-full bg-[#e5a93c]/30"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="border border-[#0e0917] bg-[#252028] p-5 space-y-4">
          <Skeleton className="h-4 w-36 bg-[#352542]" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-24 bg-[#352542]" />
                <Skeleton className="h-3 w-12 bg-[#352542]" />
              </div>
              <Skeleton className="h-2 w-full bg-[#352542]" />
            </div>
          ))}
        </div>
      </section>

      {/* 3 Secondary panels */}
      <section className="grid gap-5 lg:grid-cols-3">
        {[1, 2, 3].map((panelIdx) => (
          <section key={panelIdx} className="border border-[#0e0917] bg-[#252028] p-5 space-y-4">
            <Skeleton className="h-4 w-32 bg-[#352542]" />
            {[1, 2, 3, 4].map((rowIdx) => (
              <div key={rowIdx} className="flex items-center justify-between gap-3">
                <Skeleton className="h-4 w-12 bg-[#352542]" />
                <Skeleton className="h-4 w-28 bg-[#352542]" />
                <Skeleton className="h-4 w-16 bg-[#352542]" />
              </div>
            ))}
          </section>
        ))}
      </section>
    </div>
  );
}

/**
 * Table Rows Skeleton (for Orders, Products, Logs)
 */
export function TableRowSkeleton({ columns = 5, rows = 4 }: { columns?: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIndex) => (
        <tr key={rIndex} className="animate-pulse border-b border-[#342448]/40">
          {Array.from({ length: columns }).map((_, cIndex) => (
            <td key={cIndex} className="px-5 py-4">
              <Skeleton className="h-4 w-full max-w-[120px] bg-[#26193b]" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default Skeleton;

