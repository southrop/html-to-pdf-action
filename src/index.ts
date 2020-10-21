import * as core from '@actions/core'
import * as fs from 'fs'
import * as path from 'path'
import PDFMerger from 'pdf-merger-js'
import puppeteer from 'puppeteer'
import { PORT } from './constants'
import { Server } from './server'

async function run(): Promise<void> {
    try {
        const input: string = core.getInput('input')
        let outputPath: string = core.getInput('outputPath')
        const pageOptions: string = core.getInput('pageOptions')
        const globalOptions: string = core.getInput('globalOptions')

        console.log(`inputPaths: ${input}`)
        console.log(`outputPath: ${outputPath}`)
        console.log(`pageOptions: ${pageOptions}`)

        const pdfOptions = JSON.parse(globalOptions)
        console.log(`global: ${JSON.stringify(pdfOptions, null, 4)}`)

        const browser = await puppeteer.launch({
            executablePath: '/usr/bin/google-chrome-unstable', // puppeteer.executablePath(),
            args: ['--no-sandbox', '--headless', '--disable-gpu']
        })
        const tab = await browser.newPage()
        const merger = new PDFMerger()

        const inputArr = input.split(',')

        let hasLocalPages = false
        inputArr.some(input => {
            if (!input.startsWith('http')) {
                hasLocalPages = true
                return true
            }
        })

        let server: Server | undefined
        if (hasLocalPages) {
            server = new Server(process.cwd()) // start local server
        }

        let pageOptionsArr: string[] = []
        if (pageOptions !== '') {
            pageOptionsArr = pageOptions.split(',')
        }

        for (const index in inputArr) {
            console.log(`Loading page ${index}: ${inputArr[index]}`)

            const pageUrl = inputArr[index].startsWith('http')
                ? inputArr[index]
                : `http://localhost:${PORT}/${inputArr[index]}`
            await tab.goto(pageUrl, { waitUntil: 'networkidle0' })

            console.log(`Printing page ${index} to ./page${index}.pdf`)
            let pageOptions = { ...pdfOptions, path: `./page${index}.pdf` }
            if (Object.prototype.hasOwnProperty.call(pageOptionsArr, index)) {
                const additionalOptions = JSON.parse(pageOptionsArr[index])
                if (additionalOptions !== {}) {
                    pageOptions = { ...pageOptions, ...additionalOptions }
                }
            }
            await tab.pdf(pageOptions)

            console.log(`Adding page ${index} to binder`)
            merger.add(`page${index}.pdf`)
        }

        if (server !== undefined) {
            console.log('Closing server')
            server.close()
        }
        console.log('Closing browser')
        await browser.close()

        if (!outputPath.endsWith('.pdf')) {
            outputPath += '.pdf' // append file extension
        }

        console.log(`Output Path: '${outputPath}'`)
        const folder = path.parse(outputPath).dir.trim()
        if (folder.length > 0 && !fs.existsSync(folder)) {
            console.log(`Folder ${folder} doesn't exist. Creating`)
            fs.mkdirSync(folder, { recursive: true })
        }

        console.log(`Saving merged PDF to ${outputPath}`)
        await merger.save(outputPath)
    } catch (error) {
        core.setFailed(`Action failed with error: ${error}`)
    }
}

run()
