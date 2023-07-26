import http from "@/http-commons";

class UserDataService {
    getAll(): Promise<any> {
        return http.get("/user/all");
    }

    get(id: any): Promise<any> {
        return http.get(`/user/${id}`);
    }

    create(data: any): Promise<any> {
        return http.post("/users", data);
    }

    update(id: any, data: any): Promise<any> {
        return http.put(`/user/${id}`, data);
    }

    delete(id: any): Promise<any> {
        return http.delete(`/user/${id}`);
    }

    deleteAll(): Promise<any> {
        return http.delete(`/user`);
    }

    findByTitle(title: string): Promise<any> {
        return http.get(`/user?name=${title}`);
    }
}

export default new UserDataService();