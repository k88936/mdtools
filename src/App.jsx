import MarkdownIt from 'markdown-it';
import highlightJs from 'highlight.js'
import highlightStyles from 'highlight.js'
import 'highlight.js/styles/default.css';
import Markdown from "@jetbrains/ring-ui-built/components/markdown/markdown";
import Footer from "@jetbrains/ring-ui-built/components/footer/footer";
import {Grid} from "@jetbrains/ring-ui-built/components/grid/grid";
import Row from "@jetbrains/ring-ui-built/components/grid/row";
import Col from "@jetbrains/ring-ui-built/components/grid/col";

import Header, {HeaderIcon} from "@jetbrains/ring-ui-built/components/header/header";
import Tray from "@jetbrains/ring-ui-built/components/header/tray";

import CodeMirror from '@uiw/react-codemirror';
import {markdown, markdownLanguage} from '@codemirror/lang-markdown';
import {languages} from '@codemirror/language-data';
import {useCallback, useState} from "react";
import {vscodeDark} from '@uiw/codemirror-theme-vscode'
import Island from "@jetbrains/ring-ui-built/components/island/island";
import Text from "@jetbrains/ring-ui-built/components/text/text";
import Upload from "@jetbrains/ring-ui-built/components/upload/upload";
import mathjsx3 from 'markdown-it-mathjax3'
import mermaidItMarkdown from 'mermaid-it-markdown'
import {full as emoji} from 'markdown-it-emoji'
import taskList from 'markdown-it-task-lists'
import Panel from "@jetbrains/ring-ui-built/components/panel/panel";
import clipboard from "@jetbrains/ring-ui-built/components/clipboard/clipboard";
import Button from "@jetbrains/ring-ui-built/components/button/button";
import alertService from "@jetbrains/ring-ui-built/components/alert-service/alert-service";
import html2pdf from "html2pdf.js";
import Input from "@jetbrains/ring-ui-built/components/input/input";
import {ControlsHeight} from "@jetbrains/ring-ui-built/components/global/controls-height";

const initialCode = `## Title

\`\`\`jsx
function Demo() {
  return <div>demo</div>
}
\`\`\`

\`\`\`bash
# Not dependent on uiw.
npm install @codemirror/lang-markdown --save
npm install @codemirror/language-data --save
\`\`\`

[weisit ulr](https://uiwjs.github.io/react-codemirror/)

\`\`\`go
package main
import "fmt"
func main() {
  fmt.Println("Hello, 世界")
}
\`\`\`
`;

function CM({value, onChange}) {
    return <CodeMirror
        onChange={onChange}
        value={value}
        theme={vscodeDark}
        extensions={[markdown({base: markdownLanguage, codeLanguages: languages})]}
        style={{
            margin: 4
        }}
    />;
}

function Preview({text}) {
    const markdownIt = new MarkdownIt('commonmark', {
        html: true,
        linkify: true,
        highlight: (str, lang) => {
            if (lang && highlightJs.getLanguage(lang)) {
                return highlightJs.highlight(str, {
                    language: lang
                }).value;
            }
            return '';
        }
    }).enable('table')
        .use(mathjsx3)
        .use(mermaidItMarkdown)
        .use(emoji)
        .use(taskList);

    const renderedMarkdown = markdownIt.render(text);
    return (
        <Markdown className={highlightStyles.highlightContainer}>
            <div dangerouslySetInnerHTML={{__html: renderedMarkdown}}/>
        </Markdown>
    );
}

function UploadDemo({onMarkdownLoaded}) {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [variant, setVariant] = useState('empty');

    const filesSelected = useCallback((files) => {
        const file = files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            onMarkdownLoaded(e.target.result);
            setSelectedFiles([file]);
            setVariant('success');
        };
        reader.onerror = () => {
            setVariant('error');
        };
        reader.readAsText(file);
    }, [onMarkdownLoaded]);

    const onFilesRejected = useCallback(() => {
        setVariant('error');
        setSelectedFiles([]);
    }, []);

    const validate = useCallback((file) => {
        return file.name.toLowerCase().endsWith('.md') || file.type === 'text/markdown';
    }, []);

    return (
        <Upload
            multiple={false}
            accept=".md,text/markdown"
            validate={validate}
            onFilesSelected={filesSelected}
            onFilesRejected={onFilesRejected}
            variant={variant}>
            <div>
                {selectedFiles.length
                    ? selectedFiles.map(f => f.name).join(', ')
                    : 'Browse or Drop a .md file'}
            </div>
        </Upload>
    );
}

