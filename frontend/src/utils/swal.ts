/**
 * Themed SweetAlert2 helpers — matches the IHSAN dark / gold design system.
 */
import Swal from 'sweetalert2';

const DARK_BG = 'var(--card, #1E2130)';
const DARK_BG_STR = '#1E2130';
const GOLD = '#C9933A';
const TEXT = '#F0E6CC';
const BORDER = '#2E3347';

const base = Swal.mixin({
  background: DARK_BG_STR,
  color: TEXT,
  confirmButtonColor: GOLD,
  cancelButtonColor: BORDER,
  focusConfirm: false,
  customClass: { popup: 'ihsan-swal-popup', confirmButton: 'ihsan-swal-confirm', cancelButton: 'ihsan-swal-cancel' },
});

/** Show a confirmation dialog. Returns true if user confirmed. */
export async function confirmDialog(
  title: string,
  html?: string,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
): Promise<boolean> {
  const result = await base.fire({
    title,
    html,
    icon: 'warning',
    iconColor: GOLD,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
  });
  return result.isConfirmed;
}

/** Show a success toast notification */
export function toastSuccess(title: string) {
  return Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: '#1a271a',
    color: '#7EC6A0',
    iconColor: '#7EC6A0',
  }).fire({ icon: 'success', title });
}

/** Show an error toast notification */
export function toastError(title: string) {
  return Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 4500,
    timerProgressBar: true,
    background: '#1E1218',
    color: '#E07070',
    iconColor: '#E07070',
  }).fire({ icon: 'error', title });
}

/** Inject the global Swal CSS overrides once */
if (typeof document !== 'undefined') {
  const id = 'ihsan-swal-styles';
  if (!document.getElementById(id)) {
    const s = document.createElement('style');
    s.id = id;
    s.textContent = `
      .ihsan-swal-popup {
        border: 1px solid #2E3347 !important;
        border-radius: 16px !important;
        font-family: Georgia, serif !important;
        box-shadow: 0 24px 64px rgba(0,0,0,0.5) !important;
      }
      .ihsan-swal-confirm {
        font-family: Georgia, serif !important;
        border-radius: 8px !important;
        font-size: 0.9rem !important;
        padding: 0.55rem 1.4rem !important;
      }
      .ihsan-swal-cancel {
        font-family: Georgia, serif !important;
        border-radius: 8px !important;
        font-size: 0.9rem !important;
        padding: 0.55rem 1.4rem !important;
        border: 1px solid #2E3347 !important;
        color: #8A96A8 !important;
        background: transparent !important;
      }
      .swal2-title { font-size: 1.25rem !important; }
      .swal2-icon { margin-bottom: 1rem !important; }
    `;
    document.head.appendChild(s);
  }
}
