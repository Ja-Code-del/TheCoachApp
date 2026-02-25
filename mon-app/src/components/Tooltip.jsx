export default function Tooltip({ label, children }) {
  return (
    <div className="relative group">
      {children}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg text-white text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        {label}
      </div>
    </div>
  );
}
