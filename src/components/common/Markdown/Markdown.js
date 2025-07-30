import React, { useMemo } from 'react';
import { Remarkable } from 'remarkable';

const defaultMarkdown = new Remarkable('commonmark', {
    breaks: true,
});

export default function Markdown({ src, md = defaultMarkdown, ...divProps }) {
    const htmlContent = useMemo(() => md.render(src), [src, md]);
    return <div {...divProps} dangerouslySetInnerHTML={{__html: htmlContent}} />
}