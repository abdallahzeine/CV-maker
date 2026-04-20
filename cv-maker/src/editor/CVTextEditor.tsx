import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useDispatch } from '../store';
import { useEditorContext } from './focusedEditorContext';

interface CVTextEditorProps {
  value: string;
  path: string;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}

export function CVTextEditor({
  value,
  path,
  className = '',
  placeholder = 'Click to edit...',
  multiline = false,
}: CVTextEditorProps) {
  const dispatch = useDispatch();
  const { registerEditor } = useEditorContext();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        hardBreak: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: `cv-text-content ${className}`.trim(),
      },
      handleKeyDown: (_view, event) => {
        if (!multiline && event.key === 'Enter') {
          event.preventDefault();
          return true;
        }
        return false;
      },
    },
    onFocus: ({ editor: focusedEditor }) => {
      registerEditor(focusedEditor);
    },
    onUpdate: ({ editor: updatedEditor }) => {
      dispatch({ op: 'set', path, value: updatedEditor.getHTML() });
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() === value) return;
    editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  if (!editor) {
    return null;
  }

  return (
    <EditorContent
      editor={editor}
      className={`cv-text-editor ${multiline ? 'multiline' : 'single-line'}`}
    />
  );
}
