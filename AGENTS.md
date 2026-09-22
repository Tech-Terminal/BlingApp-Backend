# Backend Coding Guidelines & Architectural Conventions

## 1. Services & CRUD Pattern
- **Extend `BaseService<T>`**: All domain entity services must extend `BaseService<T>` from `@libs/index` (`libs/common/src/services/base.service.ts`).
- **Eliminate Boilerplate**: Do NOT manually implement or duplicate:
  - `create(createDto)`
  - `update(id, updateDto)`
  - `remove(id)` (soft delete via `this.repository.softDelete`)
  - `removeHard(id)` (permanent delete)
  - `restore(id)` (restore soft-deleted record)
- **Pagination & Search**:
  - `BaseService.findAll(options)` delegates directly to `this.repository.paginate(pagination, findOptions)`.
  - When overriding `findAll(options?: any)` in a service, pass `{ ...options, relations, searchableFields, where }` to `super.findAll()`.
- **Finding Entities**:
  - When overriding `findOne`, always preserve `withDeleted` support so `restore` and `removeHard` function properly:
    ```typescript
    override async findOne(
      id: number | string,
      withDeleted = false,
      relations?: any,
      select?: any,
    ): Promise<Entity> {
      return super.findOne(id, withDeleted, relations ?? ['defaultRelation'], select);
    }
    ```

## 2. Controllers & Endpoints Convention
- **List / Pagination**:
  - Always use `@Query() pagination: PaginationDto`.
  - Always pass an object containing `{ pagination }` to the service:
    ```typescript
    @Get()
    @Permissions(RESOURCES.ENTITY, ACTIONS.LIST_VIEW)
    findAll(@Query() pagination: PaginationDto) {
      return this.entityService.findAll({ pagination });
    }
    ```
  - For route-specific query filters (e.g. `governorateId`), include them in the options payload:
    ```typescript
    findAll(
      @Query() pagination: PaginationDto,
      @Query('governorateId', new ParseIntPipe({ optional: true })) governorateId?: number,
    ) {
      return this.entityService.findAll({ pagination, governorateId });
    }
    ```
- **Response Messages**:
  - Add `@ResponseMessage('...')` decorators on mutation endpoints (`create`, `update`, `remove`, `removeHard`, `restore`).
- **Serialization**:
  - Add `@UseInterceptors(ClassSerializerInterceptor)` to controllers where entities have transforms or hidden fields.

## 3. DTO Conventions
- **Update DTOs**:
  - Must extend `PartialType(Create<Entity>Dto)` from `@nestjs/mapped-types`.
  - Avoid repeating field definitions between create and update DTOs.

## 4. API Documentation & Postman Collections
- **Maintain Collections**:
  - Whenever new endpoints, modules, or fields are created or modified, update `scripts/generate-postman.js` and run `npm run generate:postman`.
  - The generated Postman collections reside in `docs/`:
    - `docs/bling_admin_api.postman_collection.json`
    - `docs/bling_public_api.postman_collection.json`

