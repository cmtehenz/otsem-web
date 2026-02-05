export type CustomerAddress = {
    zipCode: string;
    street: string;
    number?: string;
    complement?: string;
    neighborhood: string;
    cityIbgeCode: string | number;
    city?: string;
    state?: string;
};

export type CpfVerificationStatus = "not_started" | "pending" | "verified" | "failed";

export type CustomerResponse = {
    id: string;
    type: "PF" | "PJ";
    accountStatus: string;
    onboardingCompleted: boolean;
    phoneVerified: boolean;
    cpfVerificationStatus: CpfVerificationStatus;
    name?: string;
    cpf?: string;
    cnpj?: string;
    birthday?: string;
    phone?: string;
    email: string;
    username?: string | null;
    profilePhotoUrl?: string;
    address?: CustomerAddress;
    createdAt: string;
};
