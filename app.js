require("dotenv").config()

const express = require("express")
const app = express()
const PORT = process.env.PORT
const helmet = require("helmet")
const compression = require("compression")

app.use(helmet())
app.use(compression())
app.use(express.static("public"))

app.listen(PORT, () => {
    console.log(`Lyssnar på port: ${PORT}`)
})
