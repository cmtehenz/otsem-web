// Tipos compartilhados PF/PJ e listagem — sem any

export type AccreditationStatus = "received" | "processing" | "approved" | "rejected";

export type Address = {
    zipCode: string;
    street: string;
    number?: string;
    complement?: string;
    neighborhood: string;
    cityIbgeCode: number;
};

export type PixLimitsIn = {
    singleTransfer: number;
    daytime: number;
    nighttime: number;
    monthly: number;
    serviceId: 1 | 8;
};

/* ===== PF ===== */

export type PersonIn = {
    name: string;
    socialName?: string;
    cpf: string;
    birthday: string; // yyyy-MM-dd
    phone: string;
    email: string;
    genderId?: 1 | 2;
    address: Address;
};

export type AccreditationPFIn = {
    identifier: string;
    productId: 1; // digital-account
    person: PersonIn;
    pixLimits: PixLimitsIn;
};

export type AccreditationPFResponse = {
    StatusCode: number;
    Title: string;
    Type: string;
    Extensions: {
        Message?: string;
        Data?: {
            AccreditationId: string;
            ClientId: string;
            AccreditationStatus: AccreditationStatus;
            AccreditationStatusId: number;
            Product: "digital-account";
            ProductId: 1;
            Person: {
                Name: string;
                SocialName?: string;
                Cpf: string;
                Birthday: string;
                Phone: string;
                Email: string;
                GenderId?: 1 | 2;
                Address: {
                    ZipCode: string;
                    Street: string;
                    Number?: string;
                    Complement?: string;
                    Neighborhood: string;
                    CityIbgeCode: number;
                };
            };
            PixLimits: {
                SingleTransfer: number;
                Daytime: number;
                Nighttime: number;
                Monthly: number;
            };
        };
    };
};

/* ===== PJ ===== */

export type OwnershipItemIn = {
    name: string;
    cpf: string;
    birthday: string; // yyyy-MM-dd
    isAdministrator: boolean;
};

export type CompanyIn = {
    legalName: string;
    tradeName: string;
    cnpj: string;
    phone: string;
    email: string;
    address: Address;
    ownershipStructure: OwnershipItemIn[];
};

export type AccreditationPJIn = {
    identifier: string;
    productId: 1;
    company: CompanyIn;
    pixLimits: PixLimitsIn;
};

export type AccreditationPJResponse = {
    StatusCode: number;
    Title: string;
    Type: string;
    Extensions: {
        Message?: string;
        Data?: {
            AccreditationId: string;
            ClientId: string;
            AccreditationStatus: AccreditationStatus;
            AccreditationStatusId: number;
            Product: "digital-account";
            ProductId: 1;
            Company: {
                LegalName: string;
                TradeName: string;
                Cnpj: string;
                Phone: string;
                Email: string;
                Address: {
                    ZipCode: string;
                    Street: string;
                    Number?: string;
                    Complement?: string;
                    Neighborhood: string;
                    CityIbgeCode: number;
                };
                OwnershipStructure: Array<{
                    Name: string;
                    Cpf: string;
                    Birthday: string;
                    IsAdministrator: boolean;
                }>;
            };
            PixLimits: {
                SingleTransfer: number;
                Daytime: number;
                Nighttime: number;
                Monthly: number;
            };
        };
    };
};

/* ===== Listagem (tabela) ===== */

export type AccreditationListItem = {
    accreditationId: string;
    clientId: string;
    type: "PF" | "PJ";
    name: string;          // PF: Person.Name | PJ: Company.LegalName
    taxId: string;         // CPF/CNPJ
    email: string;
    phone: string;
    status: AccreditationStatus;
    createdAt: string;     // ISO
};

export type AccreditationListResponse = {
    items: AccreditationListItem[];
    total: number;
    page: number;
    pageSize: number;
};

export function mapPFToExternal(in_: AccreditationPFIn) {
    return {
        Identifier: in_.identifier,
        ProductId: in_.productId,
        Person: {
            Name: in_.person.name,
            SocialName: in_.person.socialName ?? "",
            Cpf: in_.person.cpf,
            Birthday: in_.person.birthday,
            Phone: in_.person.phone,
            Email: in_.person.email,
            GenderId: in_.person.genderId,
            Address: {
                ZipCode: in_.person.address.zipCode,
                Street: in_.person.address.street,
                Number: in_.person.address.number ?? "",
                Complement: in_.person.address.complement ?? "",
                Neighborhood: in_.person.address.neighborhood,
                CityIbgeCode: in_.person.address.cityIbgeCode,
            },
        },
        PixLimits: {
            SingleTransfer: in_.pixLimits.singleTransfer,
            DayTime: in_.pixLimits.daytime,   // atenção: API às vezes usa DayTime/NightTime
            NightTime: in_.pixLimits.nighttime,
            Monthly: in_.pixLimits.monthly,
            ServiceId: in_.pixLimits.serviceId,
        },
    };
}

export function mapPJToExternal(in_: AccreditationPJIn) {
    return {
        Identifier: in_.identifier,
        ProductId: in_.productId,
        Company: {
            LegalName: in_.company.legalName,
            TradeName: in_.company.tradeName,
            Cnpj: in_.company.cnpj,
            Phone: in_.company.phone,
            Email: in_.company.email,
            Address: {
                ZipCode: in_.company.address.zipCode,
                Street: in_.company.address.street,
                Number: in_.company.address.number ?? "",
                Complement: in_.company.address.complement ?? "",
                Neighborhood: in_.company.address.neighborhood,
                CityIbgeCode: in_.company.address.cityIbgeCode,
            },
            OwnershipStructure: in_.company.ownershipStructure.map(o => ({
                Name: o.name,
                Cpf: o.cpf,
                Birthday: o.birthday,
                IsAdministrator: o.isAdministrator,
            })),
        },
        PixLimits: {
            SingleTransfer: in_.pixLimits.singleTransfer,
            DayTime: in_.pixLimits.daytime,
            NightTime: in_.pixLimits.nighttime,
            Monthly: in_.pixLimits.monthly,
            ServiceId: in_.pixLimits.serviceId,
        },
    };
}

/* ===========================================================
   ADMIN — LISTAGEM DE CLIENTES (CUSTOMERS)
   =========================================================== */

export type CustomerKycStatus =
    | "not_requested" // KYC não iniciado
    | "in_review"     // aguardando análise
    | "approved"      // aprovado
    | "rejected";     // rejeitado

export type CustomerType = "PF" | "PJ";

/**
 * Item individual da listagem de clientes
 * (baseado no model Customer do Prisma)
 */
export type AdminCustomerItem = {
    id: string;
    type: CustomerType;
    name: string | null;       // nome (PF) ou razão social (PJ)
    taxId: string | null;      // CPF/CNPJ
    phone: string;
    userEmail: string | null;  // email do usuário vinculado
    kycStatus: CustomerKycStatus;
    createdAt: string;         // ISO string
};

/**
 * Resposta paginada de listagem de clientes
 */
export type AdminCustomersListResponse = {
    items: AdminCustomerItem[];
    total: number;
    page: number;
    pageSize: number;
};

