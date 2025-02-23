import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({ className, ...props }) => {
  return (
    <input
      className={`border p-2 rounded-md w-full focus:ring-2 focus:ring-blue-400 ${className}`}
      {...props}
    />
  );
};
