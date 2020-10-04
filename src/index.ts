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
            executablePath: '/usr/bin/google-chrome-unstable', // puppeteer.executablePath(),
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

        for (const index in inputArray) {
            console.log(`Loading page ${index}: ${inputArray[index]}`)
            const pageUrl = inputArray[index].startsWith('http')
                ? inputArray[index]
                : `http://localhost:${PORT}/${inputArray[index]}`
            await tab.goto(pageUrl, { waitUntil: 'networkidle0' })

            console.log(`Printing page ${index} to ./page${index}.pdf`)
            const pageOptions = { ...pdfOptions, path: `./page${index}.pdf` }
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

        console.log(`Saving merged PDF to ${outputPath}`)
        await merger.save(outputPath)
    } catch (error) {
        core.setFailed(`Action failed with error: ${error}`)
    }
}

run()
