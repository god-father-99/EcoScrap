import { ReactNode } from "react";

interface CustomCardProps {
  children: ReactNode;
  className?: string;
}

export const CustomCard: React.FC<CustomCardProps> = ({ children, className }) => {
  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-300 p-4 ${className}`}>
      {children}
    </div>
  );
};

export const CustomCardTitle: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <h3 className="text-lg font-semibold text-gray-900">{children}</h3>;
};

export const CustomCardContent: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <div className="text-gray-700">{children}</div>;
};
