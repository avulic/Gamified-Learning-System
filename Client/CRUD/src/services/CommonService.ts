import ApiService from '@/services/ApiService';
import type ResponseData from '@/types/ResponseData'

class CommonService {
    public async uploadFile(file: File): Promise<any> {
        var response: ResponseData;

        try {
            // Create a new FormData object
            const formData = new FormData();
            // Append the file to the form data
            formData.append('file', file);

            // Make a POST request using the apiService instance to send the file to the server
            const response: ResponseData = await ApiService.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Important: Set the correct content type for sending files
                },
            });

            // Return the server response data
            return response.data;
        } catch (error) {
            // Handle any errors that occurred during the request
            throw new Error('File upload failed');
        }
    }
}

export default new CommonService();