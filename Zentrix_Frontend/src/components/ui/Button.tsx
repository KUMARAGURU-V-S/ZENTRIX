import React from 'react';
import '../../styles/components.css'; // Ensure this path is correct

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  loading?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

function Button({ children, onClick, type = 'button', loading, className, icon, ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={`button ${className || ''}`}
      {...rest}
    >
      {icon && <span className="button-icon">{icon}</span>}
      <span>{loading ? 'Processing...' : children}</span>
    </button>
  );
}

export default Button;