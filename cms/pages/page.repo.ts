// cms/pages/page.repo.ts
import { randomUUID } from "node:crypto";
import {
  and,
  asc,
  count,
  desc,
  eq,
  like,
} from "drizzle-orm";

import { db } from "../../shared/db/client";
import {
  cmsPages,
  cmsPageSections,
} from "../../shared/schema";

export interface PageListParams {
  tenantId: string;
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface CreatePageRepoInput {
  tenantId: string;
  slug: string;
  pageType: "home" | "profile" | "custom";
  title: string;
  subtitle?: string | null;
  summary?: string | null;
  heroImageUrl?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoImageUrl?: string | null;
  status?: "draft" | "published" | "archived";
  publishedAt?: string | null;
}

export interface UpdatePageRepoInput {
  slug?: string;
  pageType?: "home" | "profile" | "custom";
  title?: string;
  subtitle?: string | null;
  summary?: string | null;
  heroImageUrl?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoImageUrl?: string | null;
  status?: "draft" | "published" | "archived";
  publishedAt?: string | null;
}

export interface ReplacePageSectionInput {
  id?: string;
  sectionKey: string;
  sectionType: string;
  title?: string | null;
  subtitle?: string | null;
  bodyText?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  contentJson?: string | null;
  settingsJson?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

function buildPageWhere(params: PageListParams) {
  const clauses = [eq(cmsPages.tenantId, params.tenantId)];

  if (params.search?.trim()) {
    clauses.push(like(cmsPages.title, `%${params.search.trim()}%`));
  }

  if (params.status?.trim()) {
    clauses.push(eq(cmsPages.status, params.status.trim()));
  }

  return clauses.length === 1 ? clauses[0] : and(...clauses);
}

function buildPageUpdateSet(input: UpdatePageRepoInput) {
  const set: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  if (input.slug !== undefined) set.slug = input.slug;
  if (input.pageType !== undefined) set.pageType = input.pageType;
  if (input.title !== undefined) set.title = input.title;
  if (input.subtitle !== undefined) set.subtitle = input.subtitle;
  if (input.summary !== undefined) set.summary = input.summary;
  if (input.heroImageUrl !== undefined) set.heroImageUrl = input.heroImageUrl;
  if (input.seoTitle !== undefined) set.seoTitle = input.seoTitle;
  if (input.seoDescription !== undefined) set.seoDescription = input.seoDescription;
  if (input.seoImageUrl !== undefined) set.seoImageUrl = input.seoImageUrl;
  if (input.status !== undefined) set.status = input.status;
  if (input.publishedAt !== undefined) set.publishedAt = input.publishedAt;

  return set;
}

export const pageRepo = {
  async list(params: PageListParams) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(10, params.limit ?? 10));
    const offset = (page - 1) * limit;

    const whereClause = buildPageWhere(params);

    const [items, totalRows] = await Promise.all([
      db
        .select()
        .from(cmsPages)
        .where(whereClause)
        .orderBy(desc(cmsPages.updatedAt))
        .limit(limit)
        .offset(offset),

      db
        .select({ total: count() })
        .from(cmsPages)
        .where(whereClause),
    ]);

    return {
      items,
      total: totalRows[0]?.total ?? 0,
      page,
      limit,
    };
  },

  async findById(tenantId: string, id: string) {
    return db.query.cmsPages.findFirst({
      where: and(
        eq(cmsPages.id, id),
        eq(cmsPages.tenantId, tenantId),
      ),
    });
  },

  async findBySlug(tenantId: string, slug: string) {
    return db.query.cmsPages.findFirst({
      where: and(
        eq(cmsPages.tenantId, tenantId),
        eq(cmsPages.slug, slug),
      ),
    });
  },

  async findByIdWithSections(tenantId: string, id: string) {
    const page = await db.query.cmsPages.findFirst({
      where: and(
        eq(cmsPages.id, id),
        eq(cmsPages.tenantId, tenantId),
      ),
    });

    if (!page) return null;

    const sections = await db
      .select()
      .from(cmsPageSections)
      .where(
        and(
          eq(cmsPageSections.tenantId, tenantId),
          eq(cmsPageSections.pageId, id),
        ),
      )
      .orderBy(asc(cmsPageSections.sortOrder), asc(cmsPageSections.createdAt));

    return {
      ...page,
      sections,
    };
  },

  async findBySlugWithSections(tenantId: string, slug: string) {
    const page = await db.query.cmsPages.findFirst({
      where: and(
        eq(cmsPages.tenantId, tenantId),
        eq(cmsPages.slug, slug),
      ),
    });

    if (!page) return null;

    const sections = await db
      .select()
      .from(cmsPageSections)
      .where(
        and(
          eq(cmsPageSections.tenantId, tenantId),
          eq(cmsPageSections.pageId, page.id),
          eq(cmsPageSections.isActive, true),
        ),
      )
      .orderBy(asc(cmsPageSections.sortOrder), asc(cmsPageSections.createdAt));

    return {
      ...page,
      sections,
    };
  },

  async create(input: CreatePageRepoInput) {
    const now = new Date().toISOString();
    const id = `page_${randomUUID()}`;

    await db.insert(cmsPages).values({
      id,
      tenantId: input.tenantId,
      slug: input.slug,
      pageType: input.pageType,
      title: input.title,
      subtitle: input.subtitle ?? null,
      summary: input.summary ?? null,
      heroImageUrl: input.heroImageUrl ?? null,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      seoImageUrl: input.seoImageUrl ?? null,
      status: input.status ?? "draft",
      publishedAt: input.publishedAt ?? null,
      createdAt: now,
      updatedAt: now,
    });

    return this.findById(input.tenantId, id);
  },

