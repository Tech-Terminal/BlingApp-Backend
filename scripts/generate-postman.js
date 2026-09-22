const fs = require('fs');
const path = require('path');

function createFolder(name, items) {
  return {
    name,
    item: items,
  };
}

function createRequest(
  baseUrlVar,
  name,
  method,
  url,
  body = null,
  authType = 'inherit',
  script = [],
  queryParams = []
) {
  const variables = [];
  const processedUrl = url.replace(/:([a-zA-Z0-9_]+)/g, (match, paramName) => {
    variables.push({
      key: paramName,
      value: '1',
    });
    return `{{${paramName}}}`;
  });

  const query = queryParams.map((q) => ({
    key: q.key,
    value: q.value,
    description: q.description || '',
    disabled: q.disabled || false,
  }));

  const request = {
    method,
    header: [
      { key: 'Accept', value: 'application/json' },
      { key: 'Accept-Language', value: 'ar' },
    ],
    url: {
      raw: `{{${baseUrlVar}}}/${processedUrl}`,
      host: [`{{${baseUrlVar}}}`],
      path: processedUrl.split('/'),
      variable: variables,
      query: query.length > 0 ? query : undefined,
    },
  };

  if (body) {
    request.header.push({ key: 'Content-Type', value: 'application/json' });
    request.body = {
      mode: 'raw',
      raw: JSON.stringify(body, null, 2),
      options: {
        raw: {
          language: 'json',
        },
      },
    };
  }

  if (authType === 'bearer') {
    const tokenVar = baseUrlVar === 'adminBaseUrl' ? '{{admin_access_token}}' : '{{client_access_token}}';
    request.auth = {
      type: 'bearer',
      bearer: [{ key: 'token', value: tokenVar, type: 'string' }],
    };
  } else if (authType === 'none') {
    request.auth = { type: 'noauth' };
  }

  const item = {
    name,
    request,
    response: [],
  };

  if (script && script.length > 0) {
    item.event = [
      {
        listen: 'test',
        script: {
          exec: script,
          type: 'text/javascript',
        },
      },
    ];
  }

  return item;
}

// ==========================================
// 1. ADMIN API COLLECTION
// ==========================================
const adminAuth = [
  createRequest(
    'adminBaseUrl',
    'Sign In',
    'POST',
    'auth/sign-in',
    {
      email: 'superadmin@example.com',
      password: 'SuperSecurePassword123!',
    },
    'none',
    [
      'const response = pm.response.json();',
      'const data = response.data || response;',
      'if (data.accessToken) {',
      "    pm.collectionVariables.set('admin_access_token', data.accessToken);",
      "    pm.globals.set('admin_access_token', data.accessToken);",
      '}',
      'if (data.refreshToken) {',
      "    pm.collectionVariables.set('admin_refresh_token', data.refreshToken);",
      "    pm.globals.set('admin_refresh_token', data.refreshToken);",
      '}',
    ]
  ),
  createRequest(
    'adminBaseUrl',
    'Refresh Token',
    'POST',
    'auth/refresh',
    {
      refreshToken: '{{admin_refresh_token}}',
    },
    'none',
    [
      'const response = pm.response.json();',
      'const data = response.data || response;',
      'if (data.accessToken) {',
      "    pm.collectionVariables.set('admin_access_token', data.accessToken);",
      "    pm.globals.set('admin_access_token', data.accessToken);",
      '}',
      'if (data.refreshToken) {',
      "    pm.collectionVariables.set('admin_refresh_token', data.refreshToken);",
      "    pm.globals.set('admin_refresh_token', data.refreshToken);",
      '}',
    ]
  ),
  createRequest(
    'adminBaseUrl',
    'Sign Out',
    'POST',
    'auth/sign-out',
    {
      refreshToken: '{{admin_refresh_token}}',
    },
    'bearer',
    [
      "pm.collectionVariables.unset('admin_access_token');",
      "pm.collectionVariables.unset('admin_refresh_token');",
      "pm.globals.unset('admin_access_token');",
      "pm.globals.unset('admin_refresh_token');",
    ]
  ),
  createRequest(
    'adminBaseUrl',
    'Forgot Password',
    'POST',
    'auth/forgot-password',
    {
      email: 'superadmin@example.com',
    },
    'none'
  ),
  createRequest(
    'adminBaseUrl',
    'Verify Password Reset OTP',
    'POST',
    'auth/verify-otp',
    {
      email: 'superadmin@example.com',
      otp: '123456',
    },
    'none'
  ),
  createRequest(
    'adminBaseUrl',
    'Reset Password',
    'POST',
    'auth/reset-password',
    {
      email: 'superadmin@example.com',
      otp: '123456',
      newPassword: 'NewSecurePassword123!',
    },
    'none'
  ),
];

