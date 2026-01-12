import api from "./api"

export const saveContract = (payload) => {
    console.log("Payload in contractService:", payload);
    return api.post("/contracts/save", payload);
};

export const exportContract = (id) => {
    return api.get(`/contracts/${id}/export`, {
        responseType: "blob"
    });
};
