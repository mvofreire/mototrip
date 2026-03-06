"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const sectionVariants = cva(
  "relative",
  {
    variants: {
      variant: {
        hero: "overflow-hidden border-b bg-gradient-to-b from-muted/20 to-background",
        clarification: "border-t bg-gradient-to-b from-sunshine-yellow-50/30 dark:from-muted/10 to-background",
        default: "border-t bg-muted/20",
        ghost: "",
      },
      padding: {
        default: "py-16 md:py-24",
        hero: "py-24 md:py-32",
        none: "",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
)

export interface SectionProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {
  withRadialGradient?: boolean
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, variant, padding, withRadialGradient = false, children, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn(sectionVariants({ variant, padding }), className)}
        {...props}
      >
        {withRadialGradient && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(252,211,77,0.1),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(251,146,60,0.1),transparent_50%)]" />
        )}
        {children}
      </section>
    )
  }
)
Section.displayName = "Section"

const SectionContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { relative?: boolean }
>(({ className, relative = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("container", relative && "relative", className)}
    {...props}
  />
))
SectionContainer.displayName = "SectionContainer"

const SectionContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { centered?: boolean; maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" }
>(({ className, centered = false, maxWidth, ...props }, ref) => {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
  }

  return (
    <div
      ref={ref}
      className={cn(
        centered && "mx-auto text-center",
        maxWidth && maxWidthClasses[maxWidth],
        className
      )}
      {...props}
    />
  )
})
SectionContent.displayName = "SectionContent"

const SectionHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-4", className)}
    {...props}
  />
))
SectionHeader.displayName = "SectionHeader"

const SectionTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & { as?: "h1" | "h2" | "h3" }
>(({ className, as: Comp = "h2", ...props }, ref) => (
  <Comp
    ref={ref}
    className={cn(
      "font-bold tracking-tight",
      Comp === "h1" && "text-4xl sm:text-5xl md:text-6xl lg:text-7xl",
      Comp === "h2" && "text-3xl md:text-4xl",
      Comp === "h3" && "text-2xl md:text-3xl",
      className
    )}
    {...props}
  />
))
SectionTitle.displayName = "SectionTitle"

const SectionDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & { size?: "sm" | "md" | "lg" }
>(({ className, size = "md", ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-muted-foreground",
      size === "sm" && "text-sm",
      size === "md" && "text-base md:text-lg",
      size === "lg" && "text-lg md:text-xl",
      className
    )}
    {...props}
  />
))
SectionDescription.displayName = "SectionDescription"

const SectionGrid = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { cols?: 2 | 3 | 4 }
>(({ className, cols = 3, ...props }, ref) => {
  const colClasses = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  }

  return (
    <div
      ref={ref}
      className={cn("grid gap-6", colClasses[cols], className)}
      {...props}
    />
  )
})
SectionGrid.displayName = "SectionGrid"

export {
  Section,
  SectionContainer,
  SectionContent,
  SectionHeader,
  SectionTitle,
  SectionDescription,
  SectionGrid,
}
