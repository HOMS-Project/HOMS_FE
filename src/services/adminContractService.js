import api from './api';

const adminContractService = {
    getTemplates: async (params) => {
        try {
            const response = await api.get('/admin/contracts/templates', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching contract templates', error);
            throw error;
        }
    },

    getContracts: async (params) => {
        try {
            const response = await api.get('/admin/contracts', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching contracts', error);
            throw error;
        }
    },

    createTemplate: async (templateData) => {
        try {
            const response = await api.post('/admin/contracts/templates', templateData);
            return response.data;
        } catch (error) {
            console.error('Error creating contract template', error);
            throw error;
        }
    },

    generateContract: async (contractData) => {
        try {
            const response = await api.post('/admin/contracts/generate', contractData);
            return response.data;
        } catch (error) {
            console.error('Error generating contract', error);
            throw error;
        }
    }
};

export default adminContractService;
