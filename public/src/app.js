if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("sw.js")
}

document.querySelectorAll("nav span").forEach(element => element.addEventListener("click", flipAriaExpanded))
// document.querySelectorAll("#Uppdateringar_i_anvandarstodet span").forEach(element => element.addEventListener("click", flipAriaExpanded))

document.querySelector(".close").addEventListener("click", flipAriaExpanded)

document.querySelectorAll("nav a").forEach(element => {
    element.addEventListener("click", (e) => {
        e.preventDefault()
        closeAriaParents(element)
        document.querySelector(`${element.href.split("html").pop()}`).scrollIntoView()
    })
})

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

populatePage()

function populatePage() {
    const mainElement = document.querySelector("main")
    const navElement = document.querySelector("nav>ul")

    const allSections = []
    for (let instruction of instructions) {
        allSections.push(new Section(instruction))
    }

    const navFragment = document.createDocumentFragment()
    const sectionFragment = document.createDocumentFragment()

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
    // TODO: Ev stänga alla öppna i NAV eller alla utom den men länken man klickade på
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
}

function findOnPage() {
    clearFoundResults()
    const searchString = document.querySelector("#pageSearch").value
    const foundMatches = searchPage(searchString)
    handleSearchResults(foundMatches)
}

function intersectionHandler(entries, observer) {
    if (entries[0].isIntersecting) updateShortcuts(entries[0].target)
}

const intersectionObserverOptions = {
    rootMargin: getComputedStyle(document.querySelector("header")).getPropertyValue("height"),
    threshold: 1
}

const observer = new IntersectionObserver(intersectionHandler, intersectionObserverOptions)
document.querySelectorAll("article").forEach(element => observer.observe(element))