class Page {
    constructor(pageInfo) {
        const { id, title, pagecontent } = pageInfo
        this.id = id
        this.title = title
        this.parts = pagecontent
        this.article = this.createArticle()
        this.navLink = this.createNavigationLink()
        this.sectionLink = this.createNavigationLink()
    }

    createArticle() {
        const article = createQuickElement("article", false, { id: this.id })
        const h3 = createQuickElement("h3")
        h3.textContent = this.title
        article.append(h3)
        for (let part of this.parts) {
            const { type, content, specialFormat } = part
            let element
            if (type === "paragraph") element = this.createParagraphElement(content, specialFormat)
            if (type === "image") element = this.createPictureElement(content, specialFormat)
            if (type === "h4") element = this.createH4Element(content, specialFormat)
            if (type === "listitem") element = this.createListItemElement(content, specialFormat)
            article.append(element)
        }
        return article
    }

    createNavigationLink() {
        const li = createQuickElement("li")

        const aLink = createQuickElement("a")
        aLink.href = `#${this.id}`
        aLink.textContent = this.title
        aLink.addEventListener("click", () => {
            closeAriaParents(aLink)
        })

        li.append(aLink)

        return li
    }

    createParagraphElement(content, specialFormat) {
        const element = createQuickElement("p", `${specialFormat}`)
        element.textContent = content
        return element
    }

    createPictureElement(content, specialFormat) {
        const element = createQuickElement("picture", `${specialFormat}`)
        const srcsetWebp = createQuickElement("source", null, {
            "width": `${window.innerWidth}`,
            "height": `${Math.floor(window.innerWidth * (9 / 16))}`,
            "srcset": this.createSrcSetString(content, "webp"),
        })
        const srcsetPng = createQuickElement("source", null, {
            "srcset": this.createSrcSetString(content, "png"),
            "height": `${Math.floor(window.innerWidth * (9 / 16))}`,
            "srcset": this.createSrcSetString(content, "webp"),
        })
        const src = createQuickElement("img", null, {
            "src": `./img/instructions/${content}.png`,
            "alt": `Bild som beskriver avsnittet ${this.title}`,
            "width": `${window.innerWidth}`,
            "loading": "lazy"
        })
        element.addEventListener("click", () => {
            const modal = document.querySelector(".modal")
            modal.classList.add("active")
            modal.querySelector("img").src = `./img/original/${content}.png`
        })
        element.append(srcsetWebp, srcsetPng, src)

        return element
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

    createH4Element(content, specialFormat) {
        const h4 = createQuickElement("h4")
        h4.textContent = content
        return h4
    }

    createListItemElement(content, specialFormat) {
        // TODO: ändra till bättre semantik - riktig ul m li
        const listitem = createQuickElement("span", "listitem")
        listitem.textContent = content
        return listitem
    }
}

class Section {
    constructor(sectionInfo) {
        const { sectionTitle, pages } = sectionInfo
        this.title = sectionTitle
        this.pages = this.createPages(pages)
        this.element = this.createSectionElement()
        this.navigationElement = this.createNavigationElement()
    }

    createPages(pages) {
        const allPages = []
        for (let page of pages) {
            allPages.push(new Page(page))
        }
        return allPages
    }

    createSectionElement() {
        const section = createQuickElement("section")

        const tableOfContentArticle = createQuickElement("article")

        const tableOfContentTitle = createQuickElement("h2")
        tableOfContentTitle.textContent = this.title

        const tableOfContentList = createQuickElement("ul", "sectionNav")

        tableOfContentArticle.append(tableOfContentTitle, tableOfContentList)
        section.append(tableOfContentArticle)

        for (let page of this.pages) {
            tableOfContentList.append(page.sectionLink)
            section.append(page.article)
        }
        return section
    }

    createNavigationElement() {
        const li = createQuickElement("li")
        const span = createQuickElement("span", "expand")
        span.textContent = this.title
        span.addEventListener("click", flipAriaExpanded)

        const ul = createQuickElement("ul", false, { "aria-expanded": false })
        for (let page of this.pages) {
            ul.append(page.navLink)
        }

        li.append(span, ul)
        return li
    }
}