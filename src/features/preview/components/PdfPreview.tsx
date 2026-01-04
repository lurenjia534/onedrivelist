interface PdfPreviewProps {
    src: string;
    title: string;
}

export default function PdfPreview({ src, title }: PdfPreviewProps) {
    return (
        <div className="mt-4 w-full">
            <object
                data={src}
                type="application/pdf"
                aria-label={title}
                className="h-[75vh] w-full rounded-lg border border-gray-200 dark:border-gray-800"
            >
                <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    <p className="mb-2">无法在浏览器中预览该 PDF。</p>
                    <a
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black underline dark:text-white"
                    >
                        点击在新标签页中打开
                    </a>
                </div>
            </object>
        </div>
    );
}
