import * as React from "react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={`flex h-11 w-full border-2 border-[#0e0917] bg-[#150c22] px-3.5 py-2 text-sm font-semibold text-[#f2edf7] shadow-[3px_3px_0_#0e0917] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#88789c] focus-visible:border-[#e5a93c] focus-visible:outline-none focus-visible:shadow-[4px_4px_0_#e5a93c] disabled:cursor-not-allowed disabled:opacity-50 transition-all ${className || ''}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

