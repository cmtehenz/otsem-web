export type ViaCepResponse = {
    cep: string;
    logradouro: string;
    complemento: string;
    bairro: string;
    localidade: string;
    uf: string;
    ibge: string;
    gia?: string;
    ddd?: string;
    siafi?: string;
    erro?: boolean;
};

export function onlyDigits(v: string): string {
    return (v || "").replace(/\D/g, "");
}

export function isValidCep(cep: string): boolean {
    return /^\d{8}$/.test(onlyDigits(cep));
}

export async function fetchCep(rawCep: string, signal?: AbortSignal): Promise<ViaCepResponse> {
    const cep = onlyDigits(rawCep);
    if (!isValidCep(cep)) throw new Error("CEP inválido. Use 8 dígitos.");
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal });
    if (!res.ok) throw new Error("Falha ao consultar CEP");
    const data: ViaCepResponse = await res.json();
    if (data.erro === true) throw new Error("CEP não encontrado");
    return data;
}

export function toIbgeNumber(ibge: string | undefined): number {
    const n = Number(ibge ?? 0);
    return Number.isFinite(n) ? n : 0;
}
