import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    
    const baseStyles = "font-display inline-flex items-center justify-center gap-2 whitespace-nowrap border text-xs font-bold uppercase transition-[transform,background-color,color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22d3ee] disabled:pointer-events-none disabled:opacity-50 active:translate-x-[2px] active:translate-y-[2px]"
    
    const variants = {
      default: "border-[#f4b72b] bg-[#f4b72b] text-[#09060d] shadow-[4px_4px_0_#7115c4] hover:bg-[#ffd45e]",
      destructive: "border-[#ff4f79] bg-[#ff315f] text-white shadow-[4px_4px_0_#4b0c20] hover:bg-[#ff5c80]",
      outline: "border-[#72558a] bg-[#130d1b] text-white shadow-[4px_4px_0_#2c0c46] hover:border-[#22d3ee] hover:text-[#67e8f9]",
      ghost: "border-transparent bg-transparent text-[#bdb0c8] hover:border-[#49345d] hover:bg-[#1c1226] hover:text-white",
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
