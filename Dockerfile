# 베이스 이미지
FROM node:20-alpine
# 컨테이너 내부에서 app 디렉터리 사용
WORKDIR /app

# 설정 파일 먼저 복사
COPY package.json package-lock.json ./

# .json 파일 기반으로 필요한 라이브러리 설치
RUN npm ci

# 전체 파일 복사
COPY . .

# 8888 포트 사용
EXPOSE 8888

# node app으로 서버 실행
CMD ["node", "app"]