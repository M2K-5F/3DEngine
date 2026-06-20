export class Material {
    private constructor(
        public readonly url: string,
        public bitmap: ImageBitmap
    ) {}


    static async from(url: string) {
        try {
            const response = await fetch(url)
            const blob = await response.blob()
            
            const bitmap = await createImageBitmap(blob, {
                imageOrientation: "flipY"
            })

            return new Material(url, bitmap)
        } catch (e) {
            console.error("Ошибка загрузки текстуры:", e)
        }
    }
}
