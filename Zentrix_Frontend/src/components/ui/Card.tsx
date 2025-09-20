import React from "react";

function Card({ children, className = "", ...rest }: { children: React.ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`card ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export default Card;