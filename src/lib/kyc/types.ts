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