const adminProfile = [
  createRequest('adminBaseUrl', 'Get Profile', 'GET', 'admins/me', null, 'bearer'),
  createRequest(
    'adminBaseUrl',
    'Update Profile',
    'PATCH',
    'admins/me',
    {
      name: 'Super Admin',
      phone: '+96590000000',
      image: 'https://example.com/avatar.jpg',
    },
    'bearer'
  ),
  createRequest(
    'adminBaseUrl',
    'Change Password',
    'PATCH',
    'admins/me/password',
    {
      oldPassword: 'SuperSecurePassword123!',
      newPassword: 'NewPassword123!',
    },
    'bearer'
  ),
  createRequest(
    'adminBaseUrl',
    'Request Email Change',
    'POST',
    'admins/me/email/request',
    {
      newEmail: 'newadmin@example.com',
    },
    'bearer'
  ),
  createRequest(
    'adminBaseUrl',
    'Verify Email Change',
    'PATCH',
    'admins/me/email/verify',
    {
      otp: '123456',
    },
    'bearer'
  ),
];

const adminsManagement = [
  createRequest(
    'adminBaseUrl',
    'List Admins',
    'GET',
    'admins',
    null,
    'bearer',
    [],
    [
      { key: 'page', value: '1' },
      { key: 'limit', value: '10' },
      { key: 'search', value: '', disabled: true },
    ]
  ),
  createRequest(
    'adminBaseUrl',
    'Create Admin',
    'POST',
    'admins',
    {
      name: 'Operations Manager',
      email: 'ops@example.com',
      phone: '+96591111111',
      roleId: 2,
      isActive: true,
    },
    'bearer'
  ),
  createRequest('adminBaseUrl', 'Show Admin', 'GET', 'admins/:id', null, 'bearer'),
  createRequest(
    'adminBaseUrl',
    'Update Admin',
    'PATCH',
    'admins/:id',
    {
      name: 'Operations Manager Updated',
      roleId: 2,
      isActive: true,
    },
    'bearer'
  ),
  createRequest('adminBaseUrl', 'Soft Delete Admin', 'DELETE', 'admins/:id', null, 'bearer'),
  createRequest(
    'adminBaseUrl',
    'Hard Delete Admin',
    'DELETE',
    'admins/:id/hard-delete',
    null,
    'bearer'
  ),
  createRequest('adminBaseUrl', 'Restore Admin', 'POST', 'admins/restore/:id', null, 'bearer'),
];

const rolesManagement = [
  createRequest(
    'adminBaseUrl',
    'List Roles',
    'GET',
    'roles',
    null,
    'bearer',
    [],
    [
      { key: 'page', value: '1' },
      { key: 'limit', value: '10' },
      { key: 'search', value: '', disabled: true },
    ]
  ),
  createRequest('adminBaseUrl', 'Get System Permissions', 'GET', 'roles/permissions', null, 'bearer'),
  createRequest(
    'adminBaseUrl',
    'Create Role',
    'POST',
    'roles',
    {
      name: 'Branch Supervisor',
      permissions: {
        admin: ['list_view', 'detailed_view'],
        role: ['list_view', 'detailed_view'],
        governorate: ['list_view', 'detailed_view'],
        area: ['list_view', 'detailed_view'],
        setting: ['list_view'],
      },
    },
    'bearer'
  ),
  createRequest('adminBaseUrl', 'Show Role', 'GET', 'roles/:id', null, 'bearer'),
  createRequest(
    'adminBaseUrl',
    'Update Role',
    'PATCH',
    'roles/:id',
    {
      name: 'Branch Supervisor (Full)',
      permissions: {
        admin: ['list_view', 'detailed_view', 'create', 'update'],
      },
    },
    'bearer'
  ),
  createRequest('adminBaseUrl', 'Soft Delete Role', 'DELETE', 'roles/:id', null, 'bearer'),
  createRequest(
    'adminBaseUrl',
    'Hard Delete Role',
    'DELETE',
    'roles/:id/hard-delete',
    null,
    'bearer'
  ),
  createRequest('adminBaseUrl', 'Restore Role', 'POST', 'roles/restore/:id', null, 'bearer'),
];

