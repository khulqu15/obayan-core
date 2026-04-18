import { db, sqlite } from "../../shared/db/client";
import { hashSync } from "bcryptjs";
import {
  tenants,
  roles,
  users,
  userTenantRoles,
  userRouteGrants,

  tenantSettings,
  registrationSettings,

  contacts,
  socialLinks,
  navbarItems,

  cmsPages,
  cmsPageSections,
  newsPosts,
  newsHistory,

  dormBlocks,
  rooms,
  guardians,
  studentGuardians,
  students,
  teachers,

  classes,
  classMemberships,
  subjects,
  reportTerms,
  grades,
  memorizationEntries,

  attendanceSettings,
  attendanceSessions,
  attendanceRecords,

  billingPeriods,
  chargeTemplates,
  chargeRules,
  invoices,
  invoiceItems,

  userPasswordCredentials,
} from "../../shared/schema/index";

const now = new Date().toISOString();
const currentYear = new Date().getFullYear();

const DEV_PASSWORDS = {
    superadmin: "ObayanSuper@2026",
    alberrAdmin: "AlberrAdmin@2026",
    alberrMedia: "AlberrMedia@2026",
    alinayahAdmin: "AlinayahAdmin@2026",
    alinayahMedia: "AlinayahMedia@2026",
    guardianAhmad: "AhmadWali@2026",
    guardianSiti: "SitiWali@2026",
    studentZidan: "ZidanSantri@2026",
    studentHafshah: "HafshahSantri@2026",
};

function hashPassword(raw: string) {
    return hashSync(raw, 12);
}

function seedCredential(userId: string, rawPassword: string) {
    db.insert(userPasswordCredentials)
        .values({
            id: `cred_${userId}`,
            userId,
            passwordHash: hashPassword(rawPassword),
            createdAt: now,
            updatedAt: now,
        })
        .onConflictDoNothing()
        .run();
}

function seedAllCredentials() {
    seedCredential("user_superadmin_obayan", DEV_PASSWORDS.superadmin);

    seedCredential("user_alberr_admin", DEV_PASSWORDS.alberrAdmin);
    seedCredential("user_alberr_media", DEV_PASSWORDS.alberrMedia);

    seedCredential("user_alinayah_admin", DEV_PASSWORDS.alinayahAdmin);
    seedCredential("user_alinayah_media", DEV_PASSWORDS.alinayahMedia);
    seedCredential("user_alinayah_guardian_ahmad", DEV_PASSWORDS.guardianAhmad);
    seedCredential("user_alinayah_guardian_siti", DEV_PASSWORDS.guardianSiti);

    seedCredential("user_alinayah_student_zidan", DEV_PASSWORDS.studentZidan);
    seedCredential("user_alinayah_student_hafshah", DEV_PASSWORDS.studentHafshah);
}


const makeId = (...parts: string[]) =>
  parts
    .join("_")
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

const json = (value: unknown) => JSON.stringify(value);

const ROUTES = {
    basicAdmin: [
        "/app/dashboard",
        "/app/profile",
        "/app/contact",
        "/app/navbar",
        "/app/web",
        "/app/news",
        "/app/gallery",
        "/app/registration",
    ],
    basicMedia: [
        "/app/dashboard",
        "/app/news",
        "/app/gallery",
        "/app/web",
    ],
    proAdmin: [
        "/app/dashboard",
        "/app/profile",
        "/app/contact",
        "/app/navbar",
        "/app/web",
        "/app/news",
        "/app/gallery",
        "/app/registration",
        "/app/users",
        "/app/students",
        "/app/classes",
        "/app/subjects",
        "/app/grades",
        "/app/attendance",
        "/app/finance",
        "/app/reports",
    ],
    proMedia: [
        "/app/dashboard",
        "/app/news",
        "/app/gallery",
        "/app/web",
    ],
    guardian: [
        "/wali/dashboard",
        "/wali/attendance",
        "/wali/grades",
        "/wali/payments",
        "/wali/announcements",
        "/wali/profile",
    ],
    student: [
        "/santri/dashboard",
        "/santri/profile",
        "/santri/announcements",
    ],
};

function seedRoles() {
    db.insert(roles)
        .values([
        {
            key: "superadmin",
            name: "Super Admin",
            description: "Akses penuh lintas tenant",
        },
        {
            key: "admin",
            name: "Admin",
            description: "Admin operasional tenant",
        },
        {
            key: "media",
            name: "Media",
            description: "Kelola CMS, berita, galeri, dan profil",
        },
        {
            key: "guardian",
            name: "Guardian",
            description: "Akses wali santri",
        },
        {
            key: "student",
            name: "Student",
            description: "Akses santri",
        },
        ])
        .onConflictDoNothing()
        .run();
}

    function seedSuperadmin() {
    const userId = "user_superadmin_obayan";

    db.insert(users).values({
        id: userId,
        authUid: "local-superadmin-obayan",
        userType: "staff",
        displayName: "Obayan Platform Super Admin",
        email: "superadmin@obayan.id",
        phone: "081234567890",
        primaryRoleKey: "superadmin",
        notes: "Akun pengelola platform lintas tenant",
        isActive: true,
        emailVerifiedAt: now,
        passwordUpdatedAt: now,
        lastLoginAt: null,
        createdAt: now,
        updatedAt: now,
    })
    .onConflictDoNothing()
    .run();
}

function grantRoutes(tenantId: string, userId: string, routes: string[]) {
    const rows = routes.map((route) => ({
        tenantId,
        userId,
        route,
        createdAt: now,
        updatedAt: now,
    }));

    if (rows.length > 0) {
        db.insert(userRouteGrants).values(rows).onConflictDoNothing().run();
    }
}

function assignRole(tenantId: string, userId: string, roleKey: "superadmin" | "admin" | "media" | "guardian" | "student") {
    db.insert(userTenantRoles) .values({
        tenantId,
        userId,
        roleKey,
        createdAt: now,
        updatedAt: now,
    })
    .onConflictDoNothing()
    .run();
}

