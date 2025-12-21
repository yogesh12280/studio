'use client'

import React, { useEffect, useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
    ClassicEditor,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Paragraph,
    Essentials,
    Heading,
    Link,
    List,
    BlockQuote,
    RemoveFormat,
    FontFamily,
    FontSize,
    FontColor,
    FontBackgroundColor,
    Alignment,
    Image,
    ImageToolbar,
    ImageStyle,
    ImageResize,
    ImageUpload,
    ImageCaption,
    PasteFromOffice,
    Table,
    Autoformat,
    SimpleUploadAdapter,
} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import { Skeleton } from './skeleton';

interface EditorProps {
    value: string;
    onChange: (data: string) => void;
}

const Editor: React.FC<EditorProps> = ({ value, onChange }) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return <Skeleton className="h-48 w-full" />;
    }

    return (
        <CKEditor
            editor={ClassicEditor}
            data={value}
            config={{
                plugins: [
                    Essentials,
                    Bold,
                    Italic,
                    Underline,
                    Strikethrough,
                    Paragraph,
                    Heading,
                    Link,
                    List,
                    BlockQuote,
                    RemoveFormat,
                    FontFamily,
                    FontSize,
                    FontColor,
                    FontBackgroundColor,
                    Alignment,
                    Image,
                    ImageToolbar,
                    ImageStyle,
                    ImageResize,
                    ImageUpload,
                    ImageCaption,
                    PasteFromOffice,
                    Table,
                    Autoformat,
                    SimpleUploadAdapter
                ],
                toolbar: {
                    items: [
                        'heading',
                        '|',
                        'bold',
                        'italic',
                        'underline',
                        'strikethrough',
                        '|',
                        'fontFamily',
                        'fontSize',
                        'fontColor',
                        'fontBackgroundColor',
                        '|',
                        'alignment',
                        '|',
                        'numberedList',
                        'bulletedList',
                        '|',
                        'link',
                        'insertTable',
                        'blockQuote',
                        '|',
                        'imageUpload',
                        '|',
                        'undo',
                        'redo',
                        'removeFormat',
                    ],
                },
                image: {
                    toolbar: [
                        'imageTextAlternative',
                        'imageStyle:inline',
                        'imageStyle:block',
                        'imageStyle:side',
                        '|',
                        'resizeImage',
                    ],
                    resizeOptions: [
                        {
                            name: 'resizeImage:original',
                            label: 'Original',
                            value: null,
                        },
                        {
                            name: 'resizeImage:50',
                            label: '50%',
                            value: '50',
                        },
                        {
                            name: 'resizeImage:75',
                            label: '75%',
                            value: '75',
                        },
                    ],
                },
                fontFamily: {
                    options: [
                        'default',
                        'Arial, Helvetica, sans-serif',
                        'Courier New, Courier, monospace',
                        'Georgia, serif',
                        'Times New Roman, Times, serif',
                        'Verdana, Geneva, sans-serif',
                    ],
                },
                fontSize: {
                    options: [10, 12, 14, 'default', 18, 20, 24, 32],
                },
            }}
            onChange={(event, editor) => {
                const data = editor.getData();
                onChange(data);
            }}
        />
    );
};

export default Editor;
