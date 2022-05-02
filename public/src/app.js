document.querySelectorAll("nav span").forEach(element => element.addEventListener("click", flipAriaExpanded))
document.querySelectorAll("section ul span").forEach(element => element.addEventListener("click", flipAriaExpanded))
document.querySelector(".close").addEventListener("click", flipAriaExpanded)

document.querySelectorAll("nav a").forEach(element => {
    element.addEventListener("click", () => {
        closeAriaParents(element)
    })
})

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

// REGEX FÖR ATT BYTA TECKEN MOT "_" och göra id av rubriker:
// [\s”,&\+:“\(\)]+

document.querySelectorAll("main img").forEach(element => {
    element.addEventListener("click", () => {
        const modal = document.querySelector(".modal")
        modal.classList.add("active")
        modal.querySelector("img").src = element.src
    })
})


document.querySelector(".modal .close, .modal.active").addEventListener("click", (event) => {
    if (event.target.localName !== "img") document.querySelector(".modal.active").classList.remove("active")
})

