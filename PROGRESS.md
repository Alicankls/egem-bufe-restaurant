# Admin Panel — İlerleme Kaydı

Bu dosya, admin paneli implementasyonunun neresinde olduğumuzu takip eder. Oturum kesilirse buradan devam et.

**Çalışma yeri:** bu iş `master`'da değil, ayrı bir git worktree/branch'te ilerliyor:
`.claude/worktrees/admin-panel-foundation` (branch: `worktree-admin-panel-foundation`).
İş bitince bu branch `master`'a merge edilecek.

**Plan:** `docs/superpowers/plans/2026-09-08-admin-panel-foundation.md` (task-task detaylı ilerleme: `.superpowers/sdd/2026-09-08-admin-panel-foundation/progress.md` — bu dosya git-ignored, sadece bu worktree'de yaşar)
**Spec:** `docs/superpowers/specs/2026-09-08-admin-panel-design.md`
**Ekran içi metinler için ikincil kaynak:** kullanıcının onayladığı pasted prompt (başlıklar, buton metinleri, placeholder'lar — plan/spec bunları vermiyorsa oradan alınır).

## Faz Sırası (kullanıcı onayındaki numaralandırma)

1. [x] Prisma kurulumu + şema + `.env.example` — **TAMAMLANDI** (Plan Task 1)
2. [x] Seed (`prisma/seed.ts`) + admin kullanıcı — **TAMAMLANDI** (Plan Task 2). `scripts/reset-admin.ts` henüz yazılmadı — bekliyor.
3. [x] NextAuth v5 + `middleware`/`proxy.ts` + `/admin/login` + çıkış — **TAMAMLANDI** (Plan Task 3-5)
4. [x] Admin layout + sidebar + iki işletme arası geçiş (nav grupları) — **TAMAMLANDI** (Plan Task 6, 8)
5. [x] Dashboard (Restaurant + Büfe) — **TAMAMLANDI** (Plan Task 7)
6. [x] Kategoriler — **TAMAMLANDI** (Plan Task 9-10, commits b2e2a0c..9cc1669, review + 1 fix round temiz)
7. [x] Ürünler listesi + arama/filtre + hızlı aksiyonlar — **TAMAMLANDI** (Plan Task 11-12, commits b99d361..fbb0dfb). Task 12'de kullanıcının ekran spec'ine göre plan'ın orijinal tablosu genişletildi (Görsel/Kod/Durum rozeti/sayfalama), bkz. `.superpowers/sdd/.../task-12-brief-override.md`.
8. [x] Ürün ekle/düzenle + görsel yükleme — Vercel Blob — **TAMAMLANDI** (Plan Task 13, commits d43244a..bed8b1d). Kullanıcı spec'ine göre genişletildi: Durum toggle'ları (Aktif/Pasif, Tükendi, Günün Menüsü), Sıralama alanı, gerçek dropzone UI — bunlar için Task 11'in `products.ts`'i katkısal (additive) olarak genişletildi. Bkz. `.superpowers/sdd/.../task-13-brief-override.md`.
9. [x] Günün Menüsü — **TAMAMLANDI** (Plan Task 14, commits 5bee8f8..926447f, review temiz). Kullanıcı spec'ine göre genişletildi: Tükendi toggle + rozet, "Menüyü Görüntüle" dış bağlantı, tam metin eşleşmesi. Büfe açıklaması bilinçli olarak plan'ın metnini korudu (Büfe seçimi canlı sitede gösterilmiyor — bkz. ledger ruling). Bkz. `.superpowers/sdd/.../task-14-brief-override.md`.
10. [x] Ayarlar — **TAMAMLANDI** (Plan Task 15, commits 309c40a..6c8013d, review temiz). Kullanıcı spec'ine göre 6 delta uygulandı (başlık/açıklama, İşletme Adı etiketi, WhatsApp placeholder'ları, sosyal link URL doğrulaması, senkron hex+color-picker tema girişi, `revalidatePath('/', 'layout')`). TikTok ve Logo URL alanları **bilinçli olarak eklenmedi** — şema/mimari kapsamı dışında, bkz. ledger ruling. Bkz. `.superpowers/sdd/.../task-15-brief-override.md`.
11. [ ] `scripts/reset-admin.ts` + README + son doğrulama (Plan Task 16)

## Önemli notlar / kararlar

- **Prisma sürümü:** bu worktree'de v5.22.0'a sabitlenmiş (güncel Prisma 7/8'de `datasource.url` şemadan kaldırılmış, klasik `migrate dev`/`seed` akışını bozuyor). Master'da bağımsız olarak aynı soruna rastlanıp v6.19.3 seçilmişti, ama o çalışma bu worktree lehine geri alındı (bkz. aşağıdaki 2026-09-09 keşif notu) — geçerli sürüm burada v5.22.0.
- **next-auth:** `5.0.0-beta.32` kullanılıyor (Next 16 peer desteği beyan ediyor).
- **middleware.ts → proxy.ts:** Next.js 16'da `middleware.ts` deprecate olmuş, dosya `src/proxy.ts` olarak yeniden adlandırılmış (Task 3 fix round 1).
- **`DATABASE_URL` hâlâ yer tutucu** — gerçek bir Neon bağlantısı sağlanana kadar migration/seed canlı DB'ye karşı hiç çalıştırılmadı. Kod tarafı `tsc`/`lint`/`build` ile doğrulanıyor.
- **2026-09-09 keşfi:** Bu worktree, önceki bir oturumdan (session kesintiye uğramış) kalma — Task 1-9 tam SDD disipliniyle (review + ledger) tamamlanmış, Task 10 kod olarak yazılmış ama commit edilmemiş halde bulundu. Kontrolör (bu oturum) Task 10'u doğrulayıp commit etti (`bddba2d`) ve review'a gönderdi. Aynı zamanda `master` branch'inde bağımsız olarak başlatılan mükerrer bir Faz 1 (Prisma) çalışması bulunup geri alındı (`git reset --hard`) — o iş burada zaten mevcuttu.

## Sıradaki Adım

Task 16'ya geç (README güncellemesi + final doğrulama). Ayrıca kullanıcının açıkça istediği `scripts/reset-admin.ts` (şifre sıfırlama script'i — Task 16'da yoksa ayrıca eklenecek).
