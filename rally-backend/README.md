# Rally Backend API

Production-ready NestJS backend for **Rally** — Solana-focused team and activity coordination platform.

Rally allows web3 users and builders to organize, discover, and join online or in-person activities, build local & virtual squads, and build an on-chain verifiable social reputation over time based on actual event participation.

---

## İçindekiler
1. [Proje Mimarisi ve Teknolojiler](#proje-mimarisi-ve-teknolojiler)
2. [Klasör Yapısı](#klasör-yapısı)
3. [Veritabanı Modelleri (Prisma ORM)](#veritabanı-modelleri-prisma-orm)
4. [Solana Wallet Tabanlı Authentication Akışı](#solana-wallet-tabanlı-authentication-akışı)
5. [Önemli Mimari Kararlar](#önemli-mimari-kararlar)
6. [Kurulum ve Çalıştırma Rehberi](#kurulum-ve-çalıştırma-rehberi)
7. [API Endpoint Referansı](#api-endpoint-referansı)
8. [Frontend - Backend Entegrasyon Tablosu](#frontend---backend-entegrasyon-tablosu)
9. [Mock Data -> Database Dönüşüm Tablosu](#mock-data---database-dönüşüm-tablosu)
10. [Örnek Frontend API İstemcisi (TypeScript & Axios)](#örnek-frontend-api-istemcisi-typescript--axios)
11. [Test Stratejisi ve Testlerin Çalıştırılması](#test-stratejisi-ve-testlerin-çalıştırılması)

---

## Proje Mimarisi ve Teknolojiler

Backend, kurumsal standartlarda modüler **NestJS** mimarisi ile inşa edilmiştir:

- **Çalışma Zamanı & Dil:** Node.js (v18+) & TypeScript 5+
- **Framework:** NestJS (v10) - Controller / Service / DTO / Guard / Interceptor / Filter ayrımı
- **Veritabanı & ORM:** PostgreSQL 16 & Prisma ORM
- **Kimlik Doğrulama:** Solana Ed25519 Wallet Signature Verification (`tweetnacl`, `bs58`) + JWT (`@nestjs/jwt`, `passport-jwt`)
- **Doğrulama & Serileştirme:** `class-validator`, `class-transformer`
- **Dokümantasyon:** OpenAPI / Swagger (`@nestjs/swagger`) `/api/docs`
- **Konteynerleştirme:** Docker & Docker Compose (PostgreSQL + NestJS app)

---

## Klasör Yapısı

```text
rally-backend/
├── src/
│   ├── common/                  # Ortak filtreler, interceptorlar, decoratorler ve guardlar
│   │   ├── decorators/          # @CurrentUser(), @Public()
│   │   ├── filters/             # HttpExceptionFilter (Standardize edilmiş hata formatı)
│   │   ├── guards/              # JwtAuthGuard
│   │   ├── interceptors/        # TransformInterceptor ({ success: true, data: ... })
│   │   └── interfaces/          # ApiResponse, JwtPayload, AuthenticatedUser
│   ├── config/                  # Ortam değişkenleri ve yapılandırma servisi
│   ├── prisma/                  # PrismaClient wrapper servisi ve modülü
│   ├── auth/                    # Solana wallet auth (Nonce challenge, verify signature, JWT)
│   │   ├── dto/                 # VerifySignatureDto, NonceResponseDto
│   │   └── strategies/          # JwtStrategy
│   ├── users/                   # Kullanıcı profilleri, dinamik metrik hesaplamaları
│   │   └── dto/                 # UpdateUserDto, UserProfileDto
│   ├── activities/              # Aktivite CRUD, transaction-safe join/leave/cancel
│   │   └── dto/                 # CreateActivityDto, UpdateActivityDto, QueryActivityDto
│   ├── my-activities/           # Katılınan, oluşturulan, tamamlanan aktiviteler
│   ├── notifications/           # Bildirim listeleme ve okundu işaretleme
│   ├── reputation/              # İtibar olay günlüğü ve puanlama servisi
│   ├── app.module.ts            # Kök uygulama modülü
│   └── main.ts                  # Giriş noktası (Swagger, CORS, global pipes & filters)
├── prisma/
│   ├── schema.prisma            # Veritabanı şeması ve ilişkileri
│   └── seed.ts                  # Frontend mockData ile uyumlu başlangıç verileri
├── test/                        # E2E ve entegrasyon testleri
├── docker-compose.yml           # PostgreSQL konteyner yapılandırması
├── Dockerfile                   # Multi-stage production build
├── .env.example                 # Örnek ortam değişkenleri
├── package.json                 # Bağımlılıklar ve npm scriptleri
└── README.md                    # Proje dokümantasyonu
```

---

## Veritabanı Modelleri (Prisma ORM)

Platformun ilişkisel veri modeli PostgreSQL üzerinde Prisma ile yönetilir:

### 1. User
Solana cüzdan adresi ile tanımlanan kullanıcı hesabı:
- `id` (UUID, Birincil Anahtar)
- `walletAddress` (String, Unique) — Solana public key
- `username` (String, Unique)
- `bio`, `avatarUrl` (String)
- `reputation` (Int, varsayılan 100)
- `nonce`, `nonceExpiresAt` (Challenge mesajı doğrulaması için)
- `badges` (String dizisi: `['Top Host', 'Early Adopter', 'Solana Dev']`)

### 2. Activity
Oluşturulan etkinlik veya buluşma kaydı:
- `id` (UUID, Birincil Anahtar)
- `title`, `description` (String)
- `category` (`Gaming` | `Sports` | `Development` | `Learning` | `Creative` | `Social` | `Other`)
- `location` (String — Fiziksel adres veya online bağlantı)
- `date`, `time`, `duration` (String — örn. `2026-09-18`, `18:00`, `2 hours`)
- `creatorId` (User dış anahtarı)
- `maxParticipants` (Int)
- `requirements` (String[])
- `status` (`Open` | `Full` | `Completed` | `Cancelled`)
- `isOnline` (Boolean)

### 3. ActivityParticipant (Many-to-Many Ara Tablo)
Aktivite ve katılımcı arasındaki ilişki:
- `activityId` + `userId` (Bileşik unique constraint: `@@unique([activityId, userId])`)
- `role` (`CREATOR` | `PARTICIPANT`)
- `status` (`JOINED` | `LEFT` | `ATTENDED` | `NO_SHOW`)
- `joinedAt` (DateTime)

### 4. ReputationEvent
İtibar hareketlerinin denetim günlüğü:
- `userId`, `activityId`
- `eventType` (`INITIAL_CREDIT`, `ACTIVITY_COMPLETED`, `ATTENDED`, `HOSTED_SUCCESSFULLY`, `CANCELLED_LATE`, `NO_SHOW`, `FEEDBACK_POSITIVE`, vb.)
- `change` (Int: `+5`, `+3`, `-10`)
- `reason` (String)

### 5. Notification
Kullanıcıya gönderilen sistem ve aktivite bildirimleri:
- `userId`, `content`, `read` (Boolean), `activityId`, `createdAt`

---

## Solana Wallet Tabanlı Authentication Akışı

Rally cüzdan odaklıdır; kullanıcı şifre veya e-posta yerine Solana cüzdanı (Phantom, Solflare vb.) ile kimliğini doğrular.

```text
[Frontend: Solana Wallet]                 [Backend: Rally API]
        |                                          |
        | 1. GET /api/auth/nonce/:walletAddress    |
        |----------------------------------------->|
        |                                          |  Üret: Kriptografik rastgele nonce
        |                                          |  Hazırla: İmzalanacak metin mesajı
        | 2. Nonce + Mesaj + Son Geçerlilik        |  Kaydet: User tablosunda (10 dk TTL)
        |<-----------------------------------------|
        |                                          |
        | [Cüzdanda signMessage() çağrılır]        |
        |                                          |
        | 3. POST /api/auth/verify                 |
        |    { walletAddress, signature }          |
        |----------------------------------------->|
        |                                          |  Doğrula: tweetnacl ile Ed25519 imza
        |                                          |  Kontrol et: Nonce süresi dolmamış
        |                                          |  Geçersiz kıl: Nonce'u temizle (Replay Attack önleme)
        | 4. JWT Access Token + Profil Bilgisi     |  Üret: Bearer JWT Token
        |<-----------------------------------------|
        |                                          |
        | 5. İsteklerde Authorization: Bearer <JWT>|
        |----------------------------------------->|
```

### İmza Doğrulama Detayı:
Backend gelen imzayı `tweetnacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes)` fonksiyonu ile doğrular. Kullanıcının private key'i hiçbir zaman frontend'den dışarı çıkmaz.

---

## Önemli Mimari Kararlar

### 1. Creator'ın Activity Katılımcıları Arasındaki Yeri
* **Karar:** Yeni bir aktivite oluşturulduğunda creator, `ActivityParticipant` tablosuna `role: CREATOR` ve `status: JOINED` olarak ilk katılımcı şeklinde otomatik eklenir.
* **Neden:**
  1. Frontend'de aktivite detayında veya kartlarında doluluk oranı `participants.length / maxParticipants` olarak gösterilir. Host etkinliğe dahil olduğundan kapasiteyi tüketmelidir (örn: 5 kişilik masa tenisinde host + 4 katılımcı).
  2. Host'un yanlışlıkla tekrar "Join" butonuna basması engellenir (`creatorId === userId` kontrolü).
  3. Creator etkinliği "Leave" yapamaz, yalnızca "Cancel" edebilir.
  4. Çok-kaynaklı sorgularda `ActivityParticipant` üzerinden hem host hem diğer katılımcılar tek sorguyla `include: { user: true }` yapılarak çekilebilir.

### 2. Eşzamanlılık ve Race Condition Koruması (Join İşlemi)
* Son boş koltuğa aynı anda iki kullanıcı başvurursa aşırı katılım olmaması için `this.prisma.$transaction(async (tx) => { ... })` kullanılmıştır.
* Transaction içerisinde güncel katılımcı sayısı `tx.activityParticipant.count` / `tx.activity.findUnique` ile okunur, kapasite kontrol edilir, `tx.activityParticipant.create` yapılır.
* Katılımcı sayısı `maxParticipants` limitine ulaştığı anda aktivite `status: Full` durumuna güncellenir.
* Bir kullanıcı ayrıldığında (`leave`), aktivite `Full` ise otomatik olarak tekrar `Open` durumuna alınır.

### 3. Dinamik İtibar ve Profil İstatistikleri
Frontend'de gösterilen `activitiesCompleted`, `attendanceRate` ve `peopleMet` değerleri sabit (hardcoded) tutulmaz:
* `activitiesCompleted`: Kullanıcının katıldığı ve durumu `Completed` olan aktivitelerin toplamı.
* `attendanceRate`: Tamamlanan etkinliklerde `ATTENDED / (ATTENDED + NO_SHOW) * 100`.
* `peopleMet`: Kullanıcının tamamlanan aktivitelerde karşılaştığı **tekil (distinct)** diğer kullanıcıların sayısı (`Set<string>` ile hesaplanır).
* `categoryBreakdown`: Kullanıcının geçmiş aktivitelerinin kategorilere göre dağılımı.

### 4. Standart Yanıt ve Hata Formatı
API tüm başarılı ve başarısız yanıtları kurumsal JSON sözleşmesiyle döner:
* Başarı:
  ```json
  {
    "success": true,
    "data": { ... },
    "timestamp": "2026-09-12T10:00:00.000Z"
  }
  ```
* Hata:
  ```json
  {
    "success": false,
    "statusCode": 409,
    "message": "This activity is already full.",
    "error": "ConflictException",
    "timestamp": "2026-09-12T10:00:00.000Z"
  }
  ```

---

## Kurulum ve Çalıştırma Rehberi

### Gereksinimler
- Node.js v18 veya üstü
- PostgreSQL 14+ (veya Docker)

### 1. Repoyu Hazırlama ve Bağımlılıkları Yükleme
```bash
cd rally-backend
npm install
```

### 2. Ortam Değişkenleri
`.env.example` dosyasını `.env` olarak kopyalayın:
```bash
cp .env.example .env
```
Örnek `.env`:
```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/rally_db?schema=public"
JWT_SECRET=rally_super_secret_jwt_key_min_32_chars_long_production_ready
JWT_EXPIRES_IN=7d
NONCE_EXPIRATION_MINUTES=10
```

### 3. Veritabanını Docker ile Ayağa Kaldırma (İsteğe Bağlı)
Eğer yerel PostgreSQL kurulu değilse:
```bash
docker compose up -d postgres
```

### 4. Prisma Migration ve Seed Çalıştırma
```bash
# Şemayı veritabanına uygula
npx prisma migrate dev --name init

# Frontend mock verilerini database'e aktar
npm run prisma:seed
```

### 5. Backend'i Başlatma
```bash
# Geliştirme modunda başlat (Hot-reload)
npm run start:dev

# Veya production build alıp çalıştırma
npm run build
npm run start:prod
```

### 6. Swagger API Dokümantasyonuna Erişim
Backend çalıştığında tarayıcınızdan şu adresi açın:
```text
http://localhost:3001/api/docs
```
Swagger UI üzerinden tüm endpoint'leri görebilir, test edebilir ve Solana auth ile aldığınız Bearer Token'ı sağ üstteki **Authorize** butonuna yapıştırarak korumalı endpoint'leri doğrudan çağırabilirsiniz.

---

## API Endpoint Referansı

| Modül | Metod | Endpoint | Korumalı | Açıklama |
|---|---|---|---|---|
| **Auth** | `GET` | `/api/auth/nonce/:walletAddress` | Hayır | Solana cüzdanı için nonce challenge mesajı üretir |
| **Auth** | `POST` | `/api/auth/verify` | Hayır | İmzayı doğrular, JWT access token ve kullanıcı döner |
| **Auth** | `GET` | `/api/auth/me` | **Evet** | Mevcut oturum açmış kullanıcı profilini döner |
| **Auth** | `POST` | `/api/auth/logout` | **Evet** | Oturumu sonlandırır |
| **Activities**| `GET` | `/api/activities/featured` | Hayır | Home sayfası için son 6 açık aktiviteyi getirir |
| **Activities**| `GET` | `/api/activities` | Hayır | Discover sayfası için arama, kategori, online/in-person filtreli & sayfalı liste |
| **Activities**| `GET` | `/api/activities/:id` | Hayır | Aktivite detay bilgisi (Host ve katılımcı listesi dahil) |
| **Activities**| `POST`| `/api/activities` | **Evet** | Yeni aktivite oluşturur (Oluşturan otomatik creator katılımcı olur) |
| **Activities**| `PATCH`| `/api/activities/:id` | **Evet** | Aktiviteyi günceller (Yalnızca creator) |
| **Activities**| `POST`| `/api/activities/:id/join` | **Evet** | Aktiviteye katılır (Kapasite & çakışma kontrolleriyle) |
| **Activities**| `POST`| `/api/activities/:id/leave`| **Evet** | Aktiviteden ayrılır (Host ayrılamaz, iptal etmelidir) |
| **Activities**| `POST`| `/api/activities/:id/cancel`| **Evet** | Aktiviteyi iptal eder (Katılımcılara bildirim düşer) |
| **Activities**| `POST`| `/api/activities/:id/complete`| **Evet**| Aktiviteyi tamamlandı işaretler, itibar puanı dağıtır |
| **My Activities**| `GET` | `/api/me/activities` | **Evet** | Kullanıcının oluşturduğu, katıldığı ve bitirdiği aktiviteler |
| **My Activities**| `GET` | `/api/me/activities/joined` | **Evet**| Kullanıcının katıldığı aktiviteler |
| **My Activities**| `GET` | `/api/me/activities/created`| **Evet**| Kullanıcının host ettiği aktiviteler |
| **My Activities**| `GET` | `/api/me/activities/completed`| **Evet**| Kullanıcının tamamladığı aktiviteler |
| **Users** | `GET` | `/api/users/:id` | Hayır | Herhangi bir kullanıcının dinamik istatistikli açık profili |
| **Users** | `GET` | `/api/me/profile` | **Evet** | Giriş yapmış kullanıcının profil ve detaylı metrikleri |
| **Users** | `PATCH`| `/api/me/profile` | **Evet** | Kullanıcı biyografi, kullanıcı adı veya avatar güncellemesi |
| **Notifications**| `GET`| `/api/notifications` | **Evet** | Kullanıcının bildirimleri ve okunmamış bildirim sayısı |
| **Notifications**| `PATCH`| `/api/notifications/:id/read`| **Evet**| Bildirimi okundu olarak işaretler |
| **Notifications**| `PATCH`| `/api/notifications/read-all`| **Evet**| Tüm bildirimleri okundu yapar |
| **Reputation**| `GET` | `/api/reputation/history` | **Evet** | Kullanıcının puan değişim geçmişi (Audit log) |

---

## Frontend - Backend Entegrasyon Tablosu

Frontend'deki tüm sayfalar, modal'lar ve bileşenlerin hangi backend endpoint'leri ile besleneceği:

| Frontend Sayfası / Bileşeni | Kullanıcı Aksiyonu / UI Davranışı | İlgili Backend Endpoint | Gönderilen Veri / Parametreler | Beklenen Yanıt ve UI Yansıması |
|---|---|---|---|---|
| **Navbar** (Cüzdan Bağlama) | "Connect Wallet" butonuna basılması | 1. `GET /api/auth/nonce/:walletAddress`<br>2. Cüzdanda imzalanır<br>3. `POST /api/auth/verify` | `{ walletAddress, signature }` | `{ accessToken, user }` döner. Token `localStorage`'a kaydedilir, avatar ve kullanıcı adı Navbar'da görünür. |
| **Navbar** (Bildirim Zili) | Zil ikonu ve dropdown açılması | `GET /api/notifications` | Header: `Authorization: Bearer <token>` | Okunmamış sayı kırmızı badge olarak gösterilir, dropdown içinde son bildirimler listelenir. |
| **Navbar** (Tümünü Okundu Yap) | "Mark all as read" tıklanması | `PATCH /api/notifications/read-all` | Header: `Authorization: Bearer <token>` | Okunmamış sayaç sıfırlanır, bildirimler soluklaşır. |
| **Home (`/`)** | Sayfa yüklenişi (Hero + Featured) | `GET /api/activities/featured` | Yok | En güncel açık 6 aktivite `ActivityCard` bileşenlerinde render edilir. |
| **Discover (`/discover`)** | Arama, Kategori & Online/Offline filtresi | `GET /api/activities` | `?search=...&category=...&isOnline=...&page=1` | Filtrelenen aktiviteler ve sayfalama bilgisi Activity grid'ine basılır. |
| **ActivityDetail (`/activity/:id`)** | Sayfa açılışı | `GET /api/activities/:id` | Path Param: `:id` | Aktivite bilgisi, creator kartı, katılımcı avatarları, doluluk barı, `isJoined` ve `isCreator` durumuna göre buton render edilir. |
| **ActivityDetail** | "Join Rally" butonuna basılması | `POST /api/activities/:id/join` | Header: `Authorization: Bearer <token>` | Buton "Joined" olur, katılımcı sayısı 1 artar, creator'a bildirim gider. Dolduysa statü `Full` olur. |
| **ActivityDetail** | "Leave Rally" butonuna basılması | `POST /api/activities/:id/leave` | Header: `Authorization: Bearer <token>` | Katılımcı ayrılır, buton tekrar "Join Rally" olur. Statü tekrar `Open` olur. |
| **ActivityDetail** | Host: "Cancel Activity" butonuna basılması | `POST /api/activities/:id/cancel` | Header: `Authorization: Bearer <token>` | Aktivite statüsü `Cancelled` olur, kırmızı uyarı görünür, tüm katılımcılara bildirim gönderilir. |
| **CreateActivity (`/create`)** | Formun doldurulup "Create Rally" butonuna basılması | `POST /api/activities` | Form alanları (title, category, description, location, date, time, duration, maxParticipants, requirements, isOnline) | Aktivite oluşturulur, creator ilk katılımcı olur. Kullanıcı oluşturulan aktivitenin `/activity/:id` sayfasına yönlendirilir. |
| **MyActivities (`/my-activities`)** | Sekme geçişleri: Joined / Created / Completed | `GET /api/me/activities?tab={tab}` veya `/api/me/activities/joined`, `/created`, `/completed` | Header: `Authorization: Bearer <token>` | Kullanıcının dahil olduğu aktiviteler ilgili sekmede filtrelenmiş olarak listelenir. |
| **Profile (`/profile` veya `/users/:id`)** | Profil sekmesi açılışı | Kendi profili: `GET /api/me/profile`<br>Başkası: `GET /api/users/:id` | Header veya `:id` | Username, wallet, bio, badges, itibar skoru, dinamik aktiviteler toplamı, katılım oranı, tanışılan insan sayısı ve kategori dağılımı gösterilir. |
| **Profile** | Biyografi / Kullanıcı adı düzenleme | `PATCH /api/me/profile` | `{ username, bio, avatarUrl }` | Profil anlık güncellenir. |

---

## Mock Data -> Database Dönüşüm Tablosu

Frontend'deki `src/data/mockData.ts` dosyasında yer alan statik verilerin gerçek veritabanındaki karşılıkları:

| Mock Data Alanı / Yapısı | Mock Verideki Temsili | Veritabanındaki Gerçek Karşılığı | Nasıl Üretilir / Saklanır? |
|---|---|---|---|
| `users[].id` | `'1', '2', '3'` | `User.id` (UUID örn: `usr_alex_01`) | Primary key. |
| `users[].walletAddress` | Solana public key | `User.walletAddress` (Unique) | Cüzdan imza doğrulama ile kayıt altına alınır. |
| `users[].reputation` | Sabit sayı (örn: `98`) | `User.reputation` | Başlangıçta 100 verilir, her tamamlanan veya kaçırılan etkinlikte `ReputationEvent` ile güncellenir. |
| `users[].activitiesCompleted` | Sabit sayı (örn: `14`) | **Dinamik Hesaplama** | Kullanıcının `ActivityParticipant` kayıtlarından durumu `Completed` olanların sayısı sorgulanır. |
| `users[].attendanceRate` | Sabit yüzde (örn: `96`) | **Dinamik Hesaplama** | Tamamlanan etkinliklerde `Attended / (Attended + NoShow) * 100` formülü ile hesaplanır. |
| `users[].peopleMet` | Sabit sayı (örn: `28`) | **Dinamik Hesaplama** | Kullanıcının katıldığı bitmiş etkinliklerdeki diğer tekil `userId`'lerin kümesi (`Set.size`). |
| `users[].badges` | `['Top Host', 'Early Adopter']` | `User.badges` (String[]) | Veritabanında PostgreSQL dizi tipinde saklanır. |
| `activities[].creatorId` | `'1'` | `Activity.creatorId` | Cüzdan doğrulaması ile backend tarafından JWT'den alınır; frontend'den güvenilerek alınmaz. |
| `activities[].participants` | `['1', '2', '3']` (ID listesi) | `ActivityParticipant` tablosu | Many-to-many ilişki tablosu. Endpoint yanıtında hem ID listesi `participants` hem de `participantUsers` objesi olarak dönülür. |
| `activities[].status` | `'Open', 'Full'` | `Activity.status` (Enum) | Katılımcı sayısı `maxParticipants`'a ulaşınca transaction ile otomatik `Full`, boş yer açılınca `Open` yapılır. |
| `notifications[].read` | `true / false` | `Notification.read` | Veritabanında saklanır, `PATCH /read` veya `/read-all` ile kalıcı güncellenir. |

---

## Örnek Frontend API İstemcisi (TypeScript & Axios)

Frontend projesinde `src/services/api.ts` dosyası oluşturarak backend'e nasıl bağlanabileceğinizi gösteren tam teşekküllü istemci:

```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Varsa JWT token'ı her isteğe Authorization Bearer olarak ekler
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('rally_access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: { success: true, data: ... } formatındaki data alanını çıkarır
apiClient.interceptors.response.use(
  (response) => response.data.data,
  (error) => {
    const message = error.response?.data?.message || error.message;
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

// Solana Cüzdan Girişi Fonksiyonu (Phantom / Solflare ile entegre)
export async function authenticateWithSolanaWallet(wallet: {
  publicKey: { toBase58: () => string };
  signMessage: (msg: Uint8Array) => Promise<Uint8Array>;
}) {
  const walletAddress = wallet.publicKey.toBase58();

  // 1. Adım: Backend'den Nonce Challenge İste
  const nonceRes = await apiClient.get(`/auth/nonce/${walletAddress}`);
  const { message } = nonceRes;

  // 2. Adım: Cüzdana mesajı imzalat
  const encodedMessage = new TextEncoder().encode(message);
  const signedBytes = await wallet.signMessage(encodedMessage);

  // Base58'e dönüştür (veya bs58 kütüphanesi ile)
  // bs58.encode(signedBytes)
  const bs58 = await import('bs58');
  const signatureBase58 = bs58.default.encode(signedBytes);

  // 3. Adım: İmzayı backend'e gönder ve JWT token al
  const verifyRes = await apiClient.post('/auth/verify', {
    walletAddress,
    signature: signatureBase58,
  });

  const { accessToken, user } = verifyRes;
  localStorage.setItem('rally_access_token', accessToken);
  return user;
}

// Aktivite Servisleri
export const ActivityService = {
  getFeatured: () => apiClient.get('/activities/featured'),
  getAll: (params?: { search?: string; category?: string; isOnline?: boolean; status?: string; page?: number }) =>
    apiClient.get('/activities', { params }),
  getById: (id: string) => apiClient.get(`/activities/${id}`),
  create: (data: any) => apiClient.post('/activities', data),
  join: (id: string) => apiClient.post(`/activities/${id}/join`),
  leave: (id: string) => apiClient.post(`/activities/${id}/leave`),
  cancel: (id: string) => apiClient.post(`/activities/${id}/cancel`),
};

// Profil & Bildirim Servisleri
export const UserService = {
  getMyProfile: () => apiClient.get('/me/profile'),
  updateProfile: (data: { bio?: string; username?: string; avatarUrl?: string }) => apiClient.patch('/me/profile', data),
  getUserProfile: (id: string) => apiClient.get(`/users/${id}`),
  getMyActivities: (tab?: 'joined' | 'created' | 'completed') =>
    apiClient.get('/me/activities', { params: { tab } }),
  getNotifications: () => apiClient.get('/notifications'),
  markNotificationRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),
  markAllNotificationsRead: () => apiClient.patch('/notifications/read-all'),
};
```

---

## Test Stratejisi ve Testlerin Çalıştırılması

Proje unit ve E2E test altyapısına sahiptir:

### Kapsanan Test Senaryoları
1. **Solana Wallet Auth:**
   - Cüzdan adresi ile nonce üretimi kontrolü.
   - Ed25519 ile geçerli imzanın doğrulanması ve JWT token üretimi.
   - Süresi dolmuş veya geçersiz imzaların reddedilmesi.
2. **Activity İş Kuralları:**
   - Aynı kullanıcının aynı aktiviteye ikinci kez katılamaması (`duplicate join` engeli -> 409).
   - Dolu aktiviteye katılım isteğinin reddedilmesi (`full activity join` engeli -> 409).
   - Creator'ın kendi aktivitesine participant olarak tekrar katılamaması -> 400.
   - Creator harici bir kullanıcının aktiviteyi değiştirememesi (`unauthorized update` -> 403).
   - İptal edilmiş veya tamamlanmış aktiviteye katılım engeli -> 400.

### Testleri Çalıştırma
```bash
# Birim testlerini çalıştır
npm run test

# E2E entegrasyon testlerini çalıştır
npm run test:e2e

# Test kapsamını (coverage) görüntüle
npm run test:cov
```
