// cms/pages/page.usecase.ts
import { db } from "../../shared/db/client";
import { cmsPages } from "../../shared/schema/index";
import { eq, and, like, count, desc } from "drizzle-orm";
import type { CreatePageDto, ListPageQuery, PageVm, UpdatePageDto } from "./page.controller";
import { ActorAccess } from "../../shared/auth/types";

function pageToVm(row: typeof cmsPages.$inferSelect): PageVm {
    return {
        id: row.id,
        tenantId: row.tenantId,
        slug: row.slug,
        pageType: row.pageType,
        title: row.title,
        subtitle: row.subtitle,
        summary: row.summary,
        heroImageUrl: row.heroImageUrl,
        status: row.status,
        publishedAt: row.publishedAt,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };
}

export const pageUseCase = {
    async list(query: ListPageQuery, actor: ActorAccess) {
        const page = Math.max(1, query.page ?? 1);
        const limit = Math.min(100, Math.max(10, query.limit ?? 10));
        const offset = (page - 1) * limit;

        const whereClause = query.search ? and(eq(cmsPages.tenantId, actor.tenantId), like(cmsPages.title, `%${query.search}%`)) : eq(cmsPages.tenantId, actor.tenantId);

        const items = await db.select().from(cmsPages).where(whereClause).orderBy(desc(cmsPages.updatedAt)).limit(limit).offset(offset);
        const totalRow = await db.select({ total: count() }).from(cmsPages).where(whereClause);
        return {
            items: items.map(pageToVm),
            total: totalRow[0]?.total ?? 0,
            page,
            limit,
        };
    },

    async detail(id: string, actor: ActorAccess) {
        const row = await db.query.cmsPages.findFirst({
            where: and(eq(cmsPages.id, id), eq(cmsPages.tenantId, actor.tenantId)),
        });

        return row ? pageToVm(row) : null;
    },

    async create(payload: CreatePageDto, actor: ActorAccess) {
        const id = `page_${crypto.randomUUID()}`;
        const now = new Date().toISOString();

        await db.insert(cmsPages).values({
            id,
            tenantId: actor.tenantId,
            slug: payload.slug,
            pageType: payload.pageType,
            title: payload.title,
            subtitle: payload.subtitle ?? null,
            summary: payload.summary ?? null,
            heroImageUrl: payload.heroImageUrl ?? null,
            seoTitle: payload.seoTitle ?? null,
            seoDescription: payload.seoDescription ?? null,
            seoImageUrl: payload.seoImageUrl ?? null,
            status: "draft",
            publishedAt: null,
            createdAt: now,
            updatedAt: now,
        });

        const row = await db.query.cmsPages.findFirst({ where: eq(cmsPages.id, id) });
        return pageToVm(row!);
    },

    async update(id: string, payload: UpdatePageDto, actor: ActorAccess) {
        const now = new Date().toISOString();

        await db .update(cmsPages) .set({...payload, updatedAt: now}) .where(and(eq(cmsPages.id, id), eq(cmsPages.tenantId, actor.tenantId)));
        const row = await db.query.cmsPages.findFirst({ where: and(eq(cmsPages.id, id), eq(cmsPages.tenantId, actor.tenantId)) });
        return row ? pageToVm(row) : null;
    },

    async remove(id: string, actor: ActorAccess) {
        await db.delete(cmsPages).where(and(eq(cmsPages.id, id), eq(cmsPages.tenantId, actor.tenantId)));
    },
};