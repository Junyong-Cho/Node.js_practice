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

# 환경 변수 설정
`.env` 파일 생성 후  
`DB_CONNECTION_STRING=[프로토콜]://[유저이름]:[패스워드]@[호스트]:[포트]/[db이름]` 입력으로 ConnectionString 설정

# db 설정

## 초기화

`npx sequelize-cli init` 명령어로 `config` `models` `migrations` `seeders` 디렉터리 생성

`config` 디렉터리 하위에 있는 `config.json` 파일의 확장자를 `js`로 변경하고 다음과 같이 설정

```js
require('dotenv').config()

module.exports = {
  development:{
    use_env_variable: 'DB_CONNECTION_STRING',
    dialect: 'postgres'
  }
}
```

`models` 디렉터리 하위 `index.js` 파일의 `const config = require(__dirname + '/../config/config.json')[env];` 부분에서 `config.json`을 `config.js`로 수정

## 모델 생성

`npx sequlize-cli model:generate --name File --attributes original_filename:string,stored_filename:string,file_size:integer,mime_type:string` 명령어로 File이라는 이름의 모델을 생성했다.

`model:generate`: 자동으로 기본키 생성
`--name`: 모델 이름 지정
`--attributes`: 테이블 속성 정의
    예시로 `orginal_filename`이라는 이름의 속성 생성하고 string 타입으로 지정

명령어가 성공적으로 실행되면 `models` 디렉터리 밑으로 `file.js`가 생성되고 `migrations` 디렉터리 밑으로도 새로운 파일이 생성된다.

`npx sequelize-cli db:create` 명령어로 db를 생성한다.  
`psql -U [유저이름] -p [포트번호] -h [호스트]` 명령어로 db에 접속해서 `\l` 명령어로 `.env` 파일에 설정한 db가 생성되었는지 확인한다. 

`npx sequelize-cli db:migrate` 명령어로 테이블을 생성한다.  
마찬가지로 db에 접속해서 `\c [db이름]` 명령어로 db로 이동한 다음에 `\dt` 명령어로 테이블이 생성되었는지 확인한다.

# 서버 구현

`npm init`으로 프로젝트를 생성할 때 설정한 파일명의 `.js` 파일을 생성한다.(기본 `index.js`)

# 파일 업로드 라이브러리 설치

`npm install multer` 명령어로 `multer` 라이브러리 설치

