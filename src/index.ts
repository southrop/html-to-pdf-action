import * as core from '@actions/core'
import { Server } from './server'
import PDFMerger from 'pdf-merger-js'
import puppeteer from 'puppeteer'
import { PORT } from './constants'

async function run(): Promise<void> {
    try {
        const inputPaths: string = core.getInput('inputPaths')
        let outputPath: string = core.getInput('outputPath')
        const options: string = core.getInput('puppeteerOptions')

        console.log('inputPaths: ' + inputPaths)
        console.log('outputPath: ' + outputPath)
        console.log('options: ' + options)

        const pdfOptions = JSON.parse(options)
        console.log('optionsObj: ' + JSON.stringify(pdfOptions, null, 4))

        const browser = await puppeteer.launch({
            executablePath:
                '/home/runner/work/html-to-pdf-action/html-to-pdf-action/node_modules/puppeteer/.local-chromium/linux-800071',
            args: ['--no-sandbox', '--headless', '--disable-gpu']
        })
        const tab = await browser.newPage()
        const merger = new PDFMerger()

        const inputArray = inputPaths.split(',')

        let isLocal = false
        inputArray.some(input => {
            if (!input.startsWith('http')) {
                isLocal = true
                return true
            }
        })
        let server: Server | undefined
        if (isLocal) {
            server = new Server(process.cwd()) // start local server
        }

        inputArray.forEach(async (input, index) => {
            console.log(`Printing page ${index}: ${input}`)

            const pageUrl = input.startsWith('http')
                ? input
                : `http://localhost:${PORT}/${input}`
            await tab.goto(pageUrl, { waitUntil: 'networkidle0' })

            const pageOptions = { ...pdfOptions, path: `./page${index}.pdf` }
            await tab.pdf(pageOptions)

            merger.add(`page${index}.pdf`)
        })

        if (server !== undefined) {
            server.close()
        }
        await browser.close()

        if (!outputPath.endsWith('.pdf')) {
            outputPath += '.pdf' // append file extension
        }

        await merger.save(outputPath)
    } catch (error) {
        core.setFailed(`Action failed with error: ${error}`)
    }
}

run()
