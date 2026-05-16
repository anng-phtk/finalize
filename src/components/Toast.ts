import { Component } from "../core/Component";

export type ToastTypes = "in progress" | "info" | "success" | "warning" | "error";

class Toast extends Component {
    constructor(container: string, templatePath: string) {
        super(container, templatePath);
    }

    public bindEvents(): void {
        const closeBtn = this.getElement<HTMLButtonElement>("btn-close")

        closeBtn.addEventListener("click", () => {
            this.container?.removeChild(this.element);
        });
    }
}

const toast = new Toast();