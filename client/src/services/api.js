import axios from 'axios';
// Dev must use localhost (same-site as the Vite app) so the SameSite=Lax refresh cookie is sent.
const api=axios.create({baseURL:import.meta.env.VITE_API_URL||(import.meta.env.PROD?'/api':'http://localhost:5050/api'),withCredentials:true,timeout:12000});
api.interceptors.request.use(config=>{const token=localStorage.getItem('darna_access_token');if(token)config.headers.Authorization=`Bearer ${token}`;return config});
api.interceptors.response.use(r=>r,async error=>{const original=error.config;if(error.response?.status===401&&!original?._retried){original._retried=true;try{const {data}=await api.post('/auth/refresh');localStorage.setItem('darna_access_token',data.accessToken);original.headers.Authorization=`Bearer ${data.accessToken}`;return api(original)}catch{localStorage.removeItem('darna_access_token')}}return Promise.reject(error)});
export default api;
