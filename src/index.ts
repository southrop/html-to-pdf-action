import * as core from '@actions/core'

async function run(): Promise<void> {
    const inputPaths: string = core.getInput('inputPaths')
    const outputPath: string = core.getInput('outputPath')
    const options: string = core.getInput('puppeteerOptions')

    console.log('inputPaths: ' + inputPaths)
    console.log('outputPath: ' + outputPath)
    console.log('options: ' + options)

    const optionsObj = JSON.parse(options)
    console.log('optionsObj: ' + JSON.stringify(optionsObj, null, 4))

    const inputArray = inputPaths.split(",")
    inputArray.forEach(input => {
        console.log('Input: ' + input)
    })
}

run()