const governoratesManagement = [
  createRequest(
    'adminBaseUrl',
    'List Governorates',
    'GET',
    'governorates',
    null,
    'bearer',
    [],
    [
      { key: 'page', value: '1' },
      { key: 'limit', value: '10' },
      { key: 'search', value: '', disabled: true },
    ]
  ),
  createRequest(
    'adminBaseUrl',
    'Create Governorate',
    'POST',
    'governorates',
    {
      nameAr: 'العاصمة',
      nameEn: 'Capital',
    },
    'bearer'
  ),
  createRequest('adminBaseUrl', 'Show Governorate', 'GET', 'governorates/:id', null, 'bearer'),
  createRequest(
    'adminBaseUrl',
    'Update Governorate',
    'PATCH',
    'governorates/:id',
    {
      nameAr: 'محافظة العاصمة',
      nameEn: 'Capital Governorate',
    },
    'bearer'
  ),
  createRequest('adminBaseUrl', 'Soft Delete Governorate', 'DELETE', 'governorates/:id', null, 'bearer'),
  createRequest(
    'adminBaseUrl',
    'Hard Delete Governorate',
    'DELETE',
    'governorates/:id/hard-delete',
    null,
    'bearer'
  ),
  createRequest('adminBaseUrl', 'Restore Governorate', 'POST', 'governorates/restore/:id', null, 'bearer'),
];

const areasManagement = [
  createRequest(
    'adminBaseUrl',
    'List Areas',
    'GET',
    'areas',
    null,
    'bearer',
    [],
    [
      { key: 'page', value: '1' },
      { key: 'limit', value: '20' },
      { key: 'search', value: '', disabled: true },
      { key: 'governorateId', value: '1', disabled: true },
    ]
  ),
  createRequest(
    'adminBaseUrl',
    'Create Area',
    'POST',
    'areas',
    {
      governorateId: 1,
      nameAr: 'دسمان',
      nameEn: 'Dasman',
    },
    'bearer'
  ),
  createRequest('adminBaseUrl', 'Show Area', 'GET', 'areas/:id', null, 'bearer'),
  createRequest(
    'adminBaseUrl',
    'Update Area',
    'PATCH',
    'areas/:id',
    {
      governorateId: 1,
      nameAr: 'منطقة دسمان',
      nameEn: 'Dasman Area',
    },
    'bearer'
  ),
  createRequest('adminBaseUrl', 'Soft Delete Area', 'DELETE', 'areas/:id', null, 'bearer'),
  createRequest(
    'adminBaseUrl',
    'Hard Delete Area',
    'DELETE',
    'areas/:id/hard-delete',
    null,
    'bearer'
  ),
  createRequest('adminBaseUrl', 'Restore Area', 'POST', 'areas/restore/:id', null, 'bearer'),
];

const settingsManagement = [
  createRequest('adminBaseUrl', 'List Settings', 'GET', 'settings', null, 'bearer'),
  createRequest(
    'adminBaseUrl',
    'Update Settings',
    'PATCH',
    'settings',
    {
      settings: [
        { key: 'facebook_url', value: 'https://facebook.com/bling' },
        { key: 'instagram_url', value: 'https://instagram.com/bling' },
        { key: 'contact_email', value: 'support@bling.com' },
        { key: 'contact_phone', value: '+96590000000' },
      ],
    },
    'bearer'
  ),
];

const statisticsManagement = [
  createRequest('adminBaseUrl', 'Get Admin Statistics', 'GET', 'statistics', null, 'bearer'),
];

const storageManagement = [
  createRequest(
    'adminBaseUrl',
    'Generate Presigned Upload URL',
    'POST',
    'storage/presigned-url',
    {
      fileName: 'banner.jpg',
      contentType: 'image/jpeg',
    },
    'bearer'
  ),
];

const clientsManagement = [
  createRequest(
    'adminBaseUrl',
    'List Clients',
    'GET',
    'clients',
    null,
    'bearer',
    [],
    [
      { key: 'page', value: '1' },
      { key: 'limit', value: '10' },
      { key: 'search', value: '', disabled: true },
    ]
  ),
  createRequest('adminBaseUrl', 'Show Client', 'GET', 'clients/:id', null, 'bearer'),
  createRequest('adminBaseUrl', 'Show Client Addresses', 'GET', 'clients/:id/addresses', null, 'bearer'),
  createRequest(
    'adminBaseUrl',
    'Update Client',
    'PATCH',
    'clients/:id',
    {
      name: 'Ahmed Hassan',
      isActive: true,
    },
    'bearer'
  ),
  createRequest('adminBaseUrl', 'Soft Delete Client', 'DELETE', 'clients/:id', null, 'bearer'),
  createRequest(
    'adminBaseUrl',
    'Hard Delete Client',
    'DELETE',
    'clients/:id/hard-delete',
    null,
    'bearer'
  ),
  createRequest('adminBaseUrl', 'Restore Client', 'POST', 'clients/restore/:id', null, 'bearer'),
];

