import { useEffect } from "react";

interface AdSenseUnitProps {
  slot: string;
  format?: "auto" | "fluid" | "rectangle";
  style?: React.CSSProperties;
  className?: string;
}

export default function AdSenseUnit({ slot, format = "auto", style, className }: AdSenseUnitProps) {
  useEffect(() => {
    try {
      if (typeof (window as any).adsbygoogle !== "undefined") {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (e) {
      console.warn("AdSense unit push error:", e);
    }
  }, []);

  return (
    <div className={`ad-container ${className || ""}`} style={style}>
      <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1 text-center">
        Publicidade
      </div>
      <ins
        className="adsbygoogle"
        style={{ display: "block", ...style }}
        data-ad-client="ca-pub-1426811176615814"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
