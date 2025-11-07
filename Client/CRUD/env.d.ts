/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_TITLE: string
    readonly VITE_DEV_BASE_URL: string
    readonly RPG_SERVER: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}