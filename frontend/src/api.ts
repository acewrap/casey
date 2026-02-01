import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Token ${token}`;
    }
    return config;
});

export interface Indicator {
    id?: number;
    value: string;
    indicator_type: string;
}

export interface Event {
    id: number;
    source: string;
    status: 'NEW' | 'PROCESSING' | 'TRIAGED' | 'FALSE_POSITIVE' | 'TRUE_POSITIVE' | 'PROMOTED' | 'CLOSED';
    severity: string;
    title: string;
    description: string;
    raw_data: any;
    mitre_tactics: string[];
    indicators: Indicator[];
    status_change_reason?: string;
    created_at: string;
    updated_at: string;
}

export interface Investigation {
    id: number;
    event: Event;
    description: string;
    tags: string[];
    timeline: any[];
    indicators: Indicator[];
    related_events: Event[];
    created_at: string;
    updated_at: string;
}

export interface Incident {
    id: number;
    title: string;
    description: string;
    status: string;
    events: Event[];
    created_at: string;
}

export interface ChartDefinition {
    id: number;
    title: string;
    chart_type: 'BAR' | 'LINE' | 'PIE' | 'TABLE';
    query_config: any;
    is_global: boolean;
}

export const fetchEvents = async () => api.get('events/');
export const bulkStatusUpdate = async (ids: number[], status: string, reason: string) =>
    api.post('events/bulk_status_update/', { ids, status, reason });

export const fetchInvestigations = async () => api.get('investigations/');
export const fetchInvestigation = async (id: number) => api.get(`investigations/${id}/`);
export const updateInvestigation = async (id: number, data: Partial<Investigation>) => api.patch(`investigations/${id}/`, data);
export const promoteInvestigation = async (id: number) => api.post(`investigations/${id}/promote/`);
export const addTimelineEvent = async (id: number, entry: string) => api.post(`investigations/${id}/add_timeline_event/`, { entry });
export const excludeIndicator = async (id: number, indicator_id: number) => api.post(`investigations/${id}/exclude_indicator/`, { indicator_id });
export const addTag = async (id: number, tag: string) => api.post(`investigations/${id}/add_tag/`, { tag });
export const removeTag = async (id: number, tag: string) => api.post(`investigations/${id}/remove_tag/`, { tag });

export const fetchCharts = async () => api.get('charts/');
export const createChart = async (data: Partial<ChartDefinition>) => api.post('charts/', data);
export const deleteChart = async (id: number) => api.delete(`charts/${id}/`);

export const generateReportData = async (config: any) => api.post('reporting/generate/', { query_config: config });
export const exportReportExcel = (config: any) => api.post('reporting/export_excel/', { data: config }, { responseType: 'blob' });
export const exportReportPdf = (config: any) => api.post('reporting/export_pdf/', { data: config }, { responseType: 'blob' });

export const search = async (query: string) => api.get(`search/?q=${query}`);

export default api;
