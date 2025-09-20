import React from 'react';
import '../../styles/components.css'; // Ensure this path is correct

function Button({ children, onClick, type = 'button', loading, className, icon, ...rest }: {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  loading?: boolean;
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={`btn ${className}`}
      {...rest}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      <span>{loading ? 'Processing...' : children}</span>
    </button>
  );
}

export default Button;