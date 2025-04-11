import Axios from 'axios';

const axios = Axios.create({
    baseURL: "http://localhost:5253/api", // Centralized base URL
    // baseURL:"https://propertyfindsystem.azurewebsites.net/api",
  });
  
  export default axios;