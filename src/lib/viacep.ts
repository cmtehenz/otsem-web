export type ViaCepResponse = {
    cep: string;
    logradouro: string;
    complemento: string;
    bairro: string;
    localidade: string;
    uf: string;
    ibge: string;
    ddd: string;
    erro?: boolean;
};

export async function fetchAddressByCep(cep: string): Promise<ViaCepResponse | null> {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) return null;

    const response = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
    const data: ViaCepResponse = await response.json();

    if (data.erro) return null;
    return data;
}
