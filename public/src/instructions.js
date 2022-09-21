class System {
    constructor(systemResponse, arrayOfServices) {
        this.id = systemResponse.id
        this.name = systemResponse.namn
        this.abbriviation = systemResponse.forkortning
        this.more_information = systemResponse.mer_information
        this.created = systemResponse.skapad
        this.updated = systemResponse.senast_uppdaterad
        this.services = new Set(arrayOfServices)
        this.init()
    }

    init() {
        this.element = this.createItem()
    }

    createItem() {
        const li = createQuickElement("li", "expandable")
        li.ariaExpanded = false
        li.dataset.system = this.id

        const label = createQuickElement("label")
        let labelText = this.name
        if (this.abbriviation) labelText += `(${this.abbriviation})`
        label.textContent = toCapitalizedSentence(labelText)

        const button = createQuickElement("button", "expand")
        button.addEventListener("click", flipAriaExpanded)
        label.append(button)

        const ul = createQuickElement("ul", "service")
        this.services.forEach(service => ul.append(service.element))

        if (this.services.size === 0) {
            li.classList.add("noServices")
            ul.textContent = `Tyvärr saknas användarstöd för "${this.name}"`
        }

        li.append(label, ul)
        return li
    }
}

class Service {
    constructor(serviceResponse) {
        this.id = serviceResponse.id
        this.name = serviceResponse.namn
        this.abbriviation = serviceResponse.forkortning
        this.more_information = serviceResponse.mer_information
        this.created = serviceResponse.skapad
        this.updated = serviceResponse.senast_uppdaterad
        this.system = serviceResponse.systemstod
        this.init()
    }

    init() {
        this.element = this.createItem()
    }

    createItem() {
        const li = createQuickElement("li")

        const label = createQuickElement("label")
        label.dataset.service = this.id
        const button = createQuickElement("button", "goto")
        button.addEventListener("click", () => {
            populate(button)
            closeAriaParents(button)
        })

        label.append(toCapitalizedSentence(this.name), button)
        li.append(label)
        return li
    }
}

class Category {
    constructor(categoryResponse, arrayOfInstructionResponses) {
        this.id = categoryResponse.id
        this.text = categoryResponse.namn
        this.alternativ_namn = categoryResponse.alternativ_namn
        this.instructions = new Set(arrayOfInstructionResponses)
        this.init()
    }

    init() {

        this.navigationElement = this.createNavigationElement()
        this.section = this.createSection()
    }

    createSection() {
        const section = createQuickElement("section")

        const tableOfContentArticle = createQuickElement("article")

        const tableOfContentTitle = createQuickElement("h2")
        tableOfContentTitle.textContent = toCapitalizedSentence(this.text)

        const tableOfContentList = createQuickElement("ul", "sectionNav")
        this.instructions.forEach(instruction => tableOfContentList.append(instruction.sectionLink))

        tableOfContentArticle.append(tableOfContentTitle, tableOfContentList)
        section.append(tableOfContentArticle)

        this.instructions.forEach(instruction => {
            section.append(instruction.article)
        })

        return section
    }

    createNavigationElement() {
        const li = createQuickElement("li", "expandable", { "aria-expanded": "false" })
        const label = createQuickElement("label")
        label.textContent = toCapitalizedSentence(this.text)

        const button = createQuickElement("button", "expand", { "type": "button", "aria-label": `Öppnar eller minimerar undermeny för sektionen ${this.title}` })
        button.addEventListener("click", flipAriaExpanded)
        label.append(button)

        const ul = createQuickElement("ul")
        this.instructions.forEach(instruction => ul.append(instruction.navLink))

        li.append(label, ul)
        return li
    }
}
class Instruction {
    constructor(instructionResponse) {
        this.id = instructionResponse.id
        this.title = instructionResponse.titel
        this.category = instructionResponse.kategori
        this.instruction = instructionResponse.instruktion
        this.instructionParagraphs = this.instruction.split(/\n{1,}/gi) //TODO: förbättra
        this.important_information = JSON.parse(instructionResponse.viktig_information)  //FIXME: TEMP
        this.images = JSON.parse(instructionResponse.bilder)  //FIXME: TEMP
        this.source = instructionResponse.kalla
        this.alternative_title = instructionResponse.alternativ_titel
        this.alternative_instruction = instructionResponse.alternativ_instruktion
        this.system = instructionResponse.systemstod
        this.service = instructionResponse.tjanst
        this.created = instructionResponse.skapad
        this.updated = instructionResponse.senast_uppdaterad

        this.init()
    }

    init() {
        this.navLink = this.createNavigationLink()
        this.sectionLink = this.createNavigationLink()
        this.article = this.createArticle()
    }

    createArticle() {
        const article = createQuickElement("article", false, { id: this.id })
        const h3 = createQuickElement("h3")
        h3.textContent = toCapitalizedSentence(this.title)
        article.append(h3)

        for (let important_information of this.important_information) {
            const warning = createQuickElement("p", "warning")
            warning.innerText = toCapitalizedSentence(important_information)
            article.append(warning)
        }

        for (let instructionParagraph of this.instructionParagraphs) {
            const instruction = createQuickElement("p")
            instruction.innerText = toCapitalizedSentence(instructionParagraph.trim().replace(/\.([A-ö])/gi, ". $1"))
            article.append(instruction)
        }

        for (let imageSrc of this.images) {
            const element = createQuickElement("picture")
            const srcsetWebp = createQuickElement("source", null, {
                "width": `${window.innerWidth}`,
                "height": `${Math.floor(window.innerWidth * (9 / 16))}`,
                "srcset": this.createSrcSetString(imageSrc, "webp"),
            })
            const srcsetPng = createQuickElement("source", null, {
                "srcset": this.createSrcSetString(imageSrc, "png"),
                "height": `${Math.floor(window.innerWidth * (9 / 16))}`,
                "srcset": this.createSrcSetString(imageSrc, "webp"),
            })
            const src = createQuickElement("img", null, {
                "src": `./img/instructions/${imageSrc}.png`,
                "alt": `Bild som beskriver avsnittet ${this.title}`,
                "width": `${window.innerWidth}`,
            })
            element.addEventListener("click", () => {
                const modal = document.querySelector(".modal")
                modal.classList.add("active")
                modal.querySelector("img").src = `./img/original/${imageSrc}.png`
            })
            element.append(srcsetWebp, srcsetPng, src)
            article.append(element)
        }

        observer.observe(article)
        return article
    }

    createNavigationLink() {
        const li = createQuickElement("li")

        const aLink = createQuickElement("a")
        aLink.href = `#${this.id}`
        aLink.textContent = toCapitalizedSentence(this.title)
        aLink.addEventListener("click", (e) => {
            e.preventDefault()
            closeAriaParents(aLink)
            const targetElement = document.getElementById(this.id)
            targetElement.scrollIntoView()
            updateShortcuts(targetElement)
        })

        li.append(aLink)

        return li
    }

    createSrcSetString(filename, format) {
        const availableSizes = [
            "192",
            "240",
            "320",
            "480",
            "640",
            "750",
            "1080",
        ]
        const basePath = `./img/`
        let srcsetString = ""

        for (let size of availableSizes) {
            srcsetString += `${basePath}${size}w/${filename}.${format} ${size}w, `
        }

        return srcsetString
    }
}