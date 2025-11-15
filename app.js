require('dotenv').config()                          // 로컬에 있는 환경 변수 사용

// 라이브러리
const express = require('express')                  // express 
const {sequelize, File} = require('./models')       // 테이블

const fs = require('fs')                            // 파일 읽기
const path = require('path')                        // 경로 설정
const crypto = require('crypto')                    // uuid 생성

const multer = require('multer')                    // 파일 업로드         

const app = express()                               // app 인스턴스 생성
const port = 8888                                   // 포트 번호 8888

app.use(express.json())                             // json 파일 사용 미들웨어
app.use(express.static('./public'))                 // 정적 파일 사용 미들웨어 (html, css, js)

const driver = './driver'                           // 클라우드 저장소 디렉터리

if(!fs.existsSync(driver))                          // 디렉터리가 없으면 생성
    fs.mkdirSync(driver)

const storage = multer.diskStorage({                // 디스크에 저장
    destination: (req, file, db) => db(null, driver),   // 파일 저장 위치

    filename: (req, file, cb) =>{                   // 저장할 파일 이름 설정
        const ext = path.extname(file.originalname)

        const uniqueName = crypto.randomUUID() + ext

        cb(null, uniqueName)
    }
})

const upload = multer({storage: storage})           // multer 인스턴스 생성

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'public','index.html'))
})

app.get('/list', async (req, res) =>{               // 저장된 파일 목록 요청
    try{
        const files = await File.findAll({
            attributes:['id','original_filename']   // 기본키와 이름만 조회
        })

        res.json(files)                             // json 형태로 전달
    }
    catch(error){
        console.log('error arise')
        console.log(error)
        res.status(500).send('server error')
    }
})

app.get("/download/:id", async (req, res) =>{       // 파일 다운로드 요청
    try{
        const file = await File.findByPk(req.params.id)    // id로 파일 메타데이터 조회

        if(!file)
            return res.status(404).send('not found')
                                                    // driver에 저장된 파일명
        const filepath = path.join(driver, file.stored_filename)

        if(!fs.existsSync(filepath))
            return res.status(404).send('not found')

        res.download(filepath, file.original_filename, (err) => {
            if(err){
                console.error('download error')
                console.error(err)
            }
        })
    }
    catch(error){
        console.error('server error')
        console.error(error)

        res.status(500).send('server error')
    }
})

app.get('/stream/:id', async (req, res) =>{         // 파일 스트리밍 요청
    try{
        const file = await File.findByPk(req.params.id)    // id로 파일 메타데이터 조회

        if(!file)
            return res.status(404).send('not found')
                                                    // driver에 저장된 파일명
        const filepath = path.join(driver, file.stored_filename)

        if(!fs.existsSync(filepath))
            return res.status(404).send('not found')
                            
        const range = req.headers.range

        // 요청 헤더에서 범위가 명시된 경우 해당 범위부터 재전송
        if(range){ 
            const parts = range.replace(/bytes=/, '').split('-')
            const start = parseInt(parts[0],10)
            const end = parts[1] ? parseInt(parts[1], 10) : file.file_size - 1

            const chunksize = end - start + 1

            const fileStream = fs.createReadStream(filepath, {start, end})

            const head = {
                'Content-Range': `bytes ${start}-${end}/${file.file_size}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': file.mime_type
            }

            res.writeHead(206, head)
            fileStream.pipe(res)
        }
        else{       // 명시되지 않으면 처음부터 전송
            const head = {
                'Content-Length': file.file_size,
                'Content-Type': file.mime_type
            }

            res.writeHead(200, head)
            fs.createReadStream(filepath).pipe(res)
        }
    }
    catch(error){
        console.error('streaming error')
        console.error(error)
        res.status(500).send('server error')
    }
})

app.post('/upload', upload.single('file'), async (req, res) =>{ // 클라우드 서버에 파일 저장
                    // upload.single로 db에 먼저 저장
    if(!req.file)                                               // body에 파일이 없으면 400(bad req)
        return res.status(400).send('No Any files')     

    console.log(req.file)

    const {originalname, filename, size, mimetype} = req.file   // File 인스턴스 객체 분해 할당

    try{
        const newFile = await File.create({                     // 저장한 파일의 메타데이터 재전송
            original_filename: originalname,
            stored_filename: filename,
            file_size: size,
            mime_type: mimetype,
            status: 'Success'
        })
        res.status(201).json(newFile)
    }
    catch(error){
        console.error('failed to store')
        console.error(error)

        res.status(500).send('server error')
    }
})

app.patch("/file/:id", async (req, res) =>{         // 이름 변경
    
    try{
        const file = await File.findByPk(req.params.id)

        if(!file)
            return res.status(404).send('not found')
        
        const {original_filename} = req.body
        
        if(!original_filename)
            return res.status(400).send('bad request')
        
        file.original_filename = original_filename
        
        await file.save()
        
        res.status(200).json(file)
    }
    catch(err){
        console.error('patch error')
        console.error(err)
        res.status(500).send('server error')
    }
    
})

app.delete('/file/:id', async (req, res) =>{         // 삭제 요청
    try{
        const file = await File.findByPk(req.params.id)

        if(!file)
            return res.status(404).send('not found')

        const filepath = path.join(driver,file.stored_filename)

        if(!fs.existsSync(filepath))
            return res.status(404).send('not found')

        await file.destroy()        // db에서 메타데이터 삭제
                                    
        fs.unlink(filepath, (err) =>{   // 로컬 드라이브에서 제거
            if(err){
                console.error('delete failed')
                console.error(err)
            }
            else
                console.log('success')
        })

        res.status(204).send()
    }
    catch(error){
        console.error('delete error')
        console.error(error)
        res.status(500).send('server error')
    }
})

app.listen(port, async () =>{
    console.log(`port open at ${port}`)

    try{                                            // db 연결
        await sequelize.authenticate()
        console.log('db connect success')
    }
    catch(err){
        console.log('failed to connect db')
        console.log(err)
    }
})