  async update(tenantId: string, id: string, input: UpdatePageRepoInput) {
    await db
      .update(cmsPages)
      .set(buildPageUpdateSet(input))
      .where(
        and(
          eq(cmsPages.id, id),
          eq(cmsPages.tenantId, tenantId),
        ),
      );

    return this.findById(tenantId, id);
  },

  async delete(tenantId: string, id: string) {
    const existing = await this.findById(tenantId, id);
    if (!existing) return false;

    await db
      .delete(cmsPages)
      .where(
        and(
          eq(cmsPages.id, id),
          eq(cmsPages.tenantId, tenantId),
        ),
      );

    return true;
  },

  async listSections(tenantId: string, pageId: string) {
    return db
      .select()
      .from(cmsPageSections)
      .where(
        and(
          eq(cmsPageSections.tenantId, tenantId),
          eq(cmsPageSections.pageId, pageId),
        ),
      )
      .orderBy(asc(cmsPageSections.sortOrder), asc(cmsPageSections.createdAt));
  },

  async replaceSections(
    tenantId: string,
    pageId: string,
    sections: ReplacePageSectionInput[],
  ) {
    const now = new Date().toISOString();

    return db.transaction(async (tx) => {
      await tx
        .delete(cmsPageSections)
        .where(
          and(
            eq(cmsPageSections.tenantId, tenantId),
            eq(cmsPageSections.pageId, pageId),
          ),
        );

      if (sections.length > 0) {
        await tx.insert(cmsPageSections).values(
          sections.map((section, index) => ({
            id: section.id ?? `section_${randomUUID()}`,
            tenantId,
            pageId,
            sectionKey: section.sectionKey,
            sectionType: section.sectionType,
            title: section.title ?? null,
            subtitle: section.subtitle ?? null,
            bodyText: section.bodyText ?? null,
            imageUrl: section.imageUrl ?? null,
            imageAlt: section.imageAlt ?? null,
            ctaLabel: section.ctaLabel ?? null,
            ctaUrl: section.ctaUrl ?? null,
            contentJson: section.contentJson ?? null,
            settingsJson: section.settingsJson ?? null,
            sortOrder: section.sortOrder ?? index + 1,
            isActive: section.isActive ?? true,
            createdAt: now,
            updatedAt: now,
          })),
        );
      }

      return tx
        .select()
        .from(cmsPageSections)
        .where(
          and(
            eq(cmsPageSections.tenantId, tenantId),
            eq(cmsPageSections.pageId, pageId),
          ),
        )
        .orderBy(asc(cmsPageSections.sortOrder), asc(cmsPageSections.createdAt));
    });
  },

  async createSection(
    tenantId: string,
    pageId: string,
    input: ReplacePageSectionInput,
  ) {
    const now = new Date().toISOString();
    const id = input.id ?? `section_${randomUUID()}`;

    await db.insert(cmsPageSections).values({
      id,
      tenantId,
      pageId,
      sectionKey: input.sectionKey,
      sectionType: input.sectionType,
      title: input.title ?? null,
      subtitle: input.subtitle ?? null,
      bodyText: input.bodyText ?? null,
      imageUrl: input.imageUrl ?? null,
      imageAlt: input.imageAlt ?? null,
      ctaLabel: input.ctaLabel ?? null,
      ctaUrl: input.ctaUrl ?? null,
      contentJson: input.contentJson ?? null,
      settingsJson: input.settingsJson ?? null,
      sortOrder: input.sortOrder ?? 0,
      isActive: input.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    });

    return db.query.cmsPageSections.findFirst({
      where: and(
        eq(cmsPageSections.id, id),
        eq(cmsPageSections.tenantId, tenantId),
      ),
    });
  },

  async updateSection(
    tenantId: string,
    sectionId: string,
    input: Partial<ReplacePageSectionInput>,
  ) {
    const now = new Date().toISOString();

    const set: Record<string, unknown> = {
      updatedAt: now,
    };

    if (input.sectionKey !== undefined) set.sectionKey = input.sectionKey;
    if (input.sectionType !== undefined) set.sectionType = input.sectionType;
    if (input.title !== undefined) set.title = input.title;
    if (input.subtitle !== undefined) set.subtitle = input.subtitle;
    if (input.bodyText !== undefined) set.bodyText = input.bodyText;
    if (input.imageUrl !== undefined) set.imageUrl = input.imageUrl;
    if (input.imageAlt !== undefined) set.imageAlt = input.imageAlt;
    if (input.ctaLabel !== undefined) set.ctaLabel = input.ctaLabel;
    if (input.ctaUrl !== undefined) set.ctaUrl = input.ctaUrl;
    if (input.contentJson !== undefined) set.contentJson = input.contentJson;
    if (input.settingsJson !== undefined) set.settingsJson = input.settingsJson;
    if (input.sortOrder !== undefined) set.sortOrder = input.sortOrder;
    if (input.isActive !== undefined) set.isActive = input.isActive;

    await db
      .update(cmsPageSections)
      .set(set)
      .where(
        and(
          eq(cmsPageSections.id, sectionId),
          eq(cmsPageSections.tenantId, tenantId),
        ),
      );

    return db.query.cmsPageSections.findFirst({
      where: and(
        eq(cmsPageSections.id, sectionId),
        eq(cmsPageSections.tenantId, tenantId),
      ),
    });
  },

  async deleteSection(tenantId: string, sectionId: string) {
    const existing = await db.query.cmsPageSections.findFirst({
      where: and(
        eq(cmsPageSections.id, sectionId),
        eq(cmsPageSections.tenantId, tenantId),
      ),
    });

    if (!existing) return false;

    await db
      .delete(cmsPageSections)
      .where(
        and(
          eq(cmsPageSections.id, sectionId),
          eq(cmsPageSections.tenantId, tenantId),
        ),
      );

    return true;
  },
};