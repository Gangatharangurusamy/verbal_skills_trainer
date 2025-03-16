import React, { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  onClick?: () => void;
}

export function Card({ children, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className="p-4 border rounded-lg shadow-md cursor-pointer hover:bg-gray-100 transition"
    >
      {children}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
}

export function CardContent({ children }: CardContentProps) {
  return <div className="p-2">{children}</div>;
}
