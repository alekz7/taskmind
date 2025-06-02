import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    helperText, 
    error, 
    fullWidth = false, 
    leftIcon, 
    rightIcon, 
    className = '', 
    id,
    ...props 
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
    
    // Base classes
    const baseClasses = 'rounded-md shadow-sm border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50';
    
    // Error classes
    const errorClasses = error 
      ? 'border-error-500 focus:border-error-500 focus:ring-error-500' 
      : '';
    
    // Icon padding classes
    const leftPaddingClass = leftIcon ? 'pl-10' : '';
    const rightPaddingClass = rightIcon ? 'pr-10' : '';
    
    // Width classes
    const widthClasses = fullWidth ? 'w-full' : '';
    
    // Combined classes
    const combinedClasses = `
      ${baseClasses} 
      ${errorClasses} 
      ${leftPaddingClass} 
      ${rightPaddingClass} 
      ${widthClasses} 
      ${className}
    `;
    
    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={combinedClasses}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={`${inputId}-description ${inputId}-error`}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        
        {(helperText || error) && (
          <div className="mt-1">
            {helperText && !error && (
              <p id={`${inputId}-description`} className="text-sm text-gray-500">
                {helperText}
              </p>
            )}
            
            {error && (
              <p id={`${inputId}-error`} className="text-sm text-error-500">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;