function seedTenantAlberrBasic() {
  const tenantId = "tenant_alberr_pandaan";

    db.insert(tenants).values({
        id: tenantId,
        code: "ALBERR",
        name: "Pondok AlBerr Pandaan",
        slug: "alberr-pandaan",
        brandName: "ALBERR",
        legalName: "Pondok Pesantren Al Berr Pandaan",
        logoUrl: "https://alberr.sch.id/assets/logo.png",
        timezone: "Asia/Jakarta",
        locale: "id-ID",
        isActive: true,
        createdAt: now,
        updatedAt: now,
    })
    .onConflictDoNothing()
    .run();

    assignRole(tenantId, "user_superadmin_obayan", "superadmin");

    db.insert(tenantSettings).values({
        tenantId,
        theme: "light",
        primaryColor: "#2563eb",
        secondaryColor: "#1d4ed8",
        locale: "id-ID",
        timezone: "Asia/Jakarta",
        dateFormat: "DD MMM YYYY",
        density: "comfortable",
        pageSize: "10",
        fontScale: "1",
        smoothAnimations: "true",
        maintenance: "false",
        emailNotifications: "true",
        emailDailyTime: "07:00",
        emailPrimary: "admin@alberr.sch.id",
        notifyOn: json(["news", "registration", "website"]),
        criticalThreshold: "normal",

        currentPlan: "basic",
        subscriptionStatus: "active",

        enabledModulesJson: json([
            "cms",
            "site",
            "news",
            "gallery",
            "registration",
        ]),

        enabledFeaturesJson: json([
            "cms.pages.read",
            "cms.pages.manage",
            "cms.sections.read",
            "cms.sections.manage",

            "site.contact.read",
            "site.contact.manage",
            "site.navbar.read",
            "site.navbar.manage",

            "cms.news.read",
            "cms.news.manage",
            "cms.news.history.read",

            "cms.gallery.read",
            "cms.gallery.manage",

            "registration.info.read",
            "registration.manage",
        ]),

        roleScopesJson: json({
            superadmin: ["*"],
            admin: [
                "cms.pages.read",
                "cms.pages.manage",
                "cms.sections.read",
                "cms.sections.manage",
                "site.contact.read",
                "site.contact.manage",
                "site.navbar.read",
                "site.navbar.manage",
                "cms.news.read",
                "cms.news.manage",
                "cms.news.history.read",
                "cms.gallery.read",
                "cms.gallery.manage",
                "registration.info.read",
                "registration.manage",
            ],
            media: [
                "cms.pages.read",
                "cms.pages.manage",
                "cms.sections.read",
                "cms.sections.manage",
                "cms.news.read",
                "cms.news.manage",
                "cms.news.history.read",
                "cms.gallery.read",
                "cms.gallery.manage",
            ],
            guardian: [],
            student: [],
        }),

        updatedAt: now,
    })
    .onConflictDoNothing()
    .run();

  db.insert(registrationSettings)
    .values({
      tenantId,
      year: currentYear,
      isClosed: false,
      autoCloseEnabled: false,
      autoCloseAt: null,
      updatedAt: now,
    })
    .onConflictDoNothing()
    .run();

  db.insert(contacts)
    .values({
      tenantId,
      address: "Jl. Pesantren No. 1, Pandaan, Pasuruan, Jawa Timur",
      email: "admin@alberr.sch.id",
      phone: "082131690186",
      waIntl: "+6282131690186",
      hoursJson: json([
        "Senin–Jumat 08.00–15.30 WIB",
        "Sabtu 08.00–12.00 WIB",
      ]),
      mapEmbedSrc:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3954.154822990777!2d112.68858257934568!3d-7.666498699999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd7d9e72d847345%3A0xb58b63681aec9b37!2sPondok%20Pesantren%20ALBERR%20(Putra)%20-%20Karangjati%20Pandaan!5e0!3m2!1sid!2sid!4v1755450928977!5m2!1sid!2sid",
      mapQuery: "Pondok Pesantren ALBERR, Pandaan, Pasuruan",
      footerBrandName: "ALBERR",
      footerBrandDesc: "© 2025 Ponpes ALBERR",
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing()
    .run();

  db.insert(socialLinks)
    .values([
      {
        id: "social_alberr_instagram",
        tenantId,
        label: "Instagram",
        icon: "mdi:instagram",
        href: "https://www.instagram.com/ponpesalberr",
        sortOrder: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "social_alberr_youtube",
        tenantId,
        label: "YouTube",
        icon: "mdi:youtube",
        href: "https://youtube.com/@alberrchannel3242",
        sortOrder: 2,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "social_alberr_tiktok",
        tenantId,
        label: "TikTok",
        icon: "iconoir:tiktok-solid",
        href: "https://www.tiktok.com/@ponpesalberr",
        sortOrder: 3,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing()
    .run();

  db.insert(navbarItems)
    .values([
      {
        id: "nav_alberr_home",
        tenantId,
        title: "Beranda",
        href: "/",
        description: "Halaman utama",
        imageUrl: null,
        groupKey: "main",
        sortOrder: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "nav_alberr_profile",
        tenantId,
        title: "Profil",
        href: "/profile",
        description: "Profil lembaga",
        imageUrl: null,
        groupKey: "main",
        sortOrder: 2,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "nav_alberr_news",
        tenantId,
        title: "Berita",
        href: "/news",
        description: "Berita dan informasi",
        imageUrl: null,
        groupKey: "main",
        sortOrder: 3,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "nav_alberr_gallery",
        tenantId,
        title: "Galeri",
        href: "/gallery",
        description: "Dokumentasi kegiatan",
        imageUrl: null,
        groupKey: "main",
        sortOrder: 4,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "nav_alberr_ppdb",
        tenantId,
        title: "PPDB/PSB",
        href: "/ppdb",
        description: "Informasi pendaftaran",
        imageUrl: null,
        groupKey: "main",
        sortOrder: 5,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing()
    .run();

  const adminId = "user_alberr_admin";
  const mediaId = "user_alberr_media";

  db.insert(users)
  .values([
    {
      id: adminId,
      authUid: "local-alberr-admin",
      userType: "staff",
      displayName: "Admin AlBerr Pandaan",
      email: "admin@alberr.sch.id",
      phone: "082131690186",
      primaryRoleKey: "admin",
      notes: "Admin paket Basic untuk website dan PPDB",
      isActive: true,
      emailVerifiedAt: now,
      passwordUpdatedAt: now,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: mediaId,
      authUid: "local-alberr-media",
      userType: "staff",
      displayName: "Tim Media AlBerr",
      email: "media@alberr.sch.id",
      phone: "081230001001",
      primaryRoleKey: "media",
      notes: "Editor berita, galeri, dan halaman profil",
      isActive: true,
      emailVerifiedAt: now,
      passwordUpdatedAt: now,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    },
  ])
  .onConflictDoNothing()
  .run();

  assignRole(tenantId, adminId, "admin");
  assignRole(tenantId, mediaId, "media");

  grantRoutes(tenantId, adminId, ROUTES.basicAdmin);
  grantRoutes(tenantId, mediaId, ROUTES.basicMedia);

  const homeId = "page_alberr_home";
  const profileId = "page_alberr_profile";

  db.insert(cmsPages)
    .values([
      {
        id: homeId,
        tenantId,
        slug: "home",
        pageType: "home",
        title: "Pondok AlBerr Pandaan",
        subtitle: "Pusat informasi lembaga, kegiatan, dan pendaftaran santri baru",
        summary: "Website resmi untuk profil, berita, galeri, dan informasi pendaftaran.",
        heroImageUrl: "https://alberr.sch.id/assets/hero-home.jpg",
        seoTitle: "Pondok AlBerr Pandaan",
        seoDescription: "Website resmi Pondok AlBerr Pandaan",
        seoImageUrl: "https://alberr.sch.id/assets/og-home.jpg",
        status: "published",
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: profileId,
        tenantId,
        slug: "profile",
        pageType: "profile",
        title: "Profil Pondok AlBerr",
        subtitle: "Mengenal visi, pembinaan, dan lingkungan pendidikan",
        summary: "Informasi profil, program, dan fasilitas pondok.",
        heroImageUrl: "https://alberr.sch.id/assets/profile-header.jpg",
        seoTitle: "Profil Pondok AlBerr Pandaan",
        seoDescription: "Visi, program, dan lingkungan pendidikan Pondok AlBerr",
        seoImageUrl: "https://alberr.sch.id/assets/og-profile.jpg",
        status: "published",
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing()
    .run();

  db.insert(cmsPageSections)
    .values([
      {
        id: "section_alberr_home_hero",
        tenantId,
        pageId: homeId,
        sectionKey: "hero",
        sectionType: "hero",
        title: "Pondok AlBerr Pandaan",
        subtitle: "Informasi resmi lembaga, kegiatan, dan pendaftaran dalam satu website",
        bodyText:
          "Paket Basic difokuskan untuk kebutuhan branding dan informasi: website profil, berita, galeri dokumentasi, serta informasi PPDB/PSB.",
        imageUrl: "https://alberr.sch.id/assets/hero-home.jpg",
        imageAlt: "Gerbang utama Pondok AlBerr",
        ctaLabel: "Lihat Informasi Pendaftaran",
        ctaUrl: "/ppdb",
        contentJson: json({
          package: {
            code: "basic",
            label: "Basic - Website Informasi",
            monthlyPrice: 350000,
            yearlyPrice: 3500000,
          },
          highlights: [
            "Website profil lembaga",
            "Manajemen berita & pengumuman",
            "Galeri dokumentasi",
            "Informasi pendaftaran (PPDB/PSB)",
          ],
        }),
        settingsJson: json({
          layout: "hero-left",
          theme: "blue",
        }),
        sortOrder: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "section_alberr_home_stats",
        tenantId,
        pageId: homeId,
        sectionKey: "stats",
        sectionType: "stats",
        title: "Informasi yang Ditampilkan",
        subtitle: "Fokus utama website Basic",
        bodyText: null,
        imageUrl: null,
        imageAlt: null,
        ctaLabel: null,
        ctaUrl: null,
        contentJson: json({
          stats: [
            { label: "Halaman Utama", value: "1" },
            { label: "Halaman Profil", value: "1" },
            { label: "Kanal Berita", value: "Aktif" },
            { label: "Kanal PPDB", value: "Aktif" },
          ],
        }),
        settingsJson: json({
          columns: 4,
        }),
        sortOrder: 2,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "section_alberr_profile_about",
        tenantId,
        pageId: profileId,
        sectionKey: "about",
        sectionType: "rich_text",
        title: "Tentang Pondok",
        subtitle: "Pembinaan yang terarah dan lingkungan belajar yang tertib",
        bodyText:
          "Pondok AlBerr Pandaan menghadirkan lingkungan pendidikan yang menekankan pembinaan adab, pembelajaran keagamaan, serta dokumentasi informasi yang tertata melalui website resmi.",
        imageUrl: "https://alberr.sch.id/assets/profile-about.jpg",
        imageAlt: "Kegiatan santri di lingkungan pondok",
        ctaLabel: null,
        ctaUrl: null,
        contentJson: json({
          points: [
            "Profil lembaga dan identitas resmi",
            "Kanal berita kegiatan pondok",
            "Galeri dokumentasi kegiatan",
            "Informasi pendaftaran yang mudah diakses",
          ],
        }),
        settingsJson: json({
          layout: "image-right",
        }),
        sortOrder: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing()
    .run();

  const newsId1 = "news_alberr_ppdb_2025";
  const newsId2 = "news_alberr_pengumuman_awal";

  db.insert(newsPosts)
    .values([
      {
        id: newsId1,
        tenantId,
        title: "Informasi Pendaftaran Santri Baru Tahun Ajaran 2025/2026",
        slug: "informasi-ppdb-2025-2026",
        excerpt:
          "Pendaftaran santri baru dibuka dengan alur administrasi yang lebih tertata melalui halaman informasi resmi pondok.",
        category: "ppdb",
        tagsJson: json(["ppdb", "psb", "informasi"]),
        coverUrl: null,
        readTimeMinutes: 4,
        contentHtml:
          "<p>Pondok AlBerr Pandaan membuka informasi pendaftaran santri baru tahun ajaran 2025/2026. Calon wali santri dapat melihat persyaratan, alur, dan informasi kontak melalui website resmi.</p>",
        contentJson: json({
          sections: [
            "Persyaratan administrasi",
            "Alur pendaftaran",
            "Kontak panitia",
          ],
        }),
        contentKind: "html",
        status: "published",
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: newsId2,
        tenantId,
        title: "Pengumuman Pembaruan Website Resmi Pondok",
        slug: "pengumuman-pembaruan-website-resmi",
        excerpt:
          "Website resmi pondok kini memusatkan informasi profil, berita, dokumentasi, dan pendaftaran dalam satu kanal.",
        category: "announcement",
        tagsJson: json(["pengumuman", "website"]),
        coverUrl: null,
        readTimeMinutes: 3,
        contentHtml:
          "<p>Website resmi pondok diperbarui untuk memudahkan akses informasi lembaga, publikasi kegiatan, serta penyampaian informasi pendaftaran kepada calon wali santri.</p>",
        contentJson: json({
          sections: ["Profil", "Berita", "Galeri", "PPDB"],
        }),
        contentKind: "html",
        status: "published",
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing()
    .run();

  db.insert(newsHistory)
    .values([
      {
        id: "news_history_alberr_1",
        tenantId,
        newsPostId: newsId1,
        action: "create",
        authorName: "Tim Media AlBerr",
        authorEmail: "media@alberr.sch.id",
        authorRole: "media",
        authorUid: "local-alberr-media",
        occurredAt: now,
        metaJson: json({
          category: "ppdb",
          slug: "informasi-ppdb-2025-2026",
        }),
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "news_history_alberr_2",
        tenantId,
        newsPostId: newsId2,
        action: "create",
        authorName: "Tim Media AlBerr",
        authorEmail: "media@alberr.sch.id",
        authorRole: "media",
        authorUid: "local-alberr-media",
        occurredAt: now,
        metaJson: json({
          category: "announcement",
          slug: "pengumuman-pembaruan-website-resmi",
        }),
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing()
    .run();
}

function seedTenantAlinayahProMappedToPremium() {
  const tenantId = "tenant_alinayah_purwosari";

  db.insert(tenants)
    .values({
      id: tenantId,
      code: "ALINAYAH",
      name: "Al-Inayah Purwosari Pasuruan",
      slug: "alinayah-purwosari-pasuruan",
      brandName: "ALINAYAH",
      legalName: "Pondok Pesantren Al-Inayah Purwosari Pasuruan",
      logoUrl: "https://alinayah.obayan.id/assets/logo.png",
      timezone: "Asia/Jakarta",
      locale: "id-ID",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing()
    .run();

  assignRole(tenantId, "user_superadmin_obayan", "superadmin");

  db.insert(tenantSettings)
  .values({
    tenantId,
    theme: "light",
    primaryColor: "#15803d",
    secondaryColor: "#166534",
    locale: "id-ID",
    timezone: "Asia/Jakarta",
    dateFormat: "DD MMM YYYY",
    density: "comfortable",
    pageSize: "10",
    fontScale: "1",
    smoothAnimations: "true",
    maintenance: "false",
    emailNotifications: "true",
    emailDailyTime: "06:30",
    emailPrimary: "admin@alinayah.id",
    notifyOn: json(["attendance", "grades", "payments", "news"]),
    criticalThreshold: "important",

    currentPlan: "premium",
    subscriptionStatus: "active",

    enabledModulesJson: json([
      "cms",
      "site",
      "news",
      "gallery",
      "registration",
      "students",
      "attendance",
      "academic",
      "finance",
      "rfid",
      "guardian_portal",
      "student_portal",
    ]),

    enabledFeaturesJson: json([
      "cms.pages.read",
      "cms.pages.manage",
      "cms.sections.read",
      "cms.sections.manage",

      "site.contact.read",
      "site.contact.manage",
      "site.navbar.read",
      "site.navbar.manage",

      "cms.news.read",
      "cms.news.manage",
      "cms.news.history.read",

      "cms.gallery.read",
      "cms.gallery.manage",

      "registration.info.read",
      "registration.manage",

      "students.read",
      "students.manage",

      "attendance.read",
      "attendance.manage",

      "academic.read",
      "academic.manage",

      "finance.read",
      "finance.manage",

      "rfid.read",
      "rfid.manage",

      "guardian.portal.read",
      "guardian.attendance.read",
      "guardian.grades.read",
      "guardian.payments.read",
      "guardian.announcements.read",

      "student.portal.read",
      "student.announcements.read",
      "student.profile.read",
    ]),

    roleScopesJson: json({
      superadmin: ["*"],
      admin: ["*"],
      media: [
        "cms.pages.read",
        "cms.pages.manage",
        "cms.sections.read",
        "cms.sections.manage",
        "site.contact.read",
        "site.contact.manage",
        "site.navbar.read",
        "site.navbar.manage",
        "cms.news.read",
        "cms.news.manage",
        "cms.news.history.read",
        "cms.gallery.read",
        "cms.gallery.manage",
      ],
      guardian: [
        "guardian.portal.read",
        "guardian.attendance.read",
        "guardian.grades.read",
        "guardian.payments.read",
        "guardian.announcements.read",
      ],
      student: [
        "student.portal.read",
        "student.announcements.read",
        "student.profile.read",
      ],
    }),

    updatedAt: now,
  })
  .onConflictDoNothing()
  .run();

  db.insert(registrationSettings)
    .values({
      tenantId,
      year: currentYear,
      isClosed: false,
      autoCloseEnabled: false,
      autoCloseAt: null,
      updatedAt: now,
    })
    .onConflictDoNothing()
    .run();

  db.insert(contacts)
    .values({
      tenantId,
      address: "Purwosari, Pasuruan, Jawa Timur",
      email: "admin@alinayah.id",
      phone: "081357000221",
      waIntl: "+6281357000221",
      hoursJson: json([
        "Senin–Jumat 08.00–16.00 WIB",
        "Sabtu 08.00–12.00 WIB",
      ]),
      mapEmbedSrc: null,
      mapQuery: "Al-Inayah Purwosari Pasuruan",
      footerBrandName: "AL-INAYAH",
      footerBrandDesc: "© 2025 Al-Inayah Purwosari Pasuruan",
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing()
    .run();

  db.insert(socialLinks)
    .values([
      {
        id: "social_alinayah_instagram",
        tenantId,
        label: "Instagram",
        icon: "mdi:instagram",
        href: "https://instagram.com/alinayah.official",
        sortOrder: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "social_alinayah_youtube",
        tenantId,
        label: "YouTube",
        icon: "mdi:youtube",
        href: "https://youtube.com/@alinayahofficial",
        sortOrder: 2,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing()
    .run();

  db.insert(navbarItems)
    .values([
      {
        id: "nav_alinayah_home",
        tenantId,
        title: "Beranda",
        href: "/",
        description: "Halaman utama",
        imageUrl: null,
        groupKey: "main",
        sortOrder: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "nav_alinayah_profile",
        tenantId,
        title: "Profil",
        href: "/profile",
        description: "Profil lembaga",
        imageUrl: null,
        groupKey: "main",
        sortOrder: 2,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "nav_alinayah_news",
        tenantId,
        title: "Berita",
        href: "/news",
        description: "Informasi dan pengumuman",
        imageUrl: null,
        groupKey: "main",
        sortOrder: 3,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "nav_alinayah_gallery",
        tenantId,
        title: "Galeri",
        href: "/gallery",
        description: "Dokumentasi kegiatan",
        imageUrl: null,
        groupKey: "main",
        sortOrder: 4,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "nav_alinayah_ppdb",
        tenantId,
        title: "PPDB",
        href: "/ppdb",
        description: "Pendaftaran santri baru",
        imageUrl: null,
        groupKey: "main",
        sortOrder: 5,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "nav_alinayah_wali",
        tenantId,
        title: "Portal Wali",
        href: "/wali",
        description: "Akses absensi, nilai, dan pembayaran",
        imageUrl: null,
        groupKey: "main",
        sortOrder: 6,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing()
    .run();

  const adminId = "user_alinayah_admin";
  const mediaId = "user_alinayah_media";
  const guardianId1 = "user_alinayah_guardian_ahmad";
  const guardianId2 = "user_alinayah_guardian_siti";
  const studentUserId1 = "user_alinayah_student_zidan";
  const studentUserId2 = "user_alinayah_student_hafshah";

  db.insert(users)
  .values([
    {
      id: adminId,
      authUid: "local-alinayah-admin",
      userType: "staff",
      displayName: "Admin Al-Inayah",
      email: "admin@alinayah.id",
      phone: "081357000221",
      primaryRoleKey: "admin",
      notes: "Admin tenant paket Pro yang dimapping ke Premium",
      isActive: true,
      emailVerifiedAt: now,
      passwordUpdatedAt: now,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: mediaId,
      authUid: "local-alinayah-media",
      userType: "staff",
      displayName: "Tim Media Al-Inayah",
      email: "media@alinayah.id",
      phone: "081357000331",
      primaryRoleKey: "media",
      notes: "Kelola publikasi, berita, dan halaman website",
      isActive: true,
      emailVerifiedAt: now,
      passwordUpdatedAt: now,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: guardianId1,
      authUid: "local-alinayah-guardian-ahmad",
      userType: "guardian",
      displayName: "Ahmad Fauzi",
      email: "ahmad.fauzi@wali.id",
      phone: "081231110221",
      primaryRoleKey: "guardian",
      notes: "Wali santri aktif",
      isActive: true,
      emailVerifiedAt: now,
      passwordUpdatedAt: now,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: guardianId2,
      authUid: "local-alinayah-guardian-siti",
      userType: "guardian",
      displayName: "Siti Rahmawati",
      email: "siti.rahmawati@wali.id",
      phone: "081231110331",
      primaryRoleKey: "guardian",
      notes: "Wali santri aktif",
      isActive: true,
      emailVerifiedAt: now,
      passwordUpdatedAt: now,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: studentUserId1,
      authUid: "local-alinayah-student-zidan",
      userType: "student",
      displayName: "Muhammad Zidan Arrafi",
      email: null,
      phone: null,
      primaryRoleKey: "student",
      notes: "Akun santri untuk akses profil dan pengumuman",
      isActive: true,
      emailVerifiedAt: null,
      passwordUpdatedAt: now,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: studentUserId2,
      authUid: "local-alinayah-student-hafshah",
      userType: "student",
      displayName: "Hafshah Nabila Putri",
      email: null,
      phone: null,
      primaryRoleKey: "student",
      notes: "Akun santri untuk akses profil dan pengumuman",
      isActive: true,
      emailVerifiedAt: null,
      passwordUpdatedAt: now,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    },
  ])
  .onConflictDoNothing()
  .run();

  assignRole(tenantId, adminId, "admin");
  assignRole(tenantId, mediaId, "media");
  assignRole(tenantId, guardianId1, "guardian");
  assignRole(tenantId, guardianId2, "guardian");
  assignRole(tenantId, studentUserId1, "student");
  assignRole(tenantId, studentUserId2, "student");

  grantRoutes(tenantId, adminId, ROUTES.proAdmin);
  grantRoutes(tenantId, mediaId, ROUTES.proMedia);
  grantRoutes(tenantId, guardianId1, ROUTES.guardian);
  grantRoutes(tenantId, guardianId2, ROUTES.guardian);
  grantRoutes(tenantId, studentUserId1, ROUTES.student);
  grantRoutes(tenantId, studentUserId2, ROUTES.student);

  const homeId = "page_alinayah_home";
  const profileId = "page_alinayah_profile";

  db.insert(cmsPages)
    .values([
      {
        id: homeId,
        tenantId,
        slug: "home",
        pageType: "home",
        title: "Al-Inayah Purwosari Pasuruan",
        subtitle: "Website informasi, sistem manajemen, dan portal wali santri",
        summary: "Paket Pro diposisikan sebagai mapping ke Premium sesuai scope fitur yang Anda minta.",
        heroImageUrl: "https://alinayah.obayan.id/assets/hero-home.jpg",
        seoTitle: "Al-Inayah Purwosari Pasuruan",
        seoDescription: "Website dan sistem manajemen Al-Inayah dengan akses wali santri",
        seoImageUrl: "https://alinayah.obayan.id/assets/og-home.jpg",
        status: "published",
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: profileId,
        tenantId,
        slug: "profile",
        pageType: "profile",
        title: "Profil Al-Inayah",
        subtitle: "Pendidikan, pembinaan, dan monitoring wali santri",
        summary: "Profil lembaga dengan dukungan sistem informasi dan portal wali.",
        heroImageUrl: "https://alinayah.obayan.id/assets/profile-header.jpg",
        seoTitle: "Profil Al-Inayah Purwosari Pasuruan",
        seoDescription: "Profil lembaga dan sistem operasional Al-Inayah",
        seoImageUrl: "https://alinayah.obayan.id/assets/og-profile.jpg",
        status: "published",
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing()
    .run();

  db.insert(cmsPageSections)
    .values([
      {
        id: "section_alinayah_home_hero",
        tenantId,
        pageId: homeId,
        sectionKey: "hero",
        sectionType: "hero",
        title: "Al-Inayah Purwosari Pasuruan",
        subtitle: "Website resmi, operasional akademik, keuangan, dan akses wali santri",
        bodyText:
          "Tenant ini dimapping ke scope Premium agar mencakup website resmi, data peserta didik, absensi, akademik, keuangan dasar, dan akses wali untuk monitoring.",
        imageUrl: "https://alinayah.obayan.id/assets/hero-home.jpg",
        imageAlt: "Suasana kegiatan santri Al-Inayah",
        ctaLabel: "Masuk Portal Wali",
        ctaUrl: "/wali",
        contentJson: json({
          package: {
            requestedLabel: "Pro",
            mappedPackage: "Premium",
            monthlyBase: 800000,
            studentFee: 5000,
          },
          highlights: [
            "Website profil lembaga",
            "Berita & pengumuman",
            "Galeri dokumentasi",
            "Informasi PPDB",
            "Manajemen data santri",
            "Absensi & akademik",
            "Keuangan dasar",
            "Akses wali santri",
          ],
        }),
        settingsJson: json({
          layout: "hero-left",
          theme: "green",
        }),
        sortOrder: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "section_alinayah_home_modules",
        tenantId,
        pageId: homeId,
        sectionKey: "modules",
        sectionType: "grid",
        title: "Modul yang Aktif",
        subtitle: "Sesuai scope paket Premium",
        bodyText: null,
        imageUrl: null,
        imageAlt: null,
        ctaLabel: null,
        ctaUrl: null,
        contentJson: json({
          items: [
            { title: "Website Profil", enabled: true },
            { title: "Berita & Pengumuman", enabled: true },
            { title: "Galeri", enabled: true },
            { title: "PPDB", enabled: true },
            { title: "Data Santri", enabled: true },
            { title: "Absensi", enabled: true },
            { title: "Akademik", enabled: true },
            { title: "Keuangan", enabled: true },
            { title: "Portal Wali", enabled: true },
          ],
        }),
        settingsJson: json({
          columns: 3,
        }),
        sortOrder: 2,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "section_alinayah_profile_overview",
        tenantId,
        pageId: profileId,
        sectionKey: "overview",
        sectionType: "rich_text",
        title: "Profil dan Operasional",
        subtitle: "Terhubung antara publikasi dan manajemen internal",
        bodyText:
          "Al-Inayah menggunakan website resmi untuk publikasi dan sistem manajemen internal untuk data santri, akademik, absensi, pembayaran, serta akses monitoring bagi wali santri.",
        imageUrl: "https://alinayah.obayan.id/assets/profile-overview.jpg",
        imageAlt: "Lingkungan pendidikan Al-Inayah",
        ctaLabel: null,
        ctaUrl: null,
        contentJson: json({
          pillars: [
            "Publikasi lembaga",
            "Operasional akademik",
            "Monitoring kehadiran",
            "Akses informasi wali",
          ],
        }),
        settingsJson: json({
          layout: "image-right",
        }),
        sortOrder: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing()
    .run();

  const newsId1 = "news_alinayah_portal_wali";
  const newsId2 = "news_alinayah_tahun_ajaran";

  db.insert(newsPosts)
    .values([
      {
        id: newsId1,
        tenantId,
        title: "Portal Wali Santri Kini Aktif Digunakan",
        slug: "portal-wali-santri-kini-aktif",
        excerpt:
          "Wali santri kini dapat memantau absensi, nilai, pembayaran, dan informasi penting melalui portal terintegrasi.",
        category: "announcement",
        tagsJson: json(["wali", "portal", "pengumuman"]),
        coverUrl: null,
        readTimeMinutes: 4,
        contentHtml:
          "<p>Portal wali santri telah diaktifkan untuk memudahkan pemantauan absensi, perkembangan akademik, informasi pembayaran, dan pengumuman penting dari lembaga.</p>",
        contentJson: json({
          features: ["attendance", "grades", "payments", "announcements"],
        }),
        contentKind: "html",
        status: "published",
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: newsId2,
        tenantId,
        title: "Persiapan Awal Tahun Ajaran dan Pembaruan Data Santri",
        slug: "persiapan-awal-tahun-ajaran-dan-pembaruan-data",
        excerpt:
          "Pembaruan data santri dan kelas dilakukan untuk mendukung absensi, akademik, dan monitoring wali santri.",
        category: "academic",
        tagsJson: json(["akademik", "kelas", "santri"]),
        coverUrl: null,
        readTimeMinutes: 5,
        contentHtml:
          "<p>Pembaruan data santri, pembagian kelas, dan penyesuaian dashboard dilakukan pada awal tahun ajaran untuk menjaga akurasi data operasional.</p>",
        contentJson: json({
          modules: ["students", "classes", "grades", "attendance"],
        }),
        contentKind: "html",
        status: "published",
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing()
    .run();

  db.insert(newsHistory)
    .values([
      {
        id: "news_history_alinayah_1",
        tenantId,
        newsPostId: newsId1,
        action: "create",
        authorName: "Tim Media Al-Inayah",
        authorEmail: "media@alinayah.id",
        authorRole: "media",
        authorUid: "local-alinayah-media",
        occurredAt: now,
        metaJson: json({
          category: "announcement",
          slug: "portal-wali-santri-kini-aktif",
        }),
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "news_history_alinayah_2",
        tenantId,
        newsPostId: newsId2,
        action: "create",
        authorName: "Admin Al-Inayah",
        authorEmail: "admin@alinayah.id",
        authorRole: "admin",
        authorUid: "local-alinayah-admin",
        occurredAt: now,
        metaJson: json({
          category: "academic",
          slug: "persiapan-awal-tahun-ajaran-dan-pembaruan-data",
        }),
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing()
    .run();

  const dormBlockIdA = "dorm_alinayah_a";
  const roomIdA1 = "room_alinayah_a1";
  const roomIdA2 = "room_alinayah_a2";

  db.insert(dormBlocks)
    .values([
      {
        id: dormBlockIdA,
        tenantId,
        code: "A",
        name: "Maskan A",
        note: "Area asrama inti",
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing()
    .run();

  db.insert(rooms)
    .values([
      {
        id: roomIdA1,
        tenantId,
        dormBlockId: dormBlockIdA,
        roomCode: "A-01",
        roomName: "Kamar A-01",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: roomIdA2,
        tenantId,
        dormBlockId: dormBlockIdA,
        roomCode: "A-02",
        roomName: "Kamar A-02",
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing()
    .run();

  const guardianEntity1 = "guardian_alinayah_ahmad";
  const guardianEntity2 = "guardian_alinayah_siti";
  const studentId1 = "student_alinayah_zidan";
  const studentId2 = "student_alinayah_hafshah";
  const teacherId1 = "teacher_alinayah_ust_rahmat";

  db.insert(guardians)
    .values([
      {
        id: guardianEntity1,
        tenantId,
        userId: guardianId1,
        fullName: "Ahmad Fauzi",
        relationLabel: "Ayah/Wali",
        phone: "081231110221",
        email: "ahmad.fauzi@wali.id",
        address: "Purwosari, Pasuruan",
        occupation: "Wiraswasta",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: guardianEntity2,
        tenantId,
        userId: guardianId2,
        fullName: "Siti Rahmawati",
        relationLabel: "Ibu/Wali",
        phone: "081231110331",
        email: "siti.rahmawati@wali.id",
        address: "Purwosari, Pasuruan",
        occupation: "Guru",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing()
    .run();

  db.insert(students)
    .values([
      {
        id: studentId1,
        tenantId,
        userId: studentUserId1,
        fullName: "Muhammad Zidan Arrafi",
        studentNo: "ALN-2025-001",
        birthText: "2012-03-14",
        gender: "L",
        generation: "2025",
        level: "SMP",
        type: "Mukim",
        status: "aktif",
        formalClassText: "Kelas VII A",
        diniyahClassText: "Tahsin 1",
        dormBlockText: "A",
        roomText: "A-01",
        dormBlockId: dormBlockIdA,
        roomId: roomIdA1,
        address: "Purwosari, Pasuruan",
        phone: null,
        occupationFamily: "Wiraswasta",
        fatherName: "Ahmad Fauzi",
        motherName: "Nur Aini",
        guardianName: "Ahmad Fauzi",
        rfidUid: "ALN-RFID-001",
        fingerprintCode: "FPR-001",
        ppdbCode: "PPDB-ALN-001",
        monthlyVisitQuota: 2,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: studentId2,
        tenantId,
        userId: studentUserId2,
        fullName: "Hafshah Nabila Putri",
        studentNo: "ALN-2025-002",
        birthText: "2012-08-09",
        gender: "P",
        generation: "2025",
        level: "SMP",
        type: "Mukim",
        status: "aktif",
        formalClassText: "Kelas VII A",
        diniyahClassText: "Tahsin 1",
        dormBlockText: "A",
        roomText: "A-02",
        dormBlockId: dormBlockIdA,
        roomId: roomIdA2,
        address: "Purwosari, Pasuruan",
        phone: null,
        occupationFamily: "Guru",
        fatherName: "Abdul Karim",
        motherName: "Siti Rahmawati",
        guardianName: "Siti Rahmawati",
        rfidUid: "ALN-RFID-002",
        fingerprintCode: "FPR-002",
        ppdbCode: "PPDB-ALN-002",
        monthlyVisitQuota: 2,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing()
    .run();

  db.insert(studentGuardians)
    .values([
      {
        tenantId,
        studentId: studentId1,
        guardianId: guardianEntity1,
        relationType: "father",
        isPrimary: "true",
        createdAt: now,
        updatedAt: now,
      },
      {
        tenantId,
        studentId: studentId2,
        guardianId: guardianEntity2,
        relationType: "mother",
        isPrimary: "true",
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing()
    .run();

  db.insert(teachers)
    .values([
      {
        id: teacherId1,
        tenantId,
        userId: null,
        fullName: "Ust. Rahmat Hidayat",
        email: "rahmat.hidayat@alinayah.id",
        phone: "081357889901",
        address: "Purwosari, Pasuruan",
        birthplace: "Pasuruan",
        nik: "3579XXXXXXXXXXXX",
        nip: null,
        nuptk: null,
        institution: "Al-Inayah",
        positionMain: "Wali Kelas",
        positionsJson: json(["Wali Kelas VII A", "Pembina Tahsin"]),
        mainSubject: "Tahsin",
        educationLevel: "S1",
        educationMajor: "Pendidikan Agama Islam",
        schoolLevel: "SMP",
        graduationYear: "2018",
        employmentStatus: "Tetap",
        educatorCertificate: "Tidak",
        ppgYear: null,
        rank: null,
        gradeGroup: null,
        isActiveTeacher: true,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing()
    .run();

  const classId = "class_alinayah_vii_a";
  const subjectIdTahsin = "subject_alinayah_tahsin";
  const subjectIdAqidah = "subject_alinayah_aqidah";
  const termId = "term_alinayah_2025_ganjil";

  db.insert(classes)
    .values([
      {
        id: classId,
        tenantId,
        code: "VII-A",
        title: "Kelas VII A",
        level: "SMP",
        category: "putra",
        roomText: "Ruang A",
        section: "A",
        color: "#16a34a",
        isArchived: false,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing()
    .run();

  db.insert(classMemberships)
    .values([
      {
        tenantId,
        classId,
        studentId: studentId1,
        addedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        tenantId,
        classId,
        studentId: studentId2,
        addedAt: now,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing()
    .run();

  db.insert(subjects)
    .values([
      {
        id: subjectIdTahsin,
        tenantId,
        code: "THS",
        name: "Tahsin",
        groupName: "Diniyah",
        level: "SMP",
        minimumScore: 75,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: subjectIdAqidah,
        tenantId,
        code: "AQD",
        name: "Aqidah Akhlak",
        groupName: "Diniyah",
        level: "SMP",
        minimumScore: 75,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing()
    .run();

  db.insert(reportTerms)
    .values([
      {
        id: termId,
        tenantId,
        termCode: "2025_GANJIL",
        title: "Semester Ganjil 2025",
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing()
    .run();

  db.insert(grades)
    .values([
      {
        id: "grade_zidan_tahsin",
        tenantId,
        termId,
        subjectId: subjectIdTahsin,
        studentId: studentId1,
        dailyScore: 84,
        taskScore: 86,
        midScore: 82,
        finalExamScore: 88,
        finalScore: 85,
        gradeLetter: "A-",
        notes: "Perkembangan tajwid baik dan stabil.",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "grade_hafshah_aqidah",
        tenantId,
        termId,
        subjectId: subjectIdAqidah,
        studentId: studentId2,
        dailyScore: 88,
        taskScore: 87,
        midScore: 85,
        finalExamScore: 90,
        finalScore: 88,
        gradeLetter: "A",
        notes: "Aktif dan rapi dalam penyelesaian tugas.",
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing()
    .run();

  db.insert(memorizationEntries)
    .values([
      {
        id: "memo_zidan_1",
        tenantId,
        studentId: studentId1,
        evaluatorName: "Ust. Rahmat Hidayat",
        type: "alquran",
        surah: "Al-Baqarah",
        juz: 1,
        halaman: 2,
        ayatFrom: 1,
        ayatTo: 10,
        score: 86,
        gradeLetter: "B+",
        status: "approved",
        note: "Makhraj cukup baik, perlu stabil di mad.",
        submittedAt: now,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing()
    .run();

  db.insert(attendanceSettings)
    .values({
      tenantId,
      lastResetAt: now,
      lastResetKey: "2025-07-01|06:00",
      resetTime: "06:00",
      resetTimesJson: json(["06:00", "18:00"]),
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing()
    .run();

  const sessionId = "attendance_session_alinayah_2025_07_01_am";

  db.insert(attendanceSessions)
    .values({
      id: sessionId,
      tenantId,
      sessionKey: "2025-07-01_06-00",
      startedAt: now,
      endedAt: now,
      resetBy: "auto",
      total: 2,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing()
    .run();

  db.insert(attendanceRecords)
    .values([
      {
        id: "attendance_zidan_1",
        tenantId,
        sessionId,
        studentId: studentId1,
        source: "rfid",
        deviceId: "GATE-A1",
        roomText: "A-01",
        dormBlockText: "A",
        nameSnapshot: "Muhammad Zidan Arrafi",
        rfidUid: "ALN-RFID-001",
        fingerprintId: null,
        fingerprintStatus: null,
        occurredAtMs: 1751338800000,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "attendance_hafshah_1",
        tenantId,
        sessionId,
        studentId: studentId2,
        source: "rfid",
        deviceId: "GATE-A1",
        roomText: "A-02",
        dormBlockText: "A",
        nameSnapshot: "Hafshah Nabila Putri",
        rfidUid: "ALN-RFID-002",
        fingerprintId: null,
        fingerprintStatus: null,
        occurredAtMs: 1751338860000,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing()
    .run();

  const billingPeriodId = "billing_alinayah_202507";
  const chargeSppId = "charge_template_alinayah_spp";
  const chargeBoardingId = "charge_template_alinayah_boarding";
  const invoiceId1 = "invoice_alinayah_zidan_202507";
  const invoiceId2 = "invoice_alinayah_hafshah_202507";

  db.insert(billingPeriods)
    .values({
      id: billingPeriodId,
      tenantId,
      termCode: "202507",
      yearMonth: "2025-07",
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing()
    .run();

  db.insert(chargeTemplates)
    .values([
      {
        id: chargeSppId,
        tenantId,
        code: "spp",
        title: "SPP Bulanan",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: chargeBoardingId,
        tenantId,
        code: "boarding",
        title: "Biaya Kepesantrenan",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing()
    .run();

  db.insert(chargeRules)
    .values([
      {
        id: "charge_rule_alinayah_spp_global",
        tenantId,
        billingPeriodId,
        chargeTemplateId: chargeSppId,
        scopeType: "global",
        dormBlockText: null,
        roomText: null,
        amount: 150000,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "charge_rule_alinayah_boarding_global",
        tenantId,
        billingPeriodId,
        chargeTemplateId: chargeBoardingId,
        scopeType: "global",
        dormBlockText: null,
        roomText: null,
        amount: 350000,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing()
    .run();

  db.insert(invoices)
    .values([
      {
        id: invoiceId1,
        tenantId,
        billingPeriodId,
        studentId: studentId1,
        status: "unpaid",
        totalAmount: 500000,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: invoiceId2,
        tenantId,
        billingPeriodId,
        studentId: studentId2,
        status: "unpaid",
        totalAmount: 500000,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing()
    .run();

  db.insert(invoiceItems)
    .values([
      {
        id: "invoice_item_zidan_spp",
        tenantId,
        invoiceId: invoiceId1,
        chargeCode: "spp",
        title: "SPP Bulanan",
        originalAmount: 150000,
        discountAmount: 0,
        finalAmount: 150000,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "invoice_item_zidan_boarding",
        tenantId,
        invoiceId: invoiceId1,
        chargeCode: "boarding",
        title: "Biaya Kepesantrenan",
        originalAmount: 350000,
        discountAmount: 0,
        finalAmount: 350000,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "invoice_item_hafshah_spp",
        tenantId,
        invoiceId: invoiceId2,
        chargeCode: "spp",
        title: "SPP Bulanan",
        originalAmount: 150000,
        discountAmount: 0,
        finalAmount: 150000,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "invoice_item_hafshah_boarding",
        tenantId,
        invoiceId: invoiceId2,
        chargeCode: "boarding",
        title: "Biaya Kepesantrenan",
        originalAmount: 350000,
        discountAmount: 0,
        finalAmount: 350000,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing()
    .run();
}

function main() {
  const tx = sqlite.transaction(() => {
    seedRoles();
    seedSuperadmin();

    seedTenantAlberrBasic();
    seedTenantAlinayahProMappedToPremium();

    seedAllCredentials();
  });

  tx();
  console.log("Seed selesai: 2 tenant aktif (ALBERR Basic, Al-Inayah Pro→Premium) + credentials.");
}

main();