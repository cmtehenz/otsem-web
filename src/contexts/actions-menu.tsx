"use client";
import * as React from "react";

export type Actions = {
    addPix: () => void;
    convertBrlToUsdt: () => void;
    convertUsdtToBrl: () => void;
    sendUsdt: () => void;
    receiveUsdt: () => void;
    openHistory: () => void;
    chargeOnCard: () => void;
    loadDemo: () => void;
    refresh: () => void;
};

const noop = () => { };
const ActionsMenuContext = React.createContext<Actions>({
    addPix: noop,
    convertBrlToUsdt: noop,
    convertUsdtToBrl: noop,
    sendUsdt: noop,
    receiveUsdt: noop,
    openHistory: noop,
    chargeOnCard: noop,
    loadDemo: noop,
    refresh: noop,
});

export function ActionsMenuProvider({
    children,
    value,
}: {
    children: React.ReactNode;
    value: Actions;
}) {
    return (
        <ActionsMenuContext.Provider value={value}>
            {children}
        </ActionsMenuContext.Provider>
    );
}

export function useActionsMenu() {
    return React.useContext(ActionsMenuContext);
}
