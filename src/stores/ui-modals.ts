// src/stores/ui-modals.ts
"use client";

import { create } from "zustand";

// Liste todas as chaves de modal aqui (fonte única da verdade)
export const MODAL_KEYS = [
    "pix",
    "convertBrlUsdt",
    "convertUsdtBrl",
    "sendUsdt",
    "receiveUsdt",
] as const;

export type ModalKey = typeof MODAL_KEYS[number];

type OpenState = Record<ModalKey, boolean>;

type UiModalsState = {
    open: OpenState;
    openModal: (k: ModalKey) => void;
    closeModal: (k: ModalKey) => void;
    toggleModal: (k: ModalKey) => void;
    closeAll: () => void;
};

const initialOpen: OpenState = {
    pix: false,
    convertBrlUsdt: false,
    convertUsdtBrl: false,
    sendUsdt: false,
    receiveUsdt: false,
};

export const useUiModals = create<UiModalsState>((set) => ({
    open: initialOpen,
    openModal: (k) => set((s) => ({ open: { ...s.open, [k]: true } })),
    closeModal: (k) => set((s) => ({ open: { ...s.open, [k]: false } })),
    toggleModal: (k) => set((s) => ({ open: { ...s.open, [k]: !s.open[k] } })),
    closeAll: () => set({ open: initialOpen }),
}));
