import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center overflow-hidden whitespace-nowrap outline-none select-none cursor-pointer disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:     "",
        outline:     "",
        secondary:   "",
        ghost:       "",
        destructive: "",
        link: "border-transparent text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:  "h-8 gap-1.5 px-3 text-sm",
        xs:       "h-6 gap-1 px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm:       "h-7 gap-1 px-2.5 text-sm [&_svg:not([class*='size-'])]:size-3.5",
        lg:       "h-9 gap-1.5 px-4 text-sm",
        icon:     "size-8",
        "icon-xs":"size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":"size-7",
        "icon-lg":"size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
