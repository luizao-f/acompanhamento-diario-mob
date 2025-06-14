
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-soft hover:shadow-gentle rounded-organic hover-lift animate-breathe",
        destructive: "bg-destructive text-destructive-foreground shadow-soft hover:shadow-gentle rounded-organic hover-lift",
        outline: "border-2 border-primary/30 bg-background/80 backdrop-blur-sm hover:bg-primary/5 hover:border-primary/50 rounded-organic shadow-soft texture-linen",
        secondary: "bg-secondary text-secondary-foreground shadow-soft hover:shadow-gentle rounded-organic hover-lift",
        ghost: "hover:bg-accent/20 hover:text-accent-foreground rounded-organic transition-colors duration-300",
        link: "text-primary underline-offset-4 hover:underline decoration-wavy decoration-primary/60",
      },
      size: {
        default: "h-12 px-6 py-3 rounded-organic",
        sm: "h-10 rounded-leaf px-4",
        lg: "h-14 rounded-petal px-8 text-base",
        icon: "h-12 w-12 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {/* Efeito sutil de fluxo natural */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
