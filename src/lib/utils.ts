import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Text color classes for consistent contrast
export const textColors = {
  // Headers and important text
  heading: "text-gray-900 font-bold",
  subheading: "text-gray-800 font-semibold",
  
  // Body text
  body: "text-gray-700",
  bodyStrong: "text-gray-700 font-medium",
  
  // Secondary and helper text
  secondary: "text-gray-600",
  
  // Interactive elements
  link: "text-blue-600 hover:text-blue-700",
  danger: "text-red-600",
  success: "text-green-600",
  
  // Form elements
  label: "text-gray-700 font-medium",
  placeholder: "text-gray-500",
  
  // Disabled states
  disabled: "text-gray-400"
} as const 