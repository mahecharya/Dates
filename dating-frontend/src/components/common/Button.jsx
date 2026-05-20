const Button = ({
  children,
  type = "button",
  onClick,
  disabled = false,
  variant = "primary",
  className = "",
}) => {
  const variants = {
    primary: "bg-rose-500 text-white hover:bg-rose-600",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    danger: "bg-red-500 text-white hover:bg-red-600",
    outline: "border border-rose-500 text-rose-500 hover:bg-rose-50",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl px-4 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;