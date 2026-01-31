export function formatPhone(value: string): string {
    const clean = value.replace(/\D/g, "");
    const limited = clean.slice(0, 11);
    if (limited.length <= 2) return limited;
    if (limited.length <= 7) return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
}

export function formatCep(value: string): string {
    const clean = value.replace(/\D/g, "");
    const limited = clean.slice(0, 8);
    if (limited.length <= 5) return limited;
    return `${limited.slice(0, 5)}-${limited.slice(5)}`;
}

export function formatDate(value: string): string {
    const clean = value.replace(/\D/g, "");
    const limited = clean.slice(0, 8);
    if (limited.length <= 2) return limited;
    if (limited.length <= 4) return `${limited.slice(0, 2)}/${limited.slice(2)}`;
    return `${limited.slice(0, 2)}/${limited.slice(2, 4)}/${limited.slice(4)}`;
}

export function parseDateBR(dateStr: string): string | null {
    const clean = dateStr.replace(/\D/g, "");
    if (clean.length !== 8) return null;
    const day = clean.slice(0, 2);
    const month = clean.slice(2, 4);
    const year = clean.slice(4, 8);
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > new Date().getFullYear()) return null;
    return `${year}-${month}-${day}`;
}
