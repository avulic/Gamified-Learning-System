/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_TITLE: string
    readonly DEV_BASE_URL: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}