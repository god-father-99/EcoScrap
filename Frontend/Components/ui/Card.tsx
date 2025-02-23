import React from "react";

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className, children }) => {
  return <div className={`p-4 border rounded-lg shadow-md bg-white ${className}`}>{children}</div>;
};
