import { useState } from "react";
import { ShieldCheck, Info, X } from "lucide-react";
import { sound } from "@/lib/audio";
import { haptic } from "@/lib/haptics";

export function LegalNoticeModal() {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    sound.click();
    haptic.light();
    setOpen(true);
  };

  const handleClose = () => {
    sound.click();
    haptic.light();
    setOpen(false);
  };

  return (
    <>
      <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-muted-foreground/80">
        <button
          onClick={handleOpen}
          className="hover:text-white underline underline-offset-2 transition-colors flex items-center gap-1"
        >
          <Info className="h-3 w-3" />
          Yasal Uyarı & Gizlilik Politikası
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="glass-high max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/15 p-5 text-left shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <h3 className="font-display text-base font-bold text-white">
                  Yasal Bilgilendirme & Gizlilik
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="rounded-lg p-1 text-muted-foreground hover:bg-white/10 hover:text-white"
                aria-label="Kapat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs leading-relaxed text-slate-300">
              <section>
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
                  1. Finansal Simülasyon ve Sorumluluk Reddi
                </h4>
                <p className="mt-1">
                  <strong>Block Jumper: Mum Koşusu</strong> tamamen bir arcade eğlence ve beceri
                  oyunudur. Oyunda yer alan finansal grafikler, borsa mumları ve hisse/kripto
                  simülasyonları oyun mekaniği olarak yer almakta olup kesinlikle{" "}
                  <strong>yatırım tavsiyesi (Financial Advice)</strong> değildir.
                </p>
                <p className="mt-1">
                  Oyunda kazanılan &ldquo;Dolar&rdquo; ve &ldquo;$COIN&rdquo; varlıkları sanal oyun
                  içi puanlardır. Gerçek para, fiat para birimi veya ticari kripto varlık değeri
                  taşımaz. Gerçek para karşılığı satılamaz, nakde dönüştürülemez ve çekim yapılamaz.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
                  2. Gizlilik Politikası & Veri Güvenliği
                </h4>
                <p className="mt-1">Uygulama kullanıcı gizliliğine %100 saygı gösterir:</p>
                <ul className="mt-1 list-disc pl-4 space-y-1">
                  <li>
                    Kişisel kimlik, konum, telefon rehberi veya hassas cihaz bilgisi toplanmaz.
                  </li>
                  <li>
                    Oyun içi skorlarınız ve açılan kostümleriniz yalnızca cihazınızın yerel depolama
                    alanında (Local Storage) saklanır.
                  </li>
                  <li>Verileriniz üçüncü taraflarla paylaşılmaz veya ticari amaçla satılmaz.</li>
                </ul>
              </section>

              <section>
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
                  3. Fikri Mülkiyet & Parodi Beyanı
                </h4>
                <p className="mt-1">
                  Oyunda yer alan tüm karakterler, unvanlar ve görsel tasarımlar kurgusal olup mizah
                  ve parodi amacıyla oluşturulmuştur. Gerçek kişi ve kurumlarla herhangi bir resmi
                  bağ veya sponsorluk bulunmamaktadır.
                </p>
              </section>
            </div>

            <div className="mt-5 pt-3 border-t border-white/10 text-center">
              <button
                onClick={handleClose}
                className="w-full rounded-xl bg-primary py-2.5 font-bold text-white transition-all hover:bg-primary/90"
              >
                Anladım
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
