// src/lib/api.ts
"use client";

import { nanoid } from "nanoid";

// =====================
// Tipos base
// =====================
export type Tx = {
    id: string;
    createdAt: string;
    type: "CREDIT" | "DEBIT";
    origin?: "PIX" | "CARD" | "CONVERSION" | "PAYOUT" | "MANUAL";
    asset: "BRL" | "USDT";
    amount: number;
    description?: string;
    txid?: string;
    meta?: Record<string, unknown>;
};

export type PixChargeStatus =
    | "CREATED"
    | "PENDING"
    | "PAID"
    | "CONVERTING"
    | "SETTLED"
    | "CANCELED"
    | "EXPIRED";

export type PixCharge = {
    id: string;
    txid: string;
    status: PixChargeStatus;
    valor: number;
    qrCode?: string;
    copyPaste?: string;
    createdAt: string;
    expiresAt: string;
};

export type Balances = { brl: number; usdt: number };
export type Network = "TRON" | "ETHEREUM" | "SOLANA";
export type DepositAddress = { network: Network; address: string; qrCode?: string; memoTag?: string };

// ——— Cartão (demo) ———
export type CardPaymentStatus =
    | "CREATED"
    | "REQUIRES_ACTION"
    | "AUTHORIZED"
    | "CAPTURED"
    | "PARTIALLY_SETTLED"
    | "SETTLED"
    | "FAILED"
    | "CANCELED";

export type CardPayment = {
    id: string;
    clientId: string;      // lojista
    amount_brl: number;
    installments: number;  // 1..12
    status: CardPaymentStatus;
    mdr_percent?: number;
    fee_fixed_brl?: number;
    interest_brl?: number;
    settled_brl?: number;
    converted_usdt?: number;
    processor?: string;
    processorRef?: string;
    createdAt: string;
};

// =====================
// Ambiente demo + store
// =====================
const DEMO = typeof window !== "undefined" && process.env.NEXT_PUBLIC_DEMO_MODE === "true";
const DEMO_RATE = 5.5; // 1 USDT ~ R$5,50

const PERSIST = true;
const STORE_KEY = "otsem_demo_store_v2";

type Store = {
    balances: Balances;
    txs: Tx[];
    pix: Record<string, PixCharge>;
    card: Record<string, CardPayment>;
    seeded?: boolean;
};

function defaultStore(): Store {
    return {
        balances: { brl: 5000, usdt: 1200 },
        txs: [
            {
                id: nanoid(),
                createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
                type: "CREDIT",
                origin: "PIX",
                asset: "BRL",
                amount: 1500,
                description: "Pix recebido – João",
            },
            {
                id: nanoid(),
                createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                type: "DEBIT",
                origin: "PAYOUT",
                asset: "USDT",
                amount: 120,
                description: "Envio TRON",
            },
        ],
        pix: {},
        card: {},
        seeded: true,
    };
}

function loadStore(): Store {
    if (!PERSIST || typeof window === "undefined") return defaultStore();
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) {
        const base = defaultStore();
        localStorage.setItem(STORE_KEY, JSON.stringify(base));
        return base;
    }
    try {
        const parsed = JSON.parse(raw) as Store;
        if (typeof parsed !== "object" || parsed === null) {
            throw new Error("Invalid store data");
        }
        if (!("card" in parsed) || typeof parsed.card !== "object" || parsed.card === undefined) (parsed as Store).card = {};
        if (!parsed.seeded) {
            const seeded = { ...defaultStore(), ...parsed, seeded: true };
            localStorage.setItem(STORE_KEY, JSON.stringify(seeded));
            return seeded;
        }
        return parsed;
    } catch {
        const base = defaultStore();
        localStorage.setItem(STORE_KEY, JSON.stringify(base));
        return base;
    }
}

function saveStore(s: Store): void {
    if (!PERSIST || typeof window === "undefined") return;
    localStorage.setItem(STORE_KEY, JSON.stringify(s));
}

const store: Store = loadStore();

