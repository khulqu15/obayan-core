export type PlanKey =
    | "basic"
    | "standard"
    | "advanced"
    | "premium"
    | "full_access";

export type FeatureKey =
    | "cms.pages.read"
    | "cms.pages.manage"
    | "cms.news.read"
    | "cms.news.manage"
    | "cms.gallery.read"
    | "cms.gallery.manage"
    | "registration.info.read"
    | "registration.manage"
    | "students.read"
    | "students.manage"
    | "attendance.read"
    | "attendance.manage"
    | "academic.read"
    | "academic.manage"
    | "finance.read"
    | "finance.manage"
    | "rfid.read"
    | "rfid.manage"
    | "guardian.portal.read"
    | "guardian.attendance.read"
    | "guardian.grades.read"
    | "guardian.payments.read"
    | "guardian.announcements.read";

export const PLAN_FEATURES: Record<PlanKey, FeatureKey[]> = {
    basic: [
        "cms.pages.read",
        "cms.pages.manage",
        "cms.news.read",
        "cms.news.manage",
        "cms.gallery.read",
        "cms.gallery.manage",
        "registration.info.read",
        "registration.manage",
    ],
    standard: [
        "cms.pages.read",
        "cms.pages.manage",
        "cms.news.read",
        "cms.news.manage",
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
    ],
    advanced: [
        "cms.pages.read",
        "cms.pages.manage",
        "cms.news.read",
        "cms.news.manage",
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
    ],
    premium: [
        "cms.pages.read",
        "cms.pages.manage",
        "cms.news.read",
        "cms.news.manage",
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
    ],
    full_access: [
        "cms.pages.read",
        "cms.pages.manage",
        "cms.news.read",
        "cms.news.manage",
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
    ],
};

export const TENANT_PLAN_MAP: Record<string, PlanKey> = {
    "alberr-pandaan": "basic",
    "alinayah-purwosari-pasuruan": "premium",
};