import { api } from "encore.dev/api";
import { getRequestAccess } from "../../shared/middleware/access-middleware";
import {
    assertRole,
    assertModule,
    assertScopedFeature,
} from "../../shared/auth/access";
import {
    pageController,
    type CreatePageDto,
    type UpdatePageDto,
    type ListPageQuery,
} from "./page.controller";

export const getPageBySlug = api(
    { expose: true, method: "GET", path: "/cms/pages/:slug" },
    async ({ slug }: { slug: string }) => {
        return { slug };
    },
);

export const listPages = api(
    { expose: true, auth: true, method: "GET", path: "/admin/cms/pages" },
    async (query: ListPageQuery) => {
        const access = getRequestAccess();
        assertRole(access, "superadmin", "admin", "media");
        assertModule(access, "cms");
        assertScopedFeature(access, "cms.pages.read");

        return pageController.list(query, access);
    },
);

export const getPageDetail = api(
    { expose: true, auth: true, method: "GET", path: "/admin/cms/pages/:id" },
    async ({ id }: { id: string }) => {
        const access = getRequestAccess();
        assertRole(access, "superadmin", "admin", "media");
        assertModule(access, "cms");
        assertScopedFeature(access, "cms.pages.read");

        return pageController.detail(id, access);
    },
);

export const createPage = api(
    { expose: true, auth: true, method: "POST", path: "/admin/cms/pages" },
    async (body: CreatePageDto) => {
        const access = getRequestAccess();
        assertRole(access, "superadmin", "admin", "media");
        assertModule(access, "cms");
        assertScopedFeature(access, "cms.pages.manage");

        return pageController.create(body, access);
    },
);

export const updatePage = api(
    { expose: true, auth: true, method: "PUT", path: "/admin/cms/pages/:id" },
    async ({ id, ...body }: { id: string } & UpdatePageDto) => {
        const access = getRequestAccess();
        assertRole(access, "superadmin", "admin", "media");
        assertModule(access, "cms");
        assertScopedFeature(access, "cms.pages.manage");

        return pageController.update(id, body, access);
    },
);

export const deletePage = api(
    { expose: true, auth: true, method: "DELETE", path: "/admin/cms/pages/:id" },
    async ({ id }: { id: string }) => {
        const access = getRequestAccess();
        assertRole(access, "superadmin", "admin");
        assertModule(access, "cms");
        assertScopedFeature(access, "cms.pages.manage");

        return pageController.remove(id, access);
    },
);