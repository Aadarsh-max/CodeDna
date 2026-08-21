const Card = ({ children, className = "", glow = false, pressed = false }) => {
  return (
    <div
      className={`relative rounded-[1.75rem] bg-linear-to-br from-base-100 to-base-200 ${
        pressed ? "shadow-clay-pressed" : "shadow-clay"
      } ${glow ? "ring-2 ring-primary/25" : ""} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;