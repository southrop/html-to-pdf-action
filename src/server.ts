import * as fs from 'fs'
import * as http from 'http'
import * as path from 'path'
import { PORT } from './constants'

export class Server {
    server: http.Server
    mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm'
    }

    constructor(rootPath: string) {
        this.server = http
            .createServer((request, response) => {
                console.log('Request: ' + request.url)

                let filePath = path.join(rootPath, request.url || '')
                if (request.url === '/') {
                    filePath = path.join(rootPath, 'index.html')
                }

                const extname = String(path.extname(filePath)).toLowerCase()
                const contentType =
                    this.mimeTypes[extname] || 'application/octet-stream'

                fs.readFile(filePath, (error, content) => {
                    if (error) {
                        console.log('Server Error: ' + error)
                        if (error.code === 'ENOENT') {
                            response.writeHead(404)
                            response.end('404')
                        } else {
                            response.writeHead(500)
                            response.end(error.code)
                        }
                    } else {
                        response.writeHead(200, { 'Content-Type': contentType })
                        response.end(content, 'utf-8')
                    }
                })
            })
            .listen(PORT)
    }

    close(): void {
        this.server.close()
    }
}
