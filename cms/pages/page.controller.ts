import { BaseController, type PaginationQuery } from "../../shared/http/base-controller";
import { pageUseCase } from "./page.usecase";

export interface ListPageQuery extends PaginationQuery {}

export interface CreatePageDto {
  slug: string;
  pageType: "home" | "profile" | "custom";
  title: string;
  subtitle?: string;
  summary?: string;
  heroImageUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoImageUrl?: string;
}

export interface UpdatePageDto extends Partial<CreatePageDto> {}

export interface PageVm {
  id: string;
  tenantId: string;
  slug: string;
  pageType: string;
  title: string;
  subtitle?: string | null;
  summary?: string | null;
  heroImageUrl?: string | null;
  status: string;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

class PageController extends BaseController<
  ListPageQuery,
  CreatePageDto,
  UpdatePageDto,
  PageVm
> {}

export const pageController = new PageController(pageUseCase);