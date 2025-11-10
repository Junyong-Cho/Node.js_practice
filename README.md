# 프로젝트 생성

```npm init```으로 프로젝트 생성

# 라이브러리 설치

`npm i express dotenv sequelize pg pg-hstore` 명령어와 `npm i -D nodemon sequelize-cli` 명령어 실행

`express`: 웹 서버 프레임워크  
`dotenv`: `.env`(환경 변수 파일)을 읽기 위한 라이브러리  
`sequelize`: 데이터베이스 작업용  
`pg` `pg-hstore`: PostgreSQL 작업에 필요한 라이브러리  
`sequelize-cli`: 마이그레이션 등으로 db를 초기화하거나 수정사항 반영을 용이하게 해주는 라이브러리  
`nodemon`: 코드가 변경될 때마다 서버를 자동으로 재시작해주는 도구

`package.json` 파일에 라이브러리가 추가되었는지 확인

