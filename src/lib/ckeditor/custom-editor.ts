// lib/ckeditor/custom-editor.ts
import { ClassicEditor as ClassicEditorBase } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Bold, Italic, Strikethrough, Underline } from '@ckeditor/ckeditor5-basic-styles';
import { Link } from '@ckeditor/ckeditor5-link';
import { List } from '@ckeditor/ckeditor5-list';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { Table, TableToolbar } from '@ckeditor/ckeditor5-table';
import { PasteFromOffice } from '@ckeditor/ckeditor5-paste-from-office';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { Font, FontFamily, FontSize, FontColor, FontBackgroundColor } from '@ckeditor/ckeditor5-font';
import { Image, ImageCaption, ImageStyle, ImageToolbar, ImageUpload, ImageResize } from '@ckeditor/ckeditor5-image';
import { RemoveFormat } from '@ckeditor/ckeditor5-remove-format';
import { SimpleUploadAdapter } from '@ckeditor/ckeditor5-upload';

export default class CustomEditor extends ClassicEditorBase {
    public static override builtinPlugins = [
        Essentials,
        Paragraph,
        Bold,
        Italic,
        Underline,
        Strikethrough,
        Link,
        List,
        Heading,
        BlockQuote,
        Table,
        TableToolbar,
        PasteFromOffice,
        Alignment,
        Font,
        FontFamily,
        FontSize,
        FontColor,
        FontBackgroundColor,
        Image,
        ImageCaption,
        ImageStyle,
        ImageToolbar,
        ImageUpload,
        ImageResize,
        RemoveFormat,
        SimpleUploadAdapter
    ];
}
