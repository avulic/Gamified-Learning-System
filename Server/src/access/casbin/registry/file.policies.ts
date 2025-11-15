import { canDownloadFile, canUploadFile, canDeleteFile } from "../policies/filePolicies";
import { PolicyRegistry } from "./PolicyRegistry";

// src/access/policies/file.policies.ts
PolicyRegistry.register('file', 'download', {
    id: 'file.download',
    priority: 200,
    applies: ({ resource, ctx }) => resource?.type === 'file' && ctx.action === 'download',
    execute: ({ user, resource }) => canDownloadFile(resource, user)
}, 'all');

PolicyRegistry.register('file', 'upload', {
    id: 'file.upload',
    priority: 200,
    applies: ({ resource, ctx }) => (resource?.type === 'upload-context' || resource?.type === 'file-upload') && ctx.action === 'upload',
    execute: ({ user, resource, ctx }) => canUploadFile(user, ctx)
}, 'all');

PolicyRegistry.register('file', 'delete', {
    id: 'file.delete',
    priority: 200,
    applies: ({ resource, ctx }) => resource?.type === 'file' && ctx.action === 'delete',
    execute: ({ user, resource }) => canDeleteFile(resource, user)
}, 'all');
