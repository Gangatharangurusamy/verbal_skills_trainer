interface ButtonProps {
    onClick: () => void;
    text: string;
    variant?: "primary" | "secondary";
  }
  
  export function Button({ onClick, text, variant = "primary" }: ButtonProps) {
    return (
      <button
        onClick={onClick}
        className={`px-4 py-2 rounded-md ${
          variant === "primary" ? "bg-blue-500 text-white" : "bg-gray-300 text-black"
        }`}
      >
        {text}
      </button>
    );
  }
  