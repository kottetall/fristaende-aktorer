if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("sw.js")
}

document.querySelectorAll(".previous, .next").forEach(element => element.addEventListener("click", e => {
    e.preventDefault()
    const targetElement = document.getElementById(e.target.href.split("#").pop())
    targetElement.scrollIntoView()
    updateShortcuts(targetElement)
}))
document.querySelector(".start").addEventListener("click", e => {
    e.preventDefault()
    const targetElement = document.querySelector("main")
    targetElement.scrollIntoView()
    updateShortcuts(targetElement)
})

document.querySelector(".modal .close, .modal.active").addEventListener("click", (event) => {
    if (event.target.localName !== "img") document.querySelector(".modal.active").classList.remove("active")
})

document.querySelector(".openSearchModal").addEventListener("click", (e) => {
    const searchModal = document.querySelector(".searchModal")
    if (e.target.dataset.searchopen === "false") {
        e.target.dataset.searchopen = "true"
        searchModal.classList.add("active")
        searchModal.querySelector("input").focus()
    } else {
        e.target.dataset.searchopen = "false"
        searchModal.classList.remove("active")
    }
})

document.querySelector(".search").addEventListener("click", findOnPage)

document.querySelector("#pageSearch").addEventListener("input", (e) => {
    const { parentElement, value } = e.target
    value ? parentElement.dataset.empty = "false" : parentElement.dataset.empty = "true"
})

document.querySelector("#pageSearch").addEventListener("keyup", (e) => {
    if (e.code === "Enter") findOnPage()
})

document.querySelector(".clear").addEventListener("click", () => {
    clearFoundResults()
    clearElement(document.querySelector(".results"))
    document.querySelector("#pageSearch").value = ""
    document.querySelector("#pageSearch").focus()
    document.querySelector(".searchModal .inputContainer").dataset.empty = "true"
    document.querySelector(".openSearchModal").dataset.results = "false"
})

document.querySelectorAll(".expandable .expand").forEach(element => element.addEventListener("click", flipAriaExpanded))

document.querySelector(`li[data-system="start"] button`).addEventListener("click", () => {
    location.reload()
})

document.querySelector(`li[data-system="faq"] button`).addEventListener("click", showFaq)

document.querySelectorAll(`header nav, header .switch`).forEach(element => {
    element.addEventListener("click", () => {
        document.querySelectorAll(`header nav[aria-expanded="true"], header .switch[aria-expanded="true"]`).forEach(ariaElement => {
            if (ariaElement.ariaExpanded === "true" && ariaElement !== element) ariaElement.ariaExpanded = "false"
        })
    })
})

document.querySelectorAll(".switch .goto").forEach(element => {
    element.addEventListener("click", flipAriaExpanded)
})

function showFaq() {
    const mainElement = document.querySelector("main")
    const navElement = document.querySelector("nav>ul")
    clearElement(navElement)
    clearElement(mainElement)

    setTitleElement()
    updateBreadCrumbs("system", "vanliga frågor/problem")

    const section = createQuickElement("section")
    const article = createQuickElement("article")
    article.id = "faq"

    // TODO: Tillfällig
    const warningP = createQuickElement("p", "warning")
    warningP.textContent = "Denna del är under utveckling och innehåller i dagsläget inga svar/lösningar"
    article.append(warningP)

    const faqFragment = document.createDocumentFragment()
    for (let question of faq) {
        const faq = new FAQ(question)
        faqFragment.append(faq.questionContainer)
    }
    const h2 = createQuickElement("h2")
    h2.textContent = "Vanliga fel och problem"
    article.append(h2, faqFragment)
    section.append(article)
    mainElement.append(section)
}

function populateNav() {
    const servicesMsfa = Object.keys(instructions_msfa)
    const servicesKa = Object.keys(instructions_ka)

    const msfaNavFragment = document.createDocumentFragment()
    const kaNavFragment = document.createDocumentFragment()

    for (let service of servicesMsfa) {
        if (instructions_msfa[service].length === 0) continue
        msfaNavFragment.append(createNavServiceElement(service))
    }
    for (let service of servicesKa) {
        if (instructions_ka[service].length === 0) continue
        kaNavFragment.append(createNavServiceElement(service))
    }

    document.querySelector(`li[data-system="msfa"] .service`).append(msfaNavFragment)
    document.querySelector(`li[data-system="ka"] .service`).append(kaNavFragment)
}

