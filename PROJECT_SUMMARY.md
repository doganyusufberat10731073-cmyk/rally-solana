# Rally - Solana Blockchain Entegrasyon Özeti

Bu doküman, mevcut Rally Web2 platformunun (NestJS backend + React Vite frontend) mimarisini bozmadan, Solana Devnet üzerinde çalışan bir Web3 dApp haline getirilmesi sürecinde gerçekleştirilen tüm teknik adımları ve mimari kararları özetler.

---

## 1. Mimari Tasarım & Sorumluluk Dağılımı

Sistem, Web2 performans/sorgulama avantajları ile Web3 merkeziyetsiz şeffaflığını bir araya getiren hibrit bir yapıda tasarlanmıştır:

- **On-Chain (Solana Anchor Programı):**
  - Finansal/durumsal gerçeklik kaynağı (Source of Truth).
  - Aktivite oluşturma, katılımcı kaydı, kapasite kontrolleri ve iptal/tamamlama durumları blokzincir üzerinde doğrulanır ve saklanır.
- **Off-Chain (NestJS + Prisma + PostgreSQL):**
  - İndeksleyici (Indexer), arama, filtreleme, metin içerikleri, kullanıcı profilleri ve Web2 oturum yönetimi.
  - On-chain işlemlerin tx imzalarını (`txSignature`) ve PDA adreslerini (`activityPda`, `participantPda`) saklar.
- **Frontend (React + @solana/wallet-adapter):**
  - Cüzdan (Phantom vb.) üzerinden on-chain işlemleri imzalar.
  - İşlem başarıyla blokzincire yazıldıktan sonra dönen hash ve PDA bilgilerini backend API'sine ileterek veritabanını günceller.

---

## 2. Akıllı Sözleşme (Solana Anchor) Geliştirmesi

`programs/rally/src/lib.rs` altında Anchor framework kullanılarak akıllı sözleşme inşa edildi.

- **Program ID:** `DkzLzgXKWj6yXkBYbEJEfP9ZSeQgcJjYs2e4hGueEPaW`
- **Ağ:** Solana Devnet

### Hesaplar ve PDA Mimarisi
1. **Activity Hesabı:**
   - Seed: `["activity", creator_pubkey.as_ref(), activity_id.to_le_bytes().as_ref()]`
   - Alanlar: `creator`, `activity_id`, `max_participants`, `current_participants`, `status`, `bump`
2. **Participant Hesabı:**
   - Seed: `["participant", activity_account.key().as_ref(), user_pubkey.as_ref()]`
   - Alanlar: `activity`, `user`, `joined_at`, `bump`

### Desteklenen Komutlar (Instructions)
- `create_activity`: Yeni aktivite hesabı başlatır, kapasite limitlerini belirler.
- `join_activity`: Katılımcı kaydı açar, kapasiteyi kontrol eder ve `current_participants` sayacını artırır.
- `leave_activity`: Katılımcı kaydını kapatır, lamport'ları iade eder, sayacı azaltır.
- `cancel_activity`: Yalnızca aktivite sahibi tarafından çağrılabilir, durumu iptal eder.
- `complete_activity`: Aktivite sahibi tarafından çağrılabilir, durumu tamamlandı yapar.

---

## 3. Backend Entegrasyonu (`rally-backend`)

Mevcut NestJS mimarisini koruyarak blokzincir verilerini ilişkilendirecek alanlar eklendi:

### 3.1. Prisma Şeması Güncellemesi (`prisma/schema.prisma`)
- **`Activity` Modeli:**
  - `solanaActivityId` (BigInt / String - opsiyonel)
  - `activityPda` (String - PDA adresi)
  - `txSignature` (String - İşlem imzası)
- **`ActivityParticipant` Modeli:**
  - `participantPda` (String - Katılımcı PDA adresi)
  - `joinTxSignature` (String - Katılım işlem imzası)

### 3.2. DTO ve Servis Katmanı
- `CreateActivityDto`: `solanaActivityId`, `activityPda`, `txSignature` alanları eklendi.
- `JoinActivityDto`: `participantPda`, `joinTxSignature` alanları eklendi.
- `ActivitiesService`:
  - Aktivite oluşturulurken on-chain parametrelerini veritabanına kaydetme desteği sağlandı.
  - Katılım isteğinde (`joinActivity`), katılımcının on-chain PDA ve işlem imzası kaydedilecek şekilde servis güncellendi.
- `ActivitiesController`: Katılım endpoint'i gövdeden (`@Body()`) gelen on-chain verileri kabul edecek şekilde uyarlandı.

---

## 4. Frontend Entegrasyonu (`rally`)

### 4.1. Cüzdan ve Web3 Altyapısı
- `@solana/wallet-adapter-react`, `@solana/wallet-adapter-react-ui`, `@solana/wallet-adapter-wallets` ve `@coral-xyz/anchor` entegre edildi.
- `SolanaProvider.tsx`: Uygulamayı sarmalayacak şekilde Solana Devnet RPC ve Phantom/Solflare cüzdan adaptörü eklendi.
- `App.tsx`: `SolanaProvider` ana bileşene dahil edildi.

### 4.2. On-Chain İstemci & Hook'lar
- `src/services/solana/pda.ts`:
  - Program ID tanımlandı: `DkzLzgXKWj6yXkBYbEJEfP9ZSeQgcJjYs2e4hGueEPaW`.
  - `findActivityPda` ve `findParticipantPda` fonksiyonları eklendi.
- `src/services/solana/rally.ts`: Anchor IDL ve TypeScript arayüzleri tanımlandı.
- `src/hooks/useRallyProgram.ts`: Cüzdan bağlantısına göre Anchor Provider ve Program nesnelerini yöneten custom hook yazıldı.

### 4.3. UI Entegrasyonları
- **Aktivite Oluşturma (`CreateActivity.tsx`):**
  - Form gönderilmeden önce Phantom cüzdanı üzerinden `createActivity` on-chain işlemi tetiklenir.
  - İşlem Devnet'te onaylandıktan sonra dönen `txSignature` ve `activityPda`, backend'deki `createActivity` API'sine gönderilir.
- **Aktiviteye Katılma (`ActivityDetail.tsx`):**
  - "Katıl" butonu, kullanıcının cüzdanı bağlıysa `joinActivity` on-chain işlemini çalıştırır.
  - Oluşan `participantPda` ve `txSignature` backend'e iletilerek kayıt tamamlanır.
- **API İstemcisi (`src/services/api/client.ts`):**
  - `joinActivity` fonksiyonu payload alacak şekilde güncellendi.

---

## 5. Çalıştırma ve Devam Adımları

Uygulamayı yerel ortamda test etmek için gereken adımlar:

1. **Veritabanı Migrasyonu (Backend):**
   ```bash
   cd rally-backend
   npx prisma migrate dev --name add_solana_fields
   ```
2. **Backend'i Başlatma:**
   ```bash
   cd rally-backend
   npm run start:dev
   ```
3. **Frontend'i Başlatma:**
   ```bash
   cd rally
   npm run dev
   ```
4. **Test Senaryosu:**
   - Tarayıcıda Phantom cüzdanını açın ve ağ ayarını **Solana Devnet** olarak seçin.
   - Devnet musluğundan (faucet) test SOL temin edin.
   - Frontend üzerinden cüzdanınızı bağlayın, aktivite oluşturun ve bir aktiviteye katılın.
   - Solana Explorer (Devnet) üzerinden tx imzalarını ve PDA hesaplarını doğrulayın.
