import ApiService from '../ApiService'
import axios from 'axios'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('ApiService', () => {
    beforeEach(() => {
        mockedAxios.create.mockReturnValue(mockedAxios)
    })

    it('should have the correct base URL', () => {
        expect(mockedAxios.create).toHaveBeenCalledWith(
            expect.objectContaining({
                baseURL: import.meta.env.VITE_DEV_BASE_URL
            })
        )
    })

    it('should have the correct headers', () => {
        expect(mockedAxios.create).toHaveBeenCalledWith(
            expect.objectContaining({
                headers: {
                    'Content-type': 'application/json',
                    'x-api-key': 'your-client-api-key'
                }
            })
        )
    })

    it('should use request interceptor', () => {
        const interceptor = mockedAxios.interceptors.request.use as jest.Mock
        expect(interceptor).toHaveBeenCalled()
    })

    it('should use response interceptor', () => {
        const interceptor = mockedAxios.interceptors.response.use as jest.Mock
        expect(interceptor).toHaveBeenCalled()
    })
})
