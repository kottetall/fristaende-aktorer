require("dotenv").config()

const express = require("express")
const app = express()

const { PORT, API_URL } = process.env
// const { PORT, API_URL_TEST: API_URL } = process.env

const helmet = require("helmet")
const fetch = require("node-fetch")

app.use(helmet({
    contentSecurityPolicy: false,
    xssFilter: false
}))

app.use((request, response, next) => {
    if (/.*\.svg/.test(request.path)) response.charset = "utf-8"
    next()
})

app.use(express.static("public"))

app.listen(PORT, () => {
    console.log(`Lyssnar på port: ${PORT}`)
})

app.get("/instructions/:id", async (request, response) => {
    const { id } = request.params
    const data = await fetch(`${API_URL}/instruktioner/tjanst/${id}`)
    const jsonData = await data.json()
    response.send(jsonData)
})

app.get("/services", async (request, response) => {
    const data = await fetch(`${API_URL}/tjanster`)
    const jsonData = await data.json()
    response.send(jsonData)
})

app.get("/systems", async (request, response) => {
    const data = await fetch(`${API_URL}/systemstod`)
    const jsonData = await data.json()
    response.send(jsonData)
})
app.get("/categories", async (request, response) => {
    const data = await fetch(`${API_URL}/kategorier`)
    const jsonData = await data.json()
    response.send(jsonData)
})