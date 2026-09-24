export enum ACTIONS {
    LIST_VIEW = 'list_view',
    DETAILED_VIEW = 'detailed_view',
    CREATE = 'create',
    UPDATE = 'update',
    DELETE_SOFT = 'delete_soft',
    DELETE_HARD = 'delete_hard',
    RESTORE = 'restore'
}

export enum RESOURCES {
    ADMIN = 'admin',
    ROLE = 'role',
    SETTING = 'setting',
    GOVERNORATE = 'governorate',
    AREA = 'area',
    CLIENT = 'client',
    ADDRESS = 'address',
    MAID = 'maid'
}

// Optional map (used for DTOs and Database so roles can have only a few resources)
export type RolePermissions = Partial<Record<RESOURCES, ACTIONS[]>>;

export const systemPermissions: RolePermissions = {
    [RESOURCES.ADMIN]: [
        ACTIONS.LIST_VIEW,
        ACTIONS.DETAILED_VIEW,
        ACTIONS.CREATE,
        ACTIONS.UPDATE,
        ACTIONS.DELETE_SOFT,
        ACTIONS.DELETE_HARD,
        ACTIONS.RESTORE
    ],
    [RESOURCES.ROLE]: [
        ACTIONS.LIST_VIEW,
        ACTIONS.DETAILED_VIEW,
        ACTIONS.CREATE,
        ACTIONS.UPDATE,
        ACTIONS.DELETE_SOFT,
        ACTIONS.DELETE_HARD,
        ACTIONS.RESTORE
    ],
    [RESOURCES.SETTING]: [
        ACTIONS.LIST_VIEW,
        ACTIONS.UPDATE
    ],
    [RESOURCES.GOVERNORATE]: [
        ACTIONS.LIST_VIEW,
        ACTIONS.DETAILED_VIEW,
        ACTIONS.CREATE,
        ACTIONS.UPDATE,
        ACTIONS.DELETE_SOFT,
        ACTIONS.DELETE_HARD,
        ACTIONS.RESTORE
    ],
    [RESOURCES.AREA]: [
        ACTIONS.LIST_VIEW,
        ACTIONS.DETAILED_VIEW,
        ACTIONS.CREATE,
        ACTIONS.UPDATE,
        ACTIONS.DELETE_SOFT,
        ACTIONS.DELETE_HARD,
        ACTIONS.RESTORE
    ],
    [RESOURCES.CLIENT]: [
        ACTIONS.LIST_VIEW,
        ACTIONS.DETAILED_VIEW,
        ACTIONS.CREATE,
        ACTIONS.UPDATE,
        ACTIONS.DELETE_SOFT,
        ACTIONS.DELETE_HARD,
        ACTIONS.RESTORE
    ],
    [RESOURCES.ADDRESS]: [
        ACTIONS.LIST_VIEW,
        ACTIONS.DETAILED_VIEW,
        ACTIONS.CREATE,
        ACTIONS.UPDATE,
        ACTIONS.DELETE_SOFT,
        ACTIONS.DELETE_HARD,
        ACTIONS.RESTORE
    ],
    [RESOURCES.MAID]: [
        ACTIONS.LIST_VIEW,
        ACTIONS.DETAILED_VIEW,
        ACTIONS.CREATE,
        ACTIONS.UPDATE,
        ACTIONS.DELETE_SOFT,
        ACTIONS.DELETE_HARD,
        ACTIONS.RESTORE
    ]
};

export const superAdminPermissions: RolePermissions = systemPermissions;


