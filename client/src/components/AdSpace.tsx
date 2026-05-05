import { useEffect } from "react";

interface AdSpaceProps {
  slot?: string;
  format?: "auto" | "fluid" | "rectangle";
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Component for Google AdSense ad units.
 * Usage: <AdSpace slot="1234567890" />
 */
export default function AdSpace({ slot, format = "auto", className = "", style }: AdSpaceProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  // Placeholder for development / before approval
  const isDevelopment = !slot;

  return (
    <div className={`ad-container my-8 flex flex-col items-center justify-center overflow-hidden ${className}`}>
      <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Publicidade</span>
      
      {isDevelopment ? (
        <div 
          className="w-full bg-muted border border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground text-xs font-semibold min-h-[100px]"
          style={style}
        >
          Espaço para Anúncio (AdSense)
        </div>
      ) : (
        <ins
          className="adsbygoogle"
          style={style || { display: "block", minWidth: "250px", minHeight: "100px" }}
          data-ad-client="ca-pub-0000000000000000" // Replace with your Publisher ID
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      )}
    </div>
  );
}
