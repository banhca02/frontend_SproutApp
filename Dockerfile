# Dùng Node image chính thức (có thể dùng phiên bản LTS)
FROM node:19.5.0-alpine

# Cập nhật hệ thống để fix lỗ hổng bảo mật
RUN apk update && apk upgrade

WORKDIR /app

# Copy và cài dependency
COPY package*.json ./
RUN npm install

# Copy toàn bộ source code
COPY . .

# Set biến môi trường nếu cần (tuỳ theo React dùng PORT không)
ENV PORT=3000

# Expose port của React dev server
EXPOSE 3000

# Khởi động React app (dành cho môi trường dev)
CMD ["npm", "start"]
