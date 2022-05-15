if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("/sw.js")
}


document.querySelectorAll("nav span").forEach(element => element.addEventListener("click", flipAriaExpanded))
document.querySelectorAll("#Uppdateringar_i_anvandarstodet span").forEach(element => element.addEventListener("click", flipAriaExpanded))

document.querySelector(".close").addEventListener("click", flipAriaExpanded)

document.querySelectorAll("nav a").forEach(element => {
    element.addEventListener("click", () => {
        closeAriaParents(element)
    })
})

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

document.querySelector(".modal .close, .modal.active").addEventListener("click", (event) => {
    if (event.target.localName !== "img") document.querySelector(".modal.active").classList.remove("active")
})

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

document.querySelector(".modal").addEventListener("mousedown", (event) => {
    // Funktion för att kunna "röra sig" över bilden - liknande på telefon
    console.dir(event)
})