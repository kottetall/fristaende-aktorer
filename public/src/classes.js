class FAQ {
    constructor(faqHeader) {
        this.title = faqHeader.title
        this.questions = faqHeader.questions
        this.questionContainer = createQuickElement("div", "expandable", { "aria-expanded": "false" })
        this.createHeader()
    }

    createHeader() {
        const header = createQuickElement("h3")
        const label = createQuickElement("label")
        label.textContent = this.title

        const button = createQuickElement("button", "expand", { "type": "button", "aria-label": `Öppnar eller minimerar undermeny för sektionen ${this.title}` })
        button.addEventListener("click", flipAriaExpanded)
        label.append(button)
        header.append(label)

        this.questionContainer.append(header)

        this.fillQuestions()
    }

    fillQuestions() {
        const questionsFragment = document.createDocumentFragment()
        for (let question of this.questions) {
            const container = createQuickElement("div", "expandable", { "aria-expanded": "false" })
            const header = createQuickElement("h4")
            const label = createQuickElement("label")
            label.textContent = question.title

            const button = createQuickElement("button", "expand", { "type": "button", "aria-label": `Öppnar eller minimerar undermeny för sektionen ${this.title}` })
            button.addEventListener("click", flipAriaExpanded)
            label.append(button)
            header.append(label)

            const answer = createQuickElement("p")
            answer.textContent = question.answer

            const ticket = createQuickElement("a", "ticket")
            ticket.textContent = "Felanmälan hos Arbetsformedlingen"
            ticket.href = "https://arbetsformedlingen.se/om-oss/for-leverantorer/administration-for-leverantorer/rapportera-tekniska-problem-med-webbstod"

            container.append(header, answer, ticket)
            questionsFragment.append(container)
        }
        this.questionContainer.append(questionsFragment)
    }
}

class Breadcrumbs {
    constructor() {
        this._systemCrumb = document.querySelector(".systemCrumb")
        this._serviceCrumb = document.querySelector(".serviceCrumb")
        this._sectionCrumb = document.querySelector(".sectionCrumb")
        this._articleCrumb = document.querySelector(".articleCrumb")

        this._init()
    }

    _init() {
        this.system = "Om sidan"
    }

    set system(newSystem) {
        this._systemCrumb.textContent = newSystem
    }
    set service(newService) {
        this._serviceCrumb.textContent = newService
    }
    set section(newSection) {
        this._sectionCrumb.textContent = newSection
    }
    set article(newArticle) {
        this._articleCrumb.textContent = newArticle
    }
}

class StatusIndicator {
    constructor() {
        this._indicator = document.getElementById("status")
        this._init()
    }

    _init() {
        this._currentstatus = ""
        this._currentmessage = ""
        this._currentIcon = ""
    }

    set update(newStatus) {
        this._currentstatus = newStatus
        this._indicator.dataset.status = this._currentstatus
        switch (this._currentstatus) {
            case "offline":
                this._currentmessage = `Du är offline. Sidan går fortfarande att använda, men med begränsad funktionalitet`
                this._currentIcon = "offline.svg"
                break
            case "intermittent":
                this._currentmessage = `Sidan verkar ha problem med uppkopplingen mot vår server. Den går dock fortfarande att använda, men med begränsad funktionalitet`
                this._currentIcon = "intermittent.svg"
                break
            default:
                this._currentmessage = `Du är uppkopplad mot ett nätverk`
                this._currentIcon = "online.svg"
                break

        }
        if (this._currentstatus === "connection") {
        }

        this._indicator.ariaLabel = this._currentmessage
        this._indicator.style.backgroundImage = `url(./img/icons/${this._currentIcon})`
    }

    reset() {
        this._init()
    }
}