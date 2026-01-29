"use client";

import Link from "next/link";
// se tiver arquivo de imagem, pode trocar por next/image
// import Image from "next/image";

export default function Logo() {
    return (
        <Link href="/dashboard" className="flex items-center gap-2 group">
            {/* exemplo com texto; troque pelo <Image> se tiver logo.png */}
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white shadow-sm group-hover:scale-[1.03] transition">
                OB
            </div>
            <span className="text-sm font-semibold tracking-tight">
                Otsem <span className="text-primary">Bank</span>
            </span>
        </Link>
    );
}
