# OTSEM Web - Monorepo

Complete KYC platform with tiered verification system for Brazilian financial services.

## 🏗️ Structure

```
otsem-web/
├── backend/          # NestJS API
├── src/              # Next.js Frontend
├── public/           # Static assets
└── README.md
```

## 🚀 Features

### KYC System
- **LEVEL_1** (Automatic): R$ 30k/month (PF) or R$ 50k/month (PJ)
  - CPF/CNPJ validation with check digits
  - Automatic approval on registration

- **LEVEL_2**: R$ 100k/month (PF) or R$ 200k/month (PJ)
  - Document submission required
  - Manual review process

- **LEVEL_3**: Unlimited
  - Enhanced verification
  - Special approval

### Registration
- User type selection (PF - Pessoa Física / PJ - Pessoa Jurídica)
- CPF/CNPJ input with automatic formatting
- Real-time validation
- Duplicate detection

### Backend API
- `POST /auth/register` - User registration with automatic LEVEL_1 KYC
- `POST /auth/login` - User authentication
- `GET /customers/me/limits` - Get user KYC limits
- `POST /customers/kyc-upgrade-requests` - Submit upgrade request

## 🛠️ Setup

### Frontend
```bash
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npx prisma migrate dev
npm run start:dev
```

## 📝 Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend (backend/.env)
```
DATABASE_URL="file:./dev.db"
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
```

## 🔒 KYC Validation

- **CPF**: 11 digits with check digit validation
- **CNPJ**: 14 digits with check digit validation
- Automatic formatting on input
- Server-side validation with proper algorithms

## 🎯 Progressive Disclosure

Users only see the next KYC level upgrade option:
- LEVEL_1 users → Can request LEVEL_2
- LEVEL_2 users → Can request LEVEL_3
- LEVEL_3 users → Maximum level reached

---

Built with ❤️ using Next.js, NestJS, and Prisma