function App() {
    const [text, setText] = useState(initialCode);

    let footer = <Footer className='stuff'
                         left={[[{
                             url: 'http://www.github.com/k88936/mdtools/',
                             label: 'mdtools'
                         }, ' by k88936'], 'v0.1.0']}

                         right={[{
                             url: 'http://www.github.com/k88936/mdtools/issues',
                             label: 'Feedback'
                         }]}/>;
    let hhhh = <Header

        >

            <img
                src={import.meta.env.BASE_URL + 'markdown.svg'}
                alt="Markdown logo"
                style={{verticalAlign: 'middle'}}
            />
            <Tray>
                <Text size={Text.Size.L} bold>mdtools</Text>
            </Tray>

            <Tray>
                <HeaderIcon
                    icon="<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;20&quot; height=&quot;20&quot; fill=&quot;currentColor&quot; viewBox=&quot;0 0 20 20&quot;><path fill-rule=&quot;evenodd&quot; d=&quot;M17.5 10a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0ZM10 19a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm.086-12.686c.357 0 .668.114.932.343.264.229.396.514.396.857 0 .314-.096.593-.289.836a5.36 5.36 0 0 1-.653.686c-.329.285-.618.6-.868.942-.25.343-.375.729-.375 1.158 0 .2.075.367.225.503.15.136.325.204.525.204a.763.763 0 0 0 .546-.215.987.987 0 0 0 .29-.535c.057-.3.185-.568.385-.804.2-.236.415-.46.643-.675.329-.314.61-.657.847-1.028a2.28 2.28 0 0 0 .353-1.243c0-.729-.296-1.325-.89-1.79-.592-.464-1.281-.696-2.067-.696a3.65 3.65 0 0 0-1.554.343 2.396 2.396 0 0 0-1.125 1.05.773.773 0 0 0-.096.546c.036.193.132.34.29.44.2.114.406.15.62.107a.853.853 0 0 0 .536-.365 1.662 1.662 0 0 1 1.329-.664Zm-.129 8.829c.3 0 .554-.104.761-.311.207-.207.31-.46.31-.76s-.103-.554-.31-.761a1.034 1.034 0 0 0-.76-.311c-.3 0-.554.103-.761.31-.207.208-.311.461-.311.761s.104.554.31.761c.208.207.461.31.761.31Z&quot; clip-rule=&quot;evenodd&quot;/></svg>"
                    title="Help"
                />
            </Tray>
        </Header>
    ;

    async function generatePDF() {
        // Wait one tick so the preview element is definitely in the DOM
        await new Promise(res => setTimeout(res, 0));

        const element = document.getElementById('markdown-preview');
        if (!element) {
            console.error('Preview element not found');
            return;
        }

        const opt = {
            margin: 0,
            filename: `${filename}.pdf`,
            image: {type: 'jpeg', quality: 0.98},
            html2canvas: {scale: 2},
            jsPDF: {
                unit: 'px',
                format: [element.scrollWidth, element.scrollHeight],
                orientation: 'portrait'
            }
        };
        await html2pdf().set(opt).from(element).save();
    }

    const TODAY = new Date().toISOString().slice(0, 13)
    const [filename, setfilename] = useState(TODAY);
    return (
        <>
            {hhhh}
            <Grid>
                <Row start='xs'>
                    <Col xs={6}>
                        <UploadDemo onMarkdownLoaded={setText}/>
                        <Island>
                            <CM value={text} onChange={setText}/>
                            <Panel>
                                <Button onClick={() => alertService.warning('Warning! not implemented')}
                                        primary>Paste</Button>
                                <Button
                                    onClick={() => clipboard.copyText(text, 'Text copied!', 'Text copying error')}>{'Copy'}</Button>
                            </Panel>
                        </Island>
                    </Col>
                    <Col xs={6}>


                        <Row start='xs'>
                            <Col xs={10}>
                                <Input label='filename' height={ControlsHeight.S} value={filename}
                                       onChange={e => setfilename(e.currentTarget.value)} defaultValue={TODAY}
                                       autogrow onClear={() => setfilename('')}/>
                            </Col>
                            <Col xs={2}>
                                <Button onClick={generatePDF} style={{marginTop: 10, width: '100%'}}
                                        height={ControlsHeight.L}
                                        primary>save</Button>
                            </Col>
                        </Row>
                        <div id={'markdown-preview'}>
                            <Island style={{padding: 16}}>
                                <Preview text={text}/>
                            </Island>
                        </div>
                    </Col>
                </Row>
            </Grid>

            {footer}
        </>

    )
}

export default App
