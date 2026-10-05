import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    
    const baseStyles = "font-display inline-flex items-center justify-center gap-2 whitespace-nowrap border-2 border-black text-xs font-black uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4b72b] disabled:pointer-events-none disabled:opacity-50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_#000000]"
    
    const variants = {
      default: "bg-[#f4b72b] text-black shadow-[3.5px_3.5px_0_#000000] hover:bg-[#ffd45e] hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#000000]",
      destructive: "bg-[#d91e48] text-white shadow-[3.5px_3.5px_0_#000000] hover:bg-[#eb2b56] hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#000000]",
      outline: "bg-[#1f1233] text-white shadow-[3.5px_3.5px_0_#000000] hover:border-[#f4b72b] hover:text-[#ffd45e] hover:shadow-[5px_5px_0_#f4b72b] hover:-translate-y-0.5",
      ghost: "border-transparent bg-transparent text-[#cdbfe0] hover:border-black hover:bg-[#281542] hover:text-white hover:shadow-[2.5px_2.5px_0_#000000]",
    }
    
    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 px-3",
      lg: "h-12 px-8",
    }

    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ''}`

    return (
      <button
        className={classes}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }

