require("dotenv").config()

const { response } = require("express")
const express = require("express")
const app = express()
const PORT = process.env.PORT
const helmet = require("helmet")


app.use(helmet({
    contentSecurityPolicy: false,
    xssFilter: false
}))

app.use((request, res, next) => {
    if (/.*\.svg/.test(request.path)) response.charset = "utf-8"
    next()
})

app.use(express.static("public"))

app.listen(PORT, () => {
    console.log(`Lyssnar på port: ${PORT}`)
})