const addressesManagement = [
  createRequest(
    'adminBaseUrl',
    'List Addresses',
    'GET',
    'addresses',
    null,
    'bearer',
    [],
    [
      { key: 'page', value: '1' },
      { key: 'limit', value: '10' },
      { key: 'search', value: '', disabled: true },
    ]
  ),
  createRequest('adminBaseUrl', 'Show Address', 'GET', 'addresses/:id', null, 'bearer'),
  createRequest(
    'adminBaseUrl',
    'Create Address',
    'POST',
    'addresses',
    {
      clientId: 1,
      label: 'Home',
      lat: 29.3759,
      long: 47.9774,
      governorateId: 1,
      areaId: 1,
      street: 'Salem Al-Mubarak St',
      block: '4',
      houseNumber: '12',
      additionalDetails: 'Floor 2, Apt 5',
      isDefault: true,
    },
    'bearer'
  ),
  createRequest(
    'adminBaseUrl',
    'Update Address',
    'PATCH',
    'addresses/:id',
    {
      label: 'Office',
      street: 'Ahmed Al Jaber St',
      block: '2',
      houseNumber: '5A',
    },
    'bearer'
  ),
  createRequest('adminBaseUrl', 'Soft Delete Address', 'DELETE', 'addresses/:id', null, 'bearer'),
  createRequest(
    'adminBaseUrl',
    'Hard Delete Address',
    'DELETE',
    'addresses/:id/hard-delete',
    null,
    'bearer'
  ),
  createRequest('adminBaseUrl', 'Restore Address', 'POST', 'addresses/restore/:id', null, 'bearer'),
];

