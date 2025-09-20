
import "../../styles/components.css"; // Ensure this path is correct

function Input({ className = "", ...rest }) {
  return (
    <input
      className={`input ${className}`}
      {...rest}
    />
  );
}

export default Input;