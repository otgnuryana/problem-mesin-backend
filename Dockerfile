FROM node:20-alpine

WORKDIR /app

# Ambil package.json dan install dependency
COPY package*.json ./
RUN npm install --production

# Salin seluruh source code proyek
COPY . .

# Sesuaikan dengan port port aplikasi Express-mu (misal: 3000 atau 8000)
EXPOSE 3000

CMD ["node", "app.js"] 