const adminCollection = {
  info: {
    name: 'Bling Admin API',
    description: 'Complete Postman Collection for Bling Admin API management endpoints',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  variable: [
    { key: 'adminBaseUrl', value: 'http://localhost:4000/api', type: 'string' },
    { key: 'adminBaseUrlProd', value: 'https://admin-api.bling.com/api', type: 'string' },
    { key: 'admin_access_token', value: '', type: 'string' },
    { key: 'admin_refresh_token', value: '', type: 'string' },
  ],
  item: [
    createFolder('01. Authentication', adminAuth),
    createFolder('02. My Profile', adminProfile),
    createFolder('03. Admins Management', adminsManagement),
    createFolder('04. Roles Management', rolesManagement),
    createFolder('05. Governorates Management', governoratesManagement),
    createFolder('06. Areas Management', areasManagement),
    createFolder('07. Settings Management', settingsManagement),
    createFolder('08. Statistics', statisticsManagement),
    createFolder('09. Storage', storageManagement),
    createFolder('10. Clients Management', clientsManagement),
    createFolder('11. Addresses Management', addressesManagement),
  ],
};

// ==========================================
// 2. PUBLIC CONSUMER API COLLECTION
// ==========================================
const publicAuth = [
  createRequest(
    'publicBaseUrl',
    'Register Client (Send OTP)',
    'POST',
    'auth/register',
    {
      phone: '+201007949946',
      name: 'Ahmad Gamal',
    },
    'none'
  ),
  createRequest(
    'publicBaseUrl',
    'Verify Register OTP',
    'POST',
    'auth/verify-register-otp',
    {
      phone: '+201007949946',
      otp: '123456',
    },
    'none',
    [
      'const response = pm.response.json();',
      'const data = response.data || response;',
      'if (data.accessToken) {',
      "    pm.collectionVariables.set('client_access_token', data.accessToken);",
      "    pm.globals.set('client_access_token', data.accessToken);",
      '}',
      'if (data.refreshToken) {',
      "    pm.collectionVariables.set('client_refresh_token', data.refreshToken);",
      "    pm.globals.set('client_refresh_token', data.refreshToken);",
      '}',
    ]
  ),
  createRequest(
    'publicBaseUrl',
    'Sign In (Send OTP)',
    'POST',
    'auth/sign-in',
    {
      phone: '+201007949946',
    },
    'none'
  ),
  createRequest(
    'publicBaseUrl',
    'Verify Login OTP',
    'POST',
    'auth/verify-login-otp',
    {
      phone: '+201007949946',
      otp: '123456',
    },
    'none',
    [
      'const response = pm.response.json();',
      'const data = response.data || response;',
      'if (data.accessToken) {',
      "    pm.collectionVariables.set('client_access_token', data.accessToken);",
      "    pm.globals.set('client_access_token', data.accessToken);",
      '}',
      'if (data.refreshToken) {',
      "    pm.collectionVariables.set('client_refresh_token', data.refreshToken);",
      "    pm.globals.set('client_refresh_token', data.refreshToken);",
      '}',
    ]
  ),
  createRequest(
    'publicBaseUrl',
    'Resend OTP',
    'POST',
    'auth/resend-otp',
    {
      phone: '+201007949946',
    },
    'none'
  ),
  createRequest(
    'publicBaseUrl',
    'Refresh Token',
    'POST',
    'auth/refresh',
    {
      refreshToken: '{{client_refresh_token}}',
    },
    'none',
    [
      'const response = pm.response.json();',
      'const data = response.data || response;',
      'if (data.accessToken) {',
      "    pm.collectionVariables.set('client_access_token', data.accessToken);",
      "    pm.globals.set('client_access_token', data.accessToken);",
      '}',
      'if (data.refreshToken) {',
      "    pm.collectionVariables.set('client_refresh_token', data.refreshToken);",
      "    pm.globals.set('client_refresh_token', data.refreshToken);",
      '}',
    ]
  ),
  createRequest(
    'publicBaseUrl',
    'Sign Out',
    'POST',
    'auth/sign-out',
    {
      refreshToken: '{{client_refresh_token}}',
    },
    'bearer',
    [
      "pm.collectionVariables.unset('client_access_token');",
      "pm.collectionVariables.unset('client_refresh_token');",
      "pm.globals.unset('client_access_token');",
      "pm.globals.unset('client_refresh_token');",
    ]
  ),
  createRequest('publicBaseUrl', 'Get Profile', 'GET', 'auth/me', null, 'bearer'),
];

const publicLocations = [
  createRequest('publicBaseUrl', 'Get Governorates', 'GET', 'locations/governorates', null, 'none'),
  createRequest(
    'publicBaseUrl',
    'Get Areas',
    'GET',
    'locations/areas',
    null,
    'none',
    [],
    [{ key: 'governorateId', value: '1', disabled: false }]
  ),
];

const publicAddresses = [
  createRequest(
    'publicBaseUrl',
    'Create Address',
    'POST',
    'addresses',
    {
      label: 'المنزل',
      lat: 29.3759,
      long: 47.9774,
      governorateId: 1,
      areaId: 1,
      street: 'شارع الخليج العربي',
      block: '3',
      houseNumber: '12',
      additionalDetails: 'بجانب المسجد، مدخل 2',
      isDefault: true,
    },
    'bearer'
  ),
  createRequest(
    'publicBaseUrl',
    'List Client Addresses',
    'GET',
    'addresses',
    null,
    'bearer',
    [],
    [
      { key: 'page', value: '1' },
      { key: 'limit', value: '10' },
    ]
  ),
  createRequest('publicBaseUrl', 'Get Address Details', 'GET', 'addresses/:id', null, 'bearer'),
  createRequest(
    'publicBaseUrl',
    'Update Address',
    'PATCH',
    'addresses/:id',
    {
      label: 'العمل',
      street: 'شارع فهد السالم',
      houseNumber: '4B',
    },
    'bearer'
  ),
  createRequest('publicBaseUrl', 'Delete Address', 'DELETE', 'addresses/:id', null, 'bearer'),
  createRequest(
    'publicBaseUrl',
    'Set Address as Default',
    'PATCH',
    'addresses/:id/default',
    null,
    'bearer'
  ),
];

const publicCollection = {
  info: {
    name: 'Bling Public API',
    description: 'Postman Collection for Bling Public Consumer API (Auth, Locations, Client Addresses)',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  variable: [
    { key: 'publicBaseUrl', value: 'http://localhost:3000/api', type: 'string' },
    { key: 'publicBaseUrlProd', value: 'https://api.bling.com/api', type: 'string' },
    { key: 'client_access_token', value: '', type: 'string' },
    { key: 'client_refresh_token', value: '', type: 'string' },
  ],
  item: [
    createFolder('01. Authentication', publicAuth),
    createFolder('02. Locations', publicLocations),
    createFolder('03. Addresses', publicAddresses),
  ],
};

// ==========================================
// OUTPUT FILE GENERATION
// ==========================================
const docsDir = path.join(__dirname, '..', 'docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

const adminPath = path.join(docsDir, 'bling_admin_api.postman_collection.json');
const publicPath = path.join(docsDir, 'bling_public_api.postman_collection.json');

fs.writeFileSync(adminPath, JSON.stringify(adminCollection, null, 2));
fs.writeFileSync(publicPath, JSON.stringify(publicCollection, null, 2));

console.log(`\x1b[32m✔ Admin API Collection generated: ${adminPath}\x1b[0m`);
console.log(`\x1b[32m✔ Public API Collection generated: ${publicPath}\x1b[0m`);
