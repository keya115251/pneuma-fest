export default function PulseLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-bg-base">
      <div className="relative w-24 h-24">
        <span className="pulse-ring" style={{ animationDelay: "0s" }} />
        <span className="pulse-ring" style={{ animationDelay: "0.5s" }} />
        <span className="pulse-ring" style={{ animationDelay: "1s" }} />
        <span className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-thermal-accent" />
      </div>
    </div>
  );
}
