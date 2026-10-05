import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  badge?: string;
  icon?: React.ReactNode;
}

export interface SelectProps {
  options: (string | SelectOption)[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  optionClassName?: string;
  disabled?: boolean;
  ariaLabel?: string;
  variant?: 'default' | 'navbar' | 'compact';
}

export function Select({
  options,
  value,
  defaultValue,
  onChange,
  placeholder = 'Select option...',
  className = '',
  triggerClassName = '',
  menuClassName = '',
  optionClassName = '',
  disabled = false,
  ariaLabel,
  variant = 'default',
}: SelectProps) {
  const normalizedOptions: SelectOption[] = React.useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'string') {
        return { value: opt, label: opt };
      }
      return opt;
    });
  }, [options]);

  const [internalValue, setInternalValue] = useState<string>(() => {
    if (value !== undefined) return value;
    if (defaultValue !== undefined) return defaultValue;
    return normalizedOptions[0]?.value ?? '';
  });

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerId = useId();

  const isControlled = value !== undefined;
  const selectedValue = isControlled ? value : internalValue;

  const currentOption = normalizedOptions.find((opt) => opt.value === selectedValue) || normalizedOptions[0];

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  const handleSelect = (val: string) => {
    if (disabled) return;
    if (!isControlled) {
      setInternalValue(val);
    }
    onChange?.(val);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const currentIndex = normalizedOptions.findIndex((o) => o.value === selectedValue);
        const nextIndex = (currentIndex + 1) % normalizedOptions.length;
        handleSelect(normalizedOptions[nextIndex].value);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const currentIndex = normalizedOptions.findIndex((o) => o.value === selectedValue);
        const prevIndex = (currentIndex - 1 + normalizedOptions.length) % normalizedOptions.length;
        handleSelect(normalizedOptions[prevIndex].value);
      }
    }
  };

  // Variant-specific trigger classes
  const getTriggerVariantClass = () => {
    if (variant === 'navbar') {
      return 'h-full w-full bg-transparent px-3 text-[11px] font-black uppercase text-[#241338] hover:text-[#0e0917] justify-between';
    }
    if (variant === 'compact') {
      return 'h-9 px-3 text-xs font-black uppercase border-2 border-[#0e0917] bg-[#1a1224] text-[#f2edf7] shadow-[2.5px_2.5px_0_#0e0917] hover:border-[#e5a93c] justify-between';
    }
    return 'h-11 px-4 text-xs font-black uppercase border-2 border-[#0e0917] bg-[#191122] text-[#f2edf7] shadow-[3px_3px_0_#0e0917] hover:border-[#e5a93c] justify-between';
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block select-none ${className}`}
      onKeyDown={handleKeyDown}
    >
      <button
        id={triggerId}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel || currentOption?.label || placeholder}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`font-display flex items-center gap-2 outline-none transition-all cursor-pointer ${getTriggerVariantClass()} ${
          isOpen ? 'ring-2 ring-[#e5a93c]' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${triggerClassName}`}
      >
        <span className="truncate flex items-center gap-1.5">
          {currentOption?.icon}
          <span>{currentOption?.label || placeholder}</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#e5a93c]' : 'text-current opacity-70'
          }`}
        />
      </button>

      {/* Floating Comic Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-labelledby={triggerId}
          className={`comic-select-menu absolute left-0 top-[calc(100%+6px)] z-50 min-w-full overflow-hidden border-2 border-[#0e0917] bg-[#1c1427] py-1.5 shadow-[4px_4px_0_#0e0917] animate-in fade-in-0 zoom-in-95 duration-100 ${menuClassName}`}
          style={{ minWidth: variant === 'navbar' ? '180px' : '100%' }}
        >
          {normalizedOptions.map((opt) => {
            const isSelected = opt.value === selectedValue;
            return (
              <div
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                className={`font-display group flex items-center justify-between gap-3 px-3.5 py-2.5 text-[11px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#e5a93c] text-[#0e0917]'
                    : 'text-[#d6c9e5] hover:bg-[#e5a93c] hover:text-[#0e0917]'
                } ${optionClassName}`}
              >
                <div className="flex items-center gap-2 truncate">
                  {opt.icon}
                  <span className="truncate">{opt.label}</span>
                  {opt.badge && (
                    <span
                      className={`ml-1.5 border border-[#0e0917] px-1 py-0.2 text-[9px] font-black uppercase ${
                        isSelected
                          ? 'bg-[#0e0917] text-[#e5a93c]'
                          : 'bg-[#581c87] text-[#ede3c8] group-hover:bg-[#0e0917] group-hover:text-[#e5a93c]'
                      }`}
                    >
                      {opt.badge}
                    </span>
                  )}
                </div>
                {isSelected && (
                  <Check className="h-3.5 w-3.5 shrink-0 stroke-[3] text-current" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Select;
