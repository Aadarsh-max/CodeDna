const Card = ({ children, className = "", glow = false }) => {
  return (
    <div
      className={`relative rounded-box border border-base-300/80 bg-linear-to-b from-base-200 to-base-200/60 backdrop-blur-sm shadow-lg shadow-black/20 ${
        glow ? "ring-1 ring-primary/20" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;