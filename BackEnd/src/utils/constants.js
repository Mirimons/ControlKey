export const TIPO_USUARIO = {
    ADMINISTRADOR: 1,
    COMUM: 2,
    TERCEIRO: 3
};

export const PERMISSIONS = {
    PUBLIC: [],
    AUTHENTICATED: [
        TIPO_USUARIO.ADMINISTRADOR,
        TIPO_USUARIO.COMUM,
        TIPO_USUARIO.TERCEIRO
    ],

    ADMIN: [TIPO_USUARIO.ADMINISTRADOR],
    COMUM: [TIPO_USUARIO.COMUM],
    TERCEIRO: [TIPO_USUARIO.TERCEIRO],

    ADMIN_E_COMUM: [
        TIPO_USUARIO.ADMINISTRADOR,
        TIPO_USUARIO.COMUM
    ],

    ADMIN_E_TERCEIRO: [
        TIPO_USUARIO.ADMINISTRADOR,
        TIPO_USUARIO.TERCEIRO
    ]
};

export const TIPO_USUARIO_DESC = {
    [TIPO_USUARIO.ADMINISTRADOR] : "Administrador",
    [TIPO_USUARIO.COMUM] : "Comum",
    [TIPO_USUARIO.TERCEIRO] : "Terceiro"
};

export function getPermittedTypesMessage(requiredTypes) {
    const desc_tipo = requiredTypes.map(type => TIPO_USUARIO_DESC[type]);
    return `Acesso permitido apenas para: ${desc_tipo.join(', ')}`;
}