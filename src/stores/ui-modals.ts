import { create } from "zustand";

type ModalKey = "pix" | "convertBrlUsdt" | "convertUsdtBrl" | "receiveUsdt";

type UiState = {
    open: Record<ModalKey, boolean>;
    openModal: (k: ModalKey) => void;
    closeModal: (k: ModalKey) => void;
};

export const useUiModals = create<UiState>((set) => ({
    open: { pix: false, convertBrlUsdt: false, convertUsdtBrl: false, receiveUsdt: false },
    openModal: (k) => set((s) => ({ open: { ...s.open, [k]: true } })),
    closeModal: (k) => set((s) => ({ open: { ...s.open, [k]: false } })),
}));
