export class AddressDto {
    id!: string;
    street!: string;
    number!: string;
    complement!: string | null;
    neighborhood!: string;
    city!: string;
    state!: string;
    zipcode!: string;
    country!: string;
}
