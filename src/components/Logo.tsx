import Image from "next/image";

export function Logo({ width = 120, height = 40 }: { width?: number; height?: number }) {
    return (
        <Image
            src="/logo-otsempay.png"
            alt="otsempay"
            width={width}
            height={height}
            priority
            placeholder="empty"
        />
    );
}