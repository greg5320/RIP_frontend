import { resolve } from 'path';
import { generateApi } from 'swagger-typescript-api';

generateApi({
    name: 'Api.ts', 
    output: resolve(process.cwd(), './src/api'), 
    url: 'http://localhost:8000/api/swagger/?format=openapi', 
    httpClientType: 'axios', 
});
