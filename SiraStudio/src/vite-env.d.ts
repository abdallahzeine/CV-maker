/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CV_DEBUG?: string;
  readonly VITE_ENABLE_EXTERNAL_API?: string;
  readonly VITE_ENABLE_POSTMESSAGE_BRIDGE?: string;
  readonly VITE_POSTMESSAGE_ALLOWED_ORIGINS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
