export const config = {
  production: process.env.NODE_ENV === 'production',
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'http://138.255.103.38:3000'
    : 'http://localhost:3000',
  uploadPath: 'uploads',
}; 