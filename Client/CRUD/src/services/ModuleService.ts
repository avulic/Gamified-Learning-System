import ApiService from '@/services/ApiService';
import type { Module } from '@/types/Module'; // Ensure to import the correct Module type

import { get, post, put } from '@/services/ApiService';

class ModuleService {
    public async createModule(module: Module): Promise<Module> {
        try {
            const response = await post<Module>('/modules', module);
            return response.data;
        } catch (error) {
            // Handle createModule specific errors if needed
            throw new Error('Failed to create Module');
        }
    }

    public async createModules(modules: Module[]): Promise<Module[]> {
        try {
            const response = await post<Module[]>('/modules', modules);
            return response.data;
        } catch (error) {
            // Handle createModules specific errors if needed
            throw new Error('Failed to create Modules');
        }
    }

    public async getAllModules(): Promise<Module[]> {
        const response = await get<Module[]>('/modules');
        return response.data;
    }

    public async getModuleById(moduleId: string): Promise<Module | null> {
        const response = await get<Module>(`/modules/${moduleId}`);
        return response.data;
    }

    public async updateModule(moduleId: string, updatedModuleData: Module): Promise<Module | null> {
        try {
            const response = await put<Module>(`/modules/${moduleId}`, updatedModuleData);
            return response.data;
        } catch (err) {
            throw new Error("Server error: " + err);
        }
    }

    public async deleteModule(moduleId: string): Promise<Module | null> {
        const response = await ApiService.delete<Module>(`/modules/${moduleId}`);
        return response.data;
    }
}


// Service for managing module content
// class ModuleContentService {
//     addContent(moduleId: string, content: ModuleContent): Promise<Module> {
//       // Implementation
//     }
  
//     removeContent(moduleId: string, contentId: string): Promise<Module> {
//       // Implementation
//     }
  
//     reorderContent(moduleId: string, contentOrder: string[]): Promise<Module> {
//       // Implementation
//     }
  
//     getContentProgress(userId: string, moduleId: string): Promise<ContentProgress[]> {
//       // Implementation
//     }
  
//     updateContentProgress(progress: ContentProgress): Promise<ContentProgress> {
//       // Implementation
//     }
//   }

export default new ModuleService();
