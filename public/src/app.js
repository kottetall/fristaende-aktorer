if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("sw.js")
}


document.querySelectorAll("nav span").forEach(element => element.addEventListener("click", flipAriaExpanded))
document.querySelectorAll("#Uppdateringar_i_anvandarstodet span").forEach(element => element.addEventListener("click", flipAriaExpanded))

document.querySelector(".close").addEventListener("click", flipAriaExpanded)

document.querySelectorAll("nav a").forEach(element => {
    element.addEventListener("click", (e) => {
        e.preventDefault()
        closeAriaParents(element)
        document.querySelector(`${element.href}`).scrollIntoView()
    })
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

// document.querySelector(".modal").addEventListener("mousedown", (event) => {
//     // Funktion för att kunna "röra sig" över bilden - liknande på telefon
//     console.dir(event)
// })

function searchPage(searchString) {
    if (!searchString) return false
    const searchStringRegex = new RegExp(searchString.trim(), "i")
    const allArticles = [...document.querySelectorAll("article")]
    const foundMatches = []

    for (let article of allArticles) {
        if (searchStringRegex.test(article.textContent)) {
            foundMatches.push(article)
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

function findOnPage() {
    const searchString = document.querySelector("#pageSearch").value
    const foundMatches = searchPage(searchString)
    handleSearchResults(foundMatches)
}

function createIcon(type) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    svg.classList.add(type)
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path")

    switch (type) {
        case "caret":
            svg.setAttribute("viewbox", "0 0 106 59")
            svg.setAttribute("fill", "none")

            path.setAttribute("d", "M3 56L52.5084 6L103 56")
            path.setAttribute("stroke", "black")
            path.setAttribute("stroke-width", "8")
            break

    }


    svg.append(path)
    return svg
}