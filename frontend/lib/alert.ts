import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

// Hot Toast Quick Notifications
export class showToast {
  static success(message: string) {
    toast.success(message, {
      id: message,
      duration: 3500,
      position: 'top-right',
      style: {
        background: '#0f172a',
        color: '#ffffff',
        fontSize: '13px',
        fontWeight: '600',
        borderRadius: '16px',
        padding: '12px 18px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
      },
    });
  }

  static error(message: string) {
    toast.error(message, {
      id: message,
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#881337',
        color: '#ffffff',
        fontSize: '13px',
        fontWeight: '600',
        borderRadius: '16px',
        padding: '12px 18px',
        border: '1px solid rgba(244, 63, 94, 0.3)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
      },
    });
  }
}

// SweetAlert2 Confirmation Dialog (Replaces native window.confirm)
export async function showConfirmAlert(
  title: string,
  text: string,
  confirmButtonText: string = 'Yes, proceed!'
): Promise<boolean> {
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#64748b',
    confirmButtonText,
    cancelButtonText: 'Cancel',
    customClass: {
      popup: 'rounded-3xl border border-slate-200 shadow-2xl font-sans',
      confirmButton: 'px-5 py-2.5 rounded-xl text-xs font-bold shadow-md',
      cancelButton: 'px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm',
    },
  });

  return result.isConfirmed;
}

// SweetAlert2 Success Modal
export function showSuccessModal(title: string, text: string) {
  Swal.fire({
    title,
    text,
    icon: 'success',
    confirmButtonColor: '#2563eb',
    customClass: {
      popup: 'rounded-3xl border border-slate-200 shadow-2xl font-sans',
      confirmButton: 'px-6 py-2.5 rounded-xl text-xs font-bold shadow-md',
    },
  });
}

// SweetAlert2 Error Modal
export function showErrorModal(title: string, text: string) {
  Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonColor: '#e11d48',
    customClass: {
      popup: 'rounded-3xl border border-slate-200 shadow-2xl font-sans',
      confirmButton: 'px-6 py-2.5 rounded-xl text-xs font-bold shadow-md',
    },
  });
}
