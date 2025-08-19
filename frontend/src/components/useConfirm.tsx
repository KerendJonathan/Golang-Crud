import { createPortal } from "react-dom";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";

type Options = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
};

export function useConfirm() {
  const [open, setOpen] = useState(false);
  const resolver = useRef<((v: boolean) => void) | null>(null);
  const [opts, setOpts] = useState<Options>({
    title: "Konfirmasi",
    description: "Apakah Anda yakin?",
    confirmText: "Ya, lanjut",
    cancelText: "Batal",
    danger: false,
  });

  const confirm = useCallback((o?: Options) => {
    setOpts((prev) => ({ ...prev, ...(o || {}) }));
    setOpen(true);
    return new Promise<boolean>((res) => {
      resolver.current = res;
    });
  }, []);

  const close = (val: boolean) => {
    setOpen(false);
    resolver.current?.(val);
    resolver.current = null;
  };

  // close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) close(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const ConfirmDialog = () => {
    if (!open) return null;
    return createPortal(
      <Fragment>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-40"
          onClick={() => close(false)}
        />
        {/* Modal */}
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md card p-5 shadow-xl animate-in zoom-in-95"
          >
            <h2 className="text-lg font-semibold mb-1">{opts.title}</h2>
            {opts.description && (
              <p className="text-sm text-gray-600 mb-4">{opts.description}</p>
            )}
            <div className="flex justify-end gap-2">
              <button className="btn" onClick={() => close(false)}>
                {opts.cancelText || "Batal"}
              </button>
              <button
                className={`btn ${opts.danger ? "btn-danger" : "btn-primary"}`}
                onClick={() => close(true)}
                autoFocus
              >
                {opts.confirmText || "Ya"}
              </button>
            </div>
          </div>
        </div>
      </Fragment>,
      document.body
    );
  };

  return { confirm, ConfirmDialog };
}
