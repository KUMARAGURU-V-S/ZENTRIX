
import React from "react";
import "../../styles/components.css"; // Ensure this path is correct

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

function Input({ className = "", ...rest }: InputProps) {
  return (
    <input
      className={`input ${className}`}
      {...rest}
    />
  );
}

export default Input;