<template>
    <div class="space-y-4">
        <Accordion class="assignment-accordion">
            <AccordionTab>
                <template #header>
                    <div class="flex justify-between items-center w-full">
                        <div class="flex items-center gap-3">
                            <span class="font-semibold">Learning Materials</span>
                            <Badge :value="materials?.length" severity="info" />
                        </div>
                    </div>
                </template>

                <div class="space-y-4 p-4">
                    <!-- Header: Title + Add Button -->
                    <div class="flex justify-between items-center mb-4">
                        <h4 class="text-lg font-semibold">Uploaded Files</h4>
                        <Button v-if="isEditable" icon="pi pi-plus" label="Add Material"
                            @click="$emit('add-material', lessonId)" class="p-button-outlined p-button-sm" />
                    </div>

                    <!-- Materials Table -->
                    <DataTable :value="materials" class="p-datatable-sm" :loading="loading">
                        <!-- Title / Filename -->
                        <Column header="File Name">
                            <template #body="{ data }">
                                <div class="flex items-center gap-2">
                                    <i :class="getFileIcon(data.mimetype)" class="text-lg" />
                                    <span class="font-medium">{{ data.originalName || data.filename }}</span>
                                </div>
                            </template>
                        </Column>

                        <!-- File Type -->
                        <Column field="mimetype" header="Type" style="width: 120px">
                            <template #body="{ data }">
                                <Tag :value="getFileTypeLabel(data.mimetype)"
                                    :severity="getTagSeverity(data.mimetype)" />
                            </template>
                        </Column>

                        <!-- Status -->
                        <Column header="Status" style="width: 130px">
                            <template #body="{ data }">
                                <Badge :value="formatStatus(data.status)" :severity="getStatusSeverity(data.status)" />
                            </template>
                        </Column>

                        <!-- Size -->
                        <Column header="Size" style="width: 100px">
                            <template #body="{ data }">
                                <span class="text-sm text-gray-600">{{ formatFileSize(data.size) }}</span>
                            </template>
                        </Column>

                        <!-- Link / View -->
                        <Column header="Link" style="width: 100px">
                            <template #body="{ data }">
                                <a v-if="data.url && data.status === 'READY'" :href="data.url" target="_blank"
                                    class="text-blue-600 hover:underline text-sm flex items-center gap-1">
                                    <i class="pi pi-external-link text-xs" />
                                    View
                                </a>
                                <span v-else class="text-gray-400 text-sm">—</span>
                            </template>
                        </Column>

                        <!-- Actions -->
                        <Column style="width: 80px">
                            <template #body="{ data }">
                                <Button v-if="isEditable" icon="pi pi-trash" @click="$emit('delete-material', data.id)"
                                    class="p-button-danger p-button-outlined p-button-sm"
                                    :disabled="data.status === 'PROCESSING'" />
                            </template>
                        </Column>
                    </DataTable>

                    <!-- Empty State -->
                    <div v-if="!materials?.length && !loading" class="text-center py-8 text-gray-500">
                        <i class="pi pi-file text-4xl mb-3 block" />
                        <p>No materials uploaded yet.</p>
                    </div>
                </div>
            </AccordionTab>
        </Accordion>
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Badge from 'primevue/badge';
import Tag from 'primevue/tag';
import { Resource } from '@/types';

defineProps<{
    materials: Resource[] | undefined;
    lessonId?: string;
    loading?: boolean;
    isEditable: boolean;
}>();

defineEmits<{
    (e: 'add-material', lessonId: string | undefined): void;
    (e: 'delete-material', materialId: string): void;
}>();

// Helper: Human-readable file size
const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '—';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

// Helper: Map mimetype to label
const getFileTypeLabel = (mimetype?: string): string => {
    if (!mimetype) return 'Unknown';
    if (mimetype.includes('pdf')) return 'PDF';
    if (mimetype.includes('video')) return 'Video';
    if (mimetype.includes('image')) return 'Image';
    if (mimetype.includes('text')) return 'Text';
    if (mimetype.includes('calendar')) return 'Calendar';
    return 'File';
};

// Helper: Icon per mimetype
const getFileIcon = (mimetype?: string): string => {
    if (!mimetype) return 'pi pi-file';
    if (mimetype.includes('pdf')) return 'pi pi-file-pdf';
    if (mimetype.includes('video')) return 'pi pi-video';
    if (mimetype.includes('image')) return 'pi pi-image';
    if (mimetype.includes('text')) return 'pi pi-file-edit';
    return 'pi pi-file';
};

// Helper: Tag severity
const getTagSeverity = (mimetype?: string) => {
    if (!mimetype) return 'secondary';
    if (mimetype.includes('pdf')) return 'danger';
    if (mimetype.includes('video')) return 'warning';
    if (mimetype.includes('image')) return 'success';
    if (mimetype.includes('text')) return 'info';
    return 'secondary';
};

// Helper: Status formatting
const formatStatus = (status?: string): string => {
    switch (status) {
        case 'PROCESSING':
            return 'Processing';
        case 'READY':
            return 'Ready';
        case 'FAILED':
            return 'Failed';
        default:
            return 'Unknown';
    }
};

const getStatusSeverity = (status?: string) => {
    switch (status) {
        case 'READY':
            return 'success';
        case 'PROCESSING':
            return 'warning';
        case 'FAILED':
            return 'danger';
        default:
            return 'secondary';
    }
};
</script>

<!-- Update Resource Interface (in types.ts or inline) -->
<script lang="ts">

</script>

<style scoped>
.assignment-accordion :deep(.p-accordion-header-link) {
    padding: 0.75rem 1rem;
}
</style>