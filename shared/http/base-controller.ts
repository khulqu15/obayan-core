import { APIError } from "encore.dev/api";
import type { ActorAccess } from "../auth/types";

export interface PaginationQuery {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
}

export interface CrudUseCase<TListQuery, TCreate, TUpdate, TEntity> {
    list(query: TListQuery, actor: ActorAccess): Promise<{
        items: TEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    detail(id: string, actor: ActorAccess): Promise<TEntity | null>;
    create(payload: TCreate, actor: ActorAccess): Promise<TEntity>;
    update(id: string, payload: TUpdate, actor: ActorAccess): Promise<TEntity | null>;
    remove(id: string, actor: ActorAccess): Promise<void>;
}

export abstract class BaseController<TListQuery extends PaginationQuery, TCreate, TUpdate, TEntity> {
    constructor(protected readonly useCase: CrudUseCase<TListQuery, TCreate, TUpdate, TEntity>) {}

    async list(query: TListQuery, actor: ActorAccess) {
        return this.useCase.list(query, actor);
    }

    async detail(id: string, actor: ActorAccess) {
        const item = await this.useCase.detail(id, actor);
        if (!item) throw APIError.notFound("Data tidak ditemukan");
        return item;
    }

    async create(payload: TCreate, actor: ActorAccess) {
        return this.useCase.create(payload, actor);
    }

    async update(id: string, payload: TUpdate, actor: ActorAccess) {
        const item = await this.useCase.update(id, payload, actor);
        if (!item) throw APIError.notFound("Data tidak ditemukan");
        return item;
    }

    async remove(id: string, actor: ActorAccess) {
        await this.useCase.remove(id, actor);
        return { ok: true };
    }
}