function createNavServiceElement(name) {
    const li = createQuickElement("li")

    const label = createQuickElement("label")
    label.dataset.service = name
    const button = createQuickElement("button", "goto")
    button.addEventListener("click", () => {
        closeAriaParents(button)
    })

    label.append(name, button)
    label.addEventListener("click", populate)
    li.append(label)
    return li
}

populateNav()

// function populatePage() {
//     const mainElement = document.querySelector("main")
//     const navElement = document.querySelector("nav>ul")

//     const allSections = []
//     for (let instruction of instructions_msfa["krom"]) {
//         allSections.push(new Section(instruction))
//     }

//     const navFragment = document.createDocumentFragment()
//     const sectionFragment = document.createDocumentFragment()

//     for (let section of allSections) {
//         navFragment.append(section.navigationElement)
//         sectionFragment.append(section.element)
//     }

//     clearElement(navElement)
//     clearElement(mainElement)

//     navElement.append(navFragment)
//     mainElement.append(sectionFragment)
// }

function populate() {
    const { service } = this.dataset
    const { system } = this.closest(`[data-system]`).dataset

    const mainElement = document.querySelector("main")
    const navElement = document.querySelector("nav>ul")
    clearElement(navElement)
    clearElement(mainElement)

    updateBreadCrumbs("system", system)
    updateBreadCrumbs("service", service)

    if (system === "msfa") setTitleElement("MSFA", "Mina sidor för fristående aktörer")
    else setTitleElement("KA", "Kompletterande aktörer")

    const instructionsToUse = system === "msfa" ? instructions_msfa : instructions_ka

    const allSections = []

    for (let instruction of instructionsToUse[service]) {
        allSections.push(new Section(instruction))
    }

    const navFragment = document.createDocumentFragment()
    const sectionFragment = document.createDocumentFragment()
    // const observer = new IntersectionObserver(intersectionHandler, intersectionObserverOptions)
    for (let section of allSections) {
        for (let article of section.pages) {
            observer.observe(article.article)
        }
    }

    for (let section of allSections) {
        navFragment.append(section.navigationElement)
        sectionFragment.append(section.element)
    }

    navElement.append(navFragment)
    mainElement.append(sectionFragment)
}

function flipAriaExpanded() {
    let ariaElement = null
    if (this.ariaExpanded) ariaElement = this
    else if (this.nextElementSibling && this.nextElementSibling.ariaExpanded) ariaElement = this.nextElementSibling
    else ariaElement = this.closest("[aria-expanded]")
    let newState = "false"
    if (ariaElement.ariaExpanded === newState) newState = "true"
    ariaElement.ariaExpanded = newState
}

function closeAriaParents(element) {
    if (element.ariaExpanded) element.ariaExpanded = "false"
    const ariaParent = element.closest(`[aria-expanded="true"]`)
    if (ariaParent) closeAriaParents(ariaParent)
}


function clearElement(element) {
    element.textContent = ""
    const children = [...element.children]
    for (let child of children) {
        child.remove()
    }
}

function createQuickElement(type, className, attributes) {
    const element = document.createElement(type)

    if (className) element.classList.add(className)
    if (attributes) {
        for (let attribute in attributes) {
            element.setAttribute(attribute, attributes[attribute])
        }
    }

    return element
}

function makeId(string) {
    return string.replace(/\W/gi, "_")
}

