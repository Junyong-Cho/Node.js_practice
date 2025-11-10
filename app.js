require('dotenv').config()

const express = require('express')
const {sequelize, File} = require('./models')

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const multer = require('multer')
const { exit } = require('process')

const app = express()
const port = 8888

app.use(express.json())

const driver = './driver'

if(!fs.existsSync(driver))
    fs.mkdirSync(driver)

const storage = multer.diskStorage({
    destination: (req, file, db) => db(null, driver),

    filename: (req, file, cb) =>{
        const ext = path.extname(file.originalname)

        const uniqueName = crypto.randomUUID() + ext

        cb(null, uniqueName)
    }
})

const upload = multer({storage: storage})

app.get('/', (req, res) => res.send('서버 실행 중'))

app.get('/list', async (req, res) =>{
    try{
        const files = await File.findAll()

        res.json(files)
    }
    catch(error){
        console.log('error arise')
        console.log(error)
        res.status(500).send('server error')
    }
})

app.get("/download/:id", async (req, res) =>{
    try{
        const fileId = req.params.id
        const file = await File.findByPk(fileId)

        if(!file)
            return res.status(404).send('not found')

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

app.get('/stream/:id', async (req, res) =>{
    try{
        const fileId = req.params.id
        const file = await File.findByPk(fileId)

        if(!file)
            return res.status(404).send('not found')

        const filepath = path.join(driver, file.stored_filename)

        if(!fs.existsSync(filepath))
            return res.status(404).send('not found')

        const stat = fs.statSync(filepath)
        const fileSize = stat.size

        const range = req.headers.range

        if(range){
            const parts = range.replace(/bytes=/, '').split('-')
            const start = parseInt(parts[0],10)
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1

            const chunksize = end - start + 1

            const fileStream = fs.createReadStream(filepath, {start, end})

            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': file.mime_type
            }

            res.writeHead(206, head)
            fileStream.pipe(res)
        }
        else{
            const head = {
                'Content-Length': fileSize,
                'Content-Type': file.mime_type
            }

            res.writeHead(200, head)
            fs.createReadStream(filepath).pipe(res)
        }
    }
    catch(error){
        console.error('streamin error')
        console.error(error)
        res.status(500).send('server error')
    }
})

app.post('/upload', upload.single('file'), async (req, res) =>{
    
    if(!req.file)
        return res.status(400).send('No Any files')

    const {originalname, filename, size, mimetype} = req.file

    try{
        const newFile = await File.create({
            original_filename: originalname,
            stored_filename: filename,
            file_size: size,
            mime_type: mimetype
        })
        res.status(201).json(newFile)
    }
    catch(error){
        console.error('failed to store')
        console.error(error)

        res.status(500).send('server error')
    }
})

app.listen(port, async () =>{
    console.log(`port open at ${port}`)

    try{
        await sequelize.authenticate()
        console.log('db connect success')
    }
    catch(err){
        console.log('failed to connect db')
        console.log(error)
    }
})