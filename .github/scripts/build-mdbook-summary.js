/**
 * mdBook relies on the creation of a special SUMMARY.md file
 * https://rust-lang.github.io/mdBook/format/summary.html
 * This script constructs the summary out of the available source files.
 */

const fs = require('fs');

module.exports = async ({github, context}) => {
    fs.copyFileSync("mdbook/SUMMARY_preface.md", "mdbook/src/SUMMARY.md") // Starting point.

    const appendRfcsToSummary = (dirPath) => {
      for (const filename of fs.readdirSync(dirPath)) {
        if (!filename.endsWith(".md")) continue;
        const filePath = dirPath + filename
        const text = fs.readFileSync(filePath)
        const title = text.toString().split(/\n/)
            .find(line => line.startsWith("# ") || line.startsWith(" # "))
            .replace("# ", "")
        // Relative path, without the src prefix (format required by mdbook)
        const relativePath = filePath.replace("mdbook/src/", "")
        fs.appendFileSync("mdbook/src/SUMMARY.md", `- [${title}](${relativePath})\n`)
      }
    }

    appendRfcsToSummary("mdbook/src/approved/")

    fs.appendFileSync("mdbook/src/SUMMARY.md", "\n---\n\n# Newly Proposed\n\n")
    appendRfcsToSummary("mdbook/src/new/")

    fs.appendFileSync("mdbook/src/SUMMARY.md", "\n---\n\n# Proposed\n\n")
    appendRfcsToSummary("mdbook/src/proposed/")

    fs.appendFileSync("mdbook/src/SUMMARY.md", "\n---\n\n# Stale\n\n")
    appendRfcsToSummary("mdbook/src/stale/")
}