function searchPage(searchString) {

    // TODO: förbättra!
    if (!searchString) return false
    const searchStringRegex = new RegExp(searchString.trim(), "i")
    const allArticles = [...document.querySelectorAll("article")]
    const foundMatches = []

    for (let article of allArticles) {
        if (!article.id || article.id === "Uppdateringar_i_anvandarstodet" || article.id === "about") continue
        if (searchStringRegex.test(article.textContent)) {
            foundMatches.push(article)
            for (let child of article.children) {
                if (searchStringRegex.test(child.textContent)) {
                    const originalContent = child.textContent.split(searchStringRegex)
                    child.textContent = ""
                    const childFragment = document.createDocumentFragment()
                    for (let content of originalContent) {
                        childFragment.append(content)
                        if (originalContent.indexOf(content) !== originalContent.length - 1) {
                            const resultMarking = createQuickElement("span", "foundResult")
                            resultMarking.textContent = searchString
                            childFragment.append(resultMarking)
                        }
                    }
                    child.append(childFragment)
                }
            }
        }
    }

    return foundMatches[0] ? foundMatches : false
}

function handleSearchResults(results) {
    const resultsElement = document.querySelector(".results")
    clearElement(resultsElement)
    if (!results) {
        resultsElement.textContent = "Kunde inte hitta några resultat"
        document.querySelector(".openSearchModal").dataset.results = "false"
        return
    }

    if (results.length === 1) {
        document.querySelector(".modal.active").classList.remove("active")
        document.querySelector(`[data-searchopen="true"]`).dataset.searchopen = "false"

        results[0].scrollIntoView()
        return
    }

    const resultsFragment = document.createDocumentFragment()
    for (let result of results) {
        if (result.querySelector("h2")) continue
        const li = createQuickElement("li")
        const aTag = createQuickElement("a")
        aTag.dataset.visited = "false"
        aTag.href = `#${result.id}`
        aTag.textContent = result.querySelector("h3").textContent
        aTag.addEventListener("click", (e) => {
            e.preventDefault()
            aTag.dataset.visited = "true"
            document.querySelector(".active").classList.remove("active")
            document.querySelector(".openSearchModal").dataset.searchopen = "false" //TODO: Egen funktion för element för att ändra state
            document.getElementById(result.id).scrollIntoView()
        })

        li.append(aTag)
        resultsFragment.append(li)

        document.querySelector(".openSearchModal").dataset.results = "true"
    }

    resultsElement.append(resultsFragment)
}

function clearFoundResults() {
    document.querySelectorAll(".foundResult").forEach(element => element.classList.remove("foundResult"))
}

function updateShortcuts(target) {
    // TODO: Uppdatera så next/prev anpassas utifrån sökresultat
    let { previousElementSibling, nextElementSibling } = target

    if (!previousElementSibling) previousElementSibling = { id: "" }
    if (!nextElementSibling) nextElementSibling = { id: "" }
    document.querySelector(".previous").href = `#${previousElementSibling.id}`
    document.querySelector(".next").href = `#${nextElementSibling.id}`

    // updateLinks
    document.querySelectorAll(`.currentArticle`).forEach(element => element.classList.remove("currentArticle"))
    document.querySelectorAll(`a[href="#${target.id}"]:not(footer)`).forEach(element => element.classList.add("currentArticle"))
    updateBreadCrumbs("article", target.querySelector("h3").textContent)
}

function findOnPage() {
    clearFoundResults()
    const searchString = document.querySelector("#pageSearch").value
    const foundMatches = searchPage(searchString)
    handleSearchResults(foundMatches)
}

function intersectionHandler(entries, observer) {
    entries.forEach(entry => {
        if (entry.isIntersecting) updateShortcuts(entry.target)
    })
}

const intersectionObserverOptions = {
    rootMargin: getComputedStyle(document.querySelector("header")).getPropertyValue("height"),
    threshold: 1
}

const observer = new IntersectionObserver(intersectionHandler, intersectionObserverOptions)


function setTitleElement(h1Text = "FA", pText = "Fristaende-Aktorer.se") {
    document.querySelector("header .title h1").textContent = h1Text
    document.querySelector("header .title p").textContent = pText
}

function updateBreadCrumbs(crumb, content) {
    switch (crumb) {
        case "system":
            document.querySelector(".systemCrumb").textContent = content
            break
        case "service":
            document.querySelector(".serviceCrumb").textContent = content
            break
        case "section":
            document.querySelector(".sectionCrumb").textContent = content
            break
        case "article":
            document.querySelector(".articleCrumb").textContent = content
            break
    }
}