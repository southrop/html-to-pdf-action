# HTML to PDF

A Github Action to print HTML files to PDF format using Puppeteer.

## Inputs

* `inputPaths` - (Required) A comma separated list of paths of the HTML files to print
* `outputPath`- (Optional) The desired path in the repo for the resultant PDF to be added to
* `puppeteerOptions`- (Optional) JSON options to be passed directly to Puppeteer (see [Puppeteer API](https://github.com/puppeteer/puppeteer/blob/main/docs/api.md#pagepdfoptions))

## Example

An example workflow to checkout a specific branch of a repo, generate a PDF from a list of files, and then commit the resultant PDF to that branch.

```yaml
jobs:
  example:
    runs-on: ubuntu-16.04
    steps:
      - uses: actions/checkout@v2
        with:
          ref: gh-pages # Checkout gh-pages branch
      - uses: actions/cache@v2
        with:
          path: ~/.npm
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-
      - uses: southrop/html-to-pdf-action@v1
        with:
          inputPaths: 'index.html,about/index.html'
          outputPath: pdf/print.pdf
          puppeteerOptions: '{"format": "A4", "margin": {"top": "10mm", "left": "10mm", "right": "10mm", "bottom": "10mm"}}'
      - run: |
        git config user.name "${GITHUB_ACTOR}"
        git config user.email "${GITHUB_ACTOR}@users.noreply.github.com"
        git add pdf/print.pdf
        git commit -m 'Generated PDF from ${GITHUB_SHA}'
        git push
```
