import MarkdownIt from 'markdown-it'
import highlightJs from 'highlight.js'
import 'highlight.js/styles/default.css'
import Markdown from '@jetbrains/ring-ui-built/components/markdown/markdown'
import {Grid} from '@jetbrains/ring-ui-built/components/grid/grid'
import Row from '@jetbrains/ring-ui-built/components/grid/row'
import Col from '@jetbrains/ring-ui-built/components/grid/col'

import CodeMirror from '@uiw/react-codemirror'
import {markdown, markdownLanguage} from '@codemirror/lang-markdown'
import {languages} from '@codemirror/language-data'
import {useCallback, useState} from 'react'
import {vscodeDark} from '@uiw/codemirror-theme-vscode'
import Island from '@jetbrains/ring-ui-built/components/island/island'
import Upload from '@jetbrains/ring-ui-built/components/upload/upload'
import mathjsx3 from 'markdown-it-mathjax3'
import mermaidItMarkdown from 'mermaid-it-markdown'
import {full as emoji} from 'markdown-it-emoji'
import taskList from 'markdown-it-task-lists'
import Panel from '@jetbrains/ring-ui-built/components/panel/panel'
import clipboard from '@jetbrains/ring-ui-built/components/clipboard/clipboard'
import Button from '@jetbrains/ring-ui-built/components/button/button'
import alertService from '@jetbrains/ring-ui-built/components/alert-service/alert-service'
import html2pdf from 'html2pdf.js'
import Input from '@jetbrains/ring-ui-built/components/input/input'
import {ControlsHeight} from '@jetbrains/ring-ui-built/components/global/controls-height'

const initialCode = `\n## Title\n\n\n\`\`\`jsx\nfunction Demo() {\n  return <div>demo</div>\n}\n\`\`\`\n\n\n\`\`\`bash\n# Not dependent on uiw.\nnpm install @codemirror/lang-markdown --save\nnpm install @codemirror/language-data --save\n\`\`\`\n\n[weisit ulr](https://uiwjs.github.io/react-codemirror/)\n\n\n\`\`\`go\npackage main\nimport "fmt"\nfunc main() {\n  fmt.Println("Hello, 世界")\n}\n\`\`\`\n`

interface CodeAreaProps {
    value: string
    onChange: (value: string) => void
}

function CodeArea({value, onChange}: CodeAreaProps) {
    return (
        <CodeMirror
            onChange={(val) => onChange(val)}
            value={value}
            theme={vscodeDark}
            extensions={[markdown({base: markdownLanguage, codeLanguages: languages})]}
            style={{
                margin: 4,
            }}
        />
    )
}

interface PreviewAreaProps {
    text: string
}

function PreviewArea({text}: PreviewAreaProps) {
    const markdownIt = new MarkdownIt('commonmark', {
        html: true,
        linkify: true,
        highlight: (str: string, lang: string) => {
            if (lang && highlightJs.getLanguage(lang)) {
                return highlightJs.highlight(str, {
                    language: lang,
                }).value
            }
            return ''
        },
    })
        .enable('table')
        .use(mathjsx3)
        .use(mermaidItMarkdown)
        .use(emoji)
        .use(taskList)

    const renderedMarkdown = markdownIt.render(text)
    return (
        <Markdown>
            <div dangerouslySetInnerHTML={{__html: renderedMarkdown}}/>
        </Markdown>
    )
}

interface UploadAreaProps {
    onMarkdownLoaded: (markdown: string) => void
}

function UploadArea({onMarkdownLoaded}: UploadAreaProps) {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [variant, setVariant] = useState<'empty' | 'success' | 'error'>('empty')

    const filesSelected = useCallback((files: File[]) => {
        const file = files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            const content = (e.target as FileReader).result as string
            onMarkdownLoaded(content)
            setSelectedFiles([file])
            setVariant('success')
        }
        reader.onerror = () => {
            setVariant('error')
        }
        reader.readAsText(file)
    }, [onMarkdownLoaded])

    const onFilesRejected = useCallback(() => {
        setVariant('error')
        setSelectedFiles([])
    }, [])

    const validate = useCallback((file: File) => {
        return file.name.toLowerCase().endsWith('.md') || file.type === 'text/markdown'
    }, [])

    return (
        <Upload
            multiple={false}
            accept=".md,text/markdown"
            validate={validate}
            onFilesSelected={filesSelected}
            onFilesRejected={onFilesRejected}
            variant={variant}
        >
            <div>
                {selectedFiles.length
                    ? selectedFiles.map((f) => f.name).join(', ')
                    : 'Browse or Drop a .md file'}
            </div>
        </Upload>
    )
}

async function generatePDF(filename: string): Promise<void> {
    // Wait one tick so the preview element is definitely in the DOM
    await new Promise((res) => setTimeout(res, 0))

    const element = document.getElementById('markdown-preview')
    if (!element) {
        console.error('Preview element not found')
        return
    }

    interface Html2PdfOptions {
        margin?: number | [number, number] | [number, number, number, number];
        filename?: string;
        image?: {
            type?: "jpeg" | "png" | "webp";
            quality?: number;
        };
        enableLinks?: boolean;
        html2canvas?: object;
        jsPDF?: {
            unit?: string;
            format?: string | [number, number];
            orientation?: "portrait" | "landscape";
        };
    }


    const opt: Html2PdfOptions = {
        margin: 0,
        filename: `${filename}.pdf`,
        image: {type: 'jpeg', quality: 0.98},
        html2canvas: {scale: 2},
        jsPDF: {
            unit: 'px',
            format: [element.scrollWidth, element.scrollHeight],
            orientation: 'portrait' as const,
        },
    }
    await html2pdf().set(opt).from(element).save()
}

const TODAY = new Date().toISOString().slice(0, 13)

function App() {
    const [text, setText] = useState<string>(initialCode)
    const [filename, setfilename] = useState<string>(TODAY)

    return (
        <>
            <Grid>
                <UploadArea onMarkdownLoaded={setText}/>
                <Row start="xs">
                    {/*left*/}
                    <Col xs={6}>
                        <Island>
                            <CodeArea value={text} onChange={setText}/>
                            <Panel>
                                <Button onClick={() => alertService.warning('Warning! not implemented')} primary>
                                    Paste
                                </Button>
                                <Button onClick={() => clipboard.copyText(text, 'Text copied!', 'Text copying error')}>
                                    {'Copy'}
                                </Button>
                            </Panel>
                        </Island>
                    </Col>
                    {/*right*/}
                    <Col xs={6}>
                        <div id={'markdown-preview'}>
                            <Island style={{padding: 16}}>
                                <PreviewArea text={text}/>
                            </Island>
                        </div>
                        <Row start="xs">
                            <Col xs={10}>
                                <Input
                                    label="filename"
                                    height={ControlsHeight.S}
                                    value={filename}
                                    onChange={(e) => setfilename(e.currentTarget.value)}
                                    defaultValue={TODAY}
                                    autogrow
                                    onClear={() => setfilename('')}
                                />
                            </Col>
                            <Col xs={2}>
                                <Button onClick={() => generatePDF(filename)} style={{width: '100%'}}
                                        height={ControlsHeight.L} primary>
                                    save
                                </Button>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Grid>
        </>
    )
}

export default App
