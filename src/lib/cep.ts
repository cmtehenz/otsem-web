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
    const digits = onlyDigits(cep);
    return /^\d{8}$/.test(digits);
}

/**
 * Type guard para identificar quando a resposta do ViaCEP indica erro.
 */
function isViaCepError(data: unknown): data is { erro: true } {
    return typeof data === "object" && data !== null && "erro" in data && (data as { erro?: boolean }).erro === true;
}

/**
 * Valida se a resposta do ViaCEP é válida
 */
function isValidViaCepResponse(data: unknown): data is ViaCepResponse {
    if (typeof data !== "object" || data === null) return false;
    const obj = data as Record<string, unknown>;
    return (
        typeof obj.cep === "string" &&
        typeof obj.logradouro === "string" &&
        typeof obj.bairro === "string" &&
        typeof obj.localidade === "string" &&
        typeof obj.uf === "string"
    );
}

/**
 * Busca informações de endereço no ViaCEP.
 */
export async function fetchCep(rawCep: string, signal?: AbortSignal): Promise<ViaCepResponse> {
    const cep = onlyDigits(rawCep);

    if (!isValidCep(cep)) {
        throw new Error("CEP inválido. Use 8 dígitos.");
    }

    const url = `https://viacep.com.br/ws/${cep}/json/`;

    try {
        const res = await fetch(url, {
            signal,
            headers: {
                'Accept': 'application/json',
            }
        });

        if (!res.ok) {
            throw new Error(`Falha ao consultar CEP (HTTP ${res.status})`);
        }

        const data: unknown = await res.json();

        if (isViaCepError(data)) {
            throw new Error("CEP não encontrado");
        }

        if (!isValidViaCepResponse(data)) {
            throw new Error("Resposta inválida do ViaCEP");
        }

        return data;
    } catch (error) {
        console.error("[fetchCep] Erro:", error);

        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                throw new Error("Consulta cancelada");
            }
            throw error;
        }

        throw new Error("Erro ao consultar CEP");
    }
}

/**
 * Formata CEP para exibição (00000-000)
 */
export function formatCep(cep: string): string {
    const digits = onlyDigits(cep);
    if (digits.length !== 8) return cep;
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}