// =====================
// Utils
// =====================
function fakeQR(id: string): string {
    const svg = encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='512' height='512'>
      <rect width='100%' height='100%' fill='#EEE'/>
      <rect x='32' y='32' width='448' height='448' fill='#000' opacity='0.06'/>
      <text x='50%' y='48%' dominant-baseline='middle' text-anchor='middle' font-size='22' font-family='monospace'>PIX DEMO</text>
      <text x='50%' y='56%' dominant-baseline='middle' text-anchor='middle' font-size='14' font-family='monospace'>${id.slice(0, 10)}…</text>
    </svg>`
    );
    return `data:image/svg+xml;charset=utf-8,${svg}`;
}

function sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
}

/** Normaliza path para funcionar com /api, i18n (/pt, /en, /es) e barra final */
function normalize(url: URL): { pathnameOnly: string; normPath: string } {
    const pathnameOnly = url.pathname
        .replace(/^\/api\b/, "")       // remove prefixo /api
        .replace(/^\/(pt|en|es)\b/, "")// remove locale comum (ajuste se tiver outros)
        .replace(/\/+$/, "");          // remove barra final
    const normPath = pathnameOnly + (url.search || "");
    return { pathnameOnly, normPath };
}

// =====================
// Tipos de bodies POST
// =====================
type PostPixChargeBody = {
    amountBrl: number;
    description?: string;
    autoConvert?: boolean;
};

type PostPayoutBody = {
    network: Network | string;
    toAddress: string;
    amount: number;
};

type PostConversionBody = {
    amountBRL: number;
};

type PostDemoFundBody = {
    addBRL?: number;
    addUSDT?: number;
};

type PostCardIntentBody = {
    amount_brl: number;
    installments: number;
};

type PostCardConfirmBody = {
    card_token: string;
};

// =====================
// API base
// =====================
export async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
    if (!DEMO) {
        return fetch(input, { credentials: "include", ...(init ?? {}) });
    }

    // DEMO MODE
    const url = new URL(input, window.location.origin);
    const method = (init?.method || "GET").toUpperCase();
    const { pathnameOnly, normPath } = normalize(url);

    const json = (body: unknown, ok = true, status = ok ? 200 : 400): Response =>
        new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

    // latência fake
    await sleep(180);

    // ---------- GETs ----------

    // saldos
    if (normPath.startsWith("/wallets/me") && method === "GET") {
        return json({ brl: store.balances.brl, usdt: store.balances.usdt });
    }

    // lista transações (com paginação e filtros básicos)
    if (normPath.startsWith("/transactions") && method === "GET" && !/\/transactions\//.test(normPath)) {
        const qs = url.searchParams;
        const page = Number(qs.get("page") || 1);
        const limit = Number(qs.get("limit") || 10);

        let items = [...store.txs].sort(
            (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
        );

        const q = qs.get("q")?.toLowerCase();
        const asset = qs.get("asset");
        const type = qs.get("type");
        const origin = qs.get("origin");
        const from = qs.get("from");
        const to = qs.get("to");

        if (q) items = items.filter((t) => (t.description || "").toLowerCase().includes(q) || t.id.includes(q));
        if (asset && asset !== "ALL") items = items.filter((t) => t.asset === asset);
        if (type && type !== "ALL") items = items.filter((t) => t.type === type);
        if (origin && origin !== "ALL") items = items.filter((t) => t.origin === origin);
        if (from) items = items.filter((t) => +new Date(t.createdAt) >= +new Date(from));
        if (to) items = items.filter((t) => +new Date(t.createdAt) <= +new Date(to) + 24 * 60 * 60 * 1000 - 1);

        const start = (page - 1) * limit;
        return json({ items: items.slice(start, start + limit), total: items.length, page, limit });
    }

    // detalhe transação
    if (/^\/transactions\/[\w-]+$/.test(pathnameOnly) && method === "GET") {
        const id = pathnameOnly.split("/").pop()!;
        const found = store.txs.find((t) => t.id === id);
        return found ? json(found) : json({ message: "Not found" }, false, 404);
    }

    // status pix
    if (/^\/pix\/charges\/[\w-]+$/.test(pathnameOnly) && method === "GET") {
        const id = pathnameOnly.split("/").pop()!;
        const ch = store.pix[id];
        return ch ? json(ch) : json({ message: "Not found" }, false, 404);
    }

    // endereço de depósito USDT
    if (normPath.startsWith("/wallets/usdt/deposit-address") && method === "GET") {
        const net = (url.searchParams.get("network") || "TRON") as Network;
        const addrByNet: Record<Network, string> = {
            TRON: "TDEMOu7N7yA1vC4hC2CqV3QSa",
            ETHEREUM: "0xDEMo00000000000000000000000000000fAcE",
            SOLANA: "DEMo9jKhd3h1U2e3s8f4QzX1YpJ6LkQw",
        };
        const resp: DepositAddress = { network: net, address: addrByNet[net], qrCode: fakeQR(addrByNet[net]) };
        return json(resp);
    }

    // ---------- POSTs ----------

    // criar cobrança pix
    if (normPath.startsWith("/pix/charges") && method === "POST") {
        const raw = init?.body as string | undefined;
        const body = raw ? (JSON.parse(raw) as PostPixChargeBody) : { amountBrl: 0, autoConvert: false };

        const amountBrl = Number(body.amountBrl || 0);
        const autoConvert = Boolean(body.autoConvert);

        if (amountBrl <= 0) return json({ message: "Valor inválido" }, false, 400);

        const id = nanoid();
        const txid = `E2E-${nanoid(10)}`;
        const charge: PixCharge = {
            id,
            txid,
            status: "PENDING",
            valor: amountBrl,
            copyPaste: `000201PIX-DEMO-${id}`,
            qrCode: fakeQR(id),
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
        };

        store.pix[id] = charge;
        saveStore(store);

        // simula PAID em 3s
        setTimeout(() => {
            store.pix[id].status = "PAID";
            store.balances.brl += amountBrl;
            store.txs.unshift({
                id: nanoid(),
                createdAt: new Date().toISOString(),
                type: "CREDIT",
                origin: "PIX",
                asset: "BRL",
                amount: amountBrl,
                description: `Pix demo ${txid}`,
            });
            saveStore(store);
        }, 3000);

        // simula SETTLED (+ conversão automática)
        setTimeout(() => {
            store.pix[id].status = "SETTLED";
            if (autoConvert) {
                const usdt = +(amountBrl / DEMO_RATE).toFixed(2);
                store.balances.brl -= amountBrl;
                store.balances.usdt += usdt;
                store.txs.unshift({
                    id: nanoid(),
                    createdAt: new Date().toISOString(),
                    type: "DEBIT",
                    origin: "CONVERSION",
                    asset: "BRL",
                    amount: amountBrl,
                    description: "Conversão demo BRL→USDT",
                });
                store.txs.unshift({
                    id: nanoid(),
                    createdAt: new Date().toISOString(),
                    type: "CREDIT",
                    origin: "CONVERSION",
                    asset: "USDT",
                    amount: usdt,
                    description: "Conversão demo BRL→USDT",
                });
            }
            saveStore(store);
        }, 6000);

        return json(charge, true, 201);
    }

    // payout (enviar USDT)
    if (normPath.startsWith("/payouts") && method === "POST") {
        const raw = init?.body as string | undefined;
        const body = raw ? (JSON.parse(raw) as PostPayoutBody) : { network: "TRON", toAddress: "", amount: 0 };

        const amount = Number(body.amount || 0);
        const network = String(body.network || "TRON").toUpperCase();
        const toAddress = String(body.toAddress || "");

        if (!["TRON", "ETHEREUM", "SOLANA"].includes(network)) return json({ message: "Rede inválida" }, false, 400);
        if (!toAddress || toAddress.length < 8) return json({ message: "Endereço inválido" }, false, 400);
        if (amount <= 0) return json({ message: "Valor inválido" }, false, 400);
        if (store.balances.usdt < amount) return json({ message: "Saldo insuficiente" }, false, 400);

        store.balances.usdt -= amount;
        store.txs.unshift({
            id: nanoid(),
            createdAt: new Date().toISOString(),
            type: "DEBIT",
            origin: "PAYOUT",
            asset: "USDT",
            amount,
            description: `Payout demo ${network} → ${toAddress.slice(0, 8)}…`,
            meta: { network, toAddress },
        });

        const txHash = `0x${nanoid(32)}`;
        saveStore(store);
        return json({ txHash }, true, 201);
    }

    // conversão BRL -> USDT
    if (normPath.startsWith("/conversions/brl-to-usdt") && method === "POST") {
        const raw = init?.body as string | undefined;
        const body = raw ? (JSON.parse(raw) as PostConversionBody) : { amountBRL: 0 };

        const amountBRL = Number(body.amountBRL || 0);
        if (amountBRL <= 0) return json({ message: "Valor inválido" }, false, 400);
        if (store.balances.brl < amountBRL) return json({ message: "Saldo BRL insuficiente" }, false, 400);

        const usdt = +(amountBRL / DEMO_RATE).toFixed(2);
        store.balances.brl -= amountBRL;
        store.balances.usdt += usdt;

        store.txs.unshift({
            id: nanoid(),
            createdAt: new Date().toISOString(),
            type: "DEBIT",
            origin: "CONVERSION",
            asset: "BRL",
            amount: amountBRL,
            description: "Conversão demo BRL→USDT",
        });
        store.txs.unshift({
            id: nanoid(),
            createdAt: new Date().toISOString(),
            type: "CREDIT",
            origin: "CONVERSION",
            asset: "USDT",
            amount: usdt,
            description: "Conversão demo BRL→USDT",
        });

        saveStore(store);
        return json({ ok: true, rate: DEMO_RATE, amountBRL, usdtAdded: usdt }, true, 201);
    }

    // carregar dinheiro demo
    if (normPath.startsWith("/demo/fund") && method === "POST") {
        const raw = init?.body as string | undefined;
        const body = raw ? (JSON.parse(raw) as PostDemoFundBody) : {};

        const addBRL = Number(body.addBRL || 0);
        const addUSDT = Number(body.addUSDT || 0);

        if (addBRL > 0) {
            store.balances.brl += addBRL;
            store.txs.unshift({
                id: nanoid(),
                createdAt: new Date().toISOString(),
                type: "CREDIT",
                origin: "MANUAL",
                asset: "BRL",
                amount: addBRL,
                description: "Depósito demo BRL",
            });
        }
        if (addUSDT > 0) {
            store.balances.usdt += addUSDT;
            store.txs.unshift({
                id: nanoid(),
                createdAt: new Date().toISOString(),
                type: "CREDIT",
                origin: "MANUAL",
                asset: "USDT",
                amount: addUSDT,
                description: "Depósito demo USDT",
            });
        }

        saveStore(store);
        return json({ ok: true, brl: store.balances.brl, usdt: store.balances.usdt }, true, 201);
    }

    // ====== CARD PAYMENTS (DEMO) ======

    // intent
    if (normPath.startsWith("/card/payments/intent") && method === "POST") {
        const raw = init?.body as string | undefined;
        const body = raw ? (JSON.parse(raw) as PostCardIntentBody) : { amount_brl: 0, installments: 1 };

        const amount = Number(body.amount_brl || 0);
        const installments = Number(body.installments || 1);
        if (amount <= 0) return json({ message: "Valor inválido" }, false, 400);
        if (installments < 1 || installments > 12) return json({ message: "Parcelas inválidas" }, false, 400);

        const mdr_percent = 2.8;
        const fee_fixed_brl = 1.5;
        const interest_brl = installments > 1 ? +(amount * 0.015 * (installments - 1)).toFixed(2) : 0;

        const id = nanoid();
        const processorRef = `cp_${nanoid(10)}`;

        const payment: CardPayment = {
            id,
            clientId: "me",
            amount_brl: amount,
            installments,
            status: "REQUIRES_ACTION",
            mdr_percent,
            fee_fixed_brl,
            interest_brl,
            settled_brl: 0,
            converted_usdt: 0,
            processor: "DEMO-PROC",
            processorRef,
            createdAt: new Date().toISOString(),
        };

        store.card[id] = payment;
        saveStore(store);
        return json(payment, true, 201);
    }

    // conversão USDT -> BRL
    if (normPath.startsWith("/conversions/usdt-to-brl") && method === "POST") {
        const raw = init?.body as string | undefined;
        const body = raw ? (JSON.parse(raw) as { amountUSDT: number }) : { amountUSDT: 0 };

        const amountUSDT = Number(body.amountUSDT || 0);
        if (amountUSDT <= 0) return json({ message: "Valor inválido" }, false, 400);
        if (store.balances.usdt < amountUSDT) return json({ message: "Saldo USDT insuficiente" }, false, 400);

        const brl = +(amountUSDT * DEMO_RATE).toFixed(2);
        store.balances.usdt -= amountUSDT;
        store.balances.brl += brl;

        store.txs.unshift({
            id: nanoid(),
            createdAt: new Date().toISOString(),
            type: "DEBIT",
            origin: "CONVERSION",
            asset: "USDT",
            amount: amountUSDT,
            description: "Conversão demo USDT→BRL",
        });
        store.txs.unshift({
            id: nanoid(),
            createdAt: new Date().toISOString(),
            type: "CREDIT",
            origin: "CONVERSION",
            asset: "BRL",
            amount: brl,
            description: "Conversão demo USDT→BRL",
        });

        saveStore(store);
        return json({ ok: true, rate: DEMO_RATE, amountUSDT, brlAdded: brl }, true, 201);
    }


    // confirm
    if (/^\/card\/payments\/[\w-]+\/confirm$/.test(pathnameOnly) && method === "POST") {
        const id = pathnameOnly.split("/")[3]!;
        const raw = init?.body as string | undefined;
        const body = raw ? (JSON.parse(raw) as PostCardConfirmBody) : { card_token: "" };

        const pay = store.card[id];
        if (!pay) return json({ message: "Pagamento não encontrado" }, false, 404);
        if (!body.card_token || body.card_token.length < 6) return json({ message: "Token inválido" }, false, 400);

        // AUTHORIZED
        store.card[id] = { ...pay, status: "AUTHORIZED" };
        saveStore(store);

        // CAPTURED
        setTimeout(() => {
            const p = store.card[id]; if (!p) return;
            store.card[id] = { ...p, status: "CAPTURED" };
            saveStore(store);
        }, 900);

        // SETTLED + conversão
        setTimeout(() => {
            const p = store.card[id]; if (!p) return;

            const gross = p.amount_brl + (p.interest_brl ?? 0);
            const feeVar = (p.mdr_percent ?? 0) / 100 * gross;
            const feeFix = p.fee_fixed_brl ?? 0;
            const settled = +(gross - feeVar - feeFix).toFixed(2);

            // crédito BRL
            store.balances.brl += settled;
            store.txs.unshift({
                id: nanoid(),
                createdAt: new Date().toISOString(),
                type: "CREDIT",
                origin: "CARD",
                asset: "BRL",
                amount: settled,
                description: `Cartão (capturado) ${p.processorRef}`,
            });

            // conversão BRL→USDT
            const usdt = +(settled / DEMO_RATE).toFixed(2);
            store.balances.brl -= settled;
            store.balances.usdt += usdt;
            store.txs.unshift({
                id: nanoid(),
                createdAt: new Date().toISOString(),
                type: "DEBIT",
                origin: "CONVERSION",
                asset: "BRL",
                amount: settled,
                description: "Conversão demo BRL→USDT (cartão)",
            });
            store.txs.unshift({
                id: nanoid(),
                createdAt: new Date().toISOString(),
                type: "CREDIT",
                origin: "CONVERSION",
                asset: "USDT",
                amount: usdt,
                description: "Conversão demo BRL→USDT (cartão)",
            });

            store.card[id] = { ...p, status: "SETTLED", settled_brl: settled, converted_usdt: usdt };
            saveStore(store);
        }, 2300);

        return json(store.card[id], true, 200);
    }

    // get status
    if (/^\/card\/payments\/[\w-]+$/.test(pathnameOnly) && method === "GET") {
        const id = pathnameOnly.split("/").pop()!;
        const p = store.card[id];
        return p ? json(p) : json({ message: "Pagamento não encontrado" }, false, 404);
    }

    // ——— rota desconhecida ———
    return json({ message: `No demo route for ${method} ${normPath}` }, false, 404);
}

// =====================
// Helpers
// =====================
export const swrFetcher = <T>(url: string): Promise<T> =>
    apiFetch(url).then((r) => r.json() as Promise<T>);

export async function apiPost<T = unknown>(url: string, body: unknown): Promise<T> {
    const res = await apiFetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const data: unknown = await res.json();
    if (!res.ok) {
        const message = (data as { message?: string } | null)?.message ?? "Request failed";
        throw new Error(message);
    }
    return data as T;
}

// =====================
// Result API (sem try/catch no componente)
// =====================
export class ApiError extends Error {
    readonly status: number;
    readonly code?: string;
    readonly payload?: unknown;
    constructor(message: string, opts: { status: number; code?: string; payload?: unknown }) {
        super(message);
        this.name = "ApiError";
        this.status = opts.status;
        this.code = opts.code;
        this.payload = opts.payload;
    }
}

export type Ok<T> = { ok: true; data: T };
export type Err = { ok: false; error: ApiError };
export type Result<T> = Ok<T> | Err;

export async function apiSafePost<T>(url: string, body: unknown): Promise<Result<T>> {
    try {
        const res = await apiFetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const data: unknown = await res.json().catch(() => ({}));

        if (!res.ok) {
            const msg = (data as { message?: string } | null)?.message ?? "Request failed";
            return { ok: false, error: new ApiError(msg, { status: res.status, payload: data }) };
        }
        return { ok: true, data: data as T };
    } catch (e) {
        const err = e instanceof Error ? new ApiError(e.message, { status: 0 }) : new ApiError("Network error", { status: 0 });
        return { ok: false, error: err };
    }
}
