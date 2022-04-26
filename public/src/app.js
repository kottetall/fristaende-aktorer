document.querySelector("nav button").addEventListener("click", flipAriaExpanded)
document.querySelectorAll(".systems li[aria-expanded]").forEach(element => {
    element.addEventListener("click", flipAriaExpanded)
})


function flipAriaExpanded() {
    const ariaElement = this.closest("[aria-expanded]")
    const currentState = ariaElement.ariaExpanded

    let newState = "false"
    if (!currentState || currentState === "false") newState = "true"

    ariaElement.ariaExpanded = newState
}