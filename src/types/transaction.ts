// Types for PIX transaction details and receipts

export type TransactionType = "PIX_IN" | "PIX_OUT" | "CONVERSION" | "TRANSFER" | "TRANSFER_IN" | "TRANSFER_OUT";
export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED" | "PROCESSING";

export type Transaction = {
    transactionId: string;
    type: TransactionType;
    status: TransactionStatus;
    amount: number;
    description: string;
    senderName?: string | null;
    senderCpf?: string | null;
    recipientName?: string | null;
    recipientCpf?: string | null;
    recipientCnpj?: string | null;
    pixKey?: string | null;
    endToEnd?: string | null;
    txid?: string | null;
    bankProvider?: string | null;
    createdAt: string;
    usdtAmount?: string | number | null;
    subType?: "BUY" | "SELL" | null;
    metadata?: {
        fromUsername?: string;
        toUsername?: string;
        [key: string]: unknown;
    };
    externalData?: {
        txHash?: string;
        usdtAmount?: string | number;
        walletAddress?: string;
        network?: string;
        pagador?: { nome?: string };
        [key: string]: unknown;
    };
};

export type PartyDetails = {
    name: string;
    maskedTaxNumber: string;
    pixKey?: string;
    bankCode?: string;
};

export type TransactionDetails = {
    transactionId: string;
    type: TransactionType;
    status: TransactionStatus;
    amount: number;
    description: string;
    createdAt: string;
    completedAt?: string | null;
    balanceBefore?: number | null;
    balanceAfter?: number | null;
    payer?: PartyDetails | null;
    receiver?: PartyDetails | null;
    endToEnd?: string | null;
    txid?: string | null;
    bankProvider?: string | null;
    hasReceipt: boolean;
};

export type TransactionReceipt = {
    title: string;
    transactionId: string;
    endToEndId?: string | null;
    txid?: string | null;
    amount: number;
    date: string;
    completionDate?: string | null;
    payer: PartyDetails;
    receiver: PartyDetails;
    bankProvider?: string | null;
    payerMessage?: string | null;
};
