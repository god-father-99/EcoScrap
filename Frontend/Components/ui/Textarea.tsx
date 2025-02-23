import React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea: React.FC<TextareaProps> = ({ className, ...props }) => {
  return (
    <textarea
      className={`border p-2 rounded-md w-full resize-none focus:ring-2 focus:ring-blue-400 ${className}`}
      {...props}
    />
  );
};
