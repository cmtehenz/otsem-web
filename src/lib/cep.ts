export type ViaCepResponse = {
    cep: string;
    logradouro: string;
    complemento: string;
    bairro: string;
    localidade: string; // cidade
    uf: string;         // estado (UF)
    ibge: string;       // código IBGE do município
    gia?: string;
    ddd?: string;
    siafi?: string;
    erro?: boolean;
};

/**
 * Remove todos os caracteres não numéricos.
 */
export function onlyDigits(v: string): string {
    return (v ?? "").replace(/\D/g, "");
}

/**
 * Verifica se o CEP possui 8 dígitos válidos.
 */
export function isValidCep(cep: string): boolean {
    return /^\d{8}$/.test(onlyDigits(cep));
}

/**
 * Type guard para identificar quando a resposta do ViaCEP indica erro.
 */
function isViaCepError(data: unknown): data is { erro: true } {
    return typeof data === "object" && data !== null && "erro" in data && (data as { erro?: boolean }).erro === true;
}

/**
 * Busca informações de endereço no ViaCEP.
 */
export async function fetchCep(rawCep: string, signal?: AbortSignal): Promise<ViaCepResponse> {
    const cep = onlyDigits(rawCep);

    if (!isValidCep(cep)) {
        throw new Error("CEP inválido. Use 8 dígitos.");
    }

    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal });

    if (!res.ok) {
        throw new Error("Falha ao consultar CEP");
    }

    const data: unknown = await res.json();

    if (isViaCepError(data)) {
        throw new Error("CEP não encontrado");
    }

    return data as ViaCepResponse;
}
