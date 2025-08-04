'use client';

import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useSocket } from '@/hooks/useSocket';
import { useAppSelector } from '@/lib/store';
import { Document } from '@/types';

// Client-side only component to prevent SSR issues
const ClientOnlyEditor = ({ children }: { children: React.ReactNode }) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <div className="flex-1 flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading editor...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

interface TextEditorProps {
    document: Document | null;
    roomId: string;
    isConnected: boolean;
}

export default function TextEditor({ document, roomId, isConnected }: TextEditorProps) {
    const { sendDocumentUpdate, sendTypingIndicator, onDocumentUpdate, onTypingIndicator } = useSocket();
    const { user } = useAppSelector((state) => state.auth);
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const editor = useEditor({
        extensions: [StarterKit],
        content: document?.content || '',
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose prose-lg max-w-none focus:outline-none p-6',
            },
        },
        onUpdate: ({ editor }) => {
            const content = editor.getHTML();

            // Emit typing indicator
            if (user) {
                sendTypingIndicator(roomId, user.id, user.username, true);

                // Clear previous timeout
                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                }

                // Set timeout to stop typing indicator
                typingTimeoutRef.current = setTimeout(() => {
                    sendTypingIndicator(roomId, user.id, user.username, false);
                }, 1000);

                // Emit document update with debouncing
                if (document?.id) {
                    sendDocumentUpdate(document.id, content, user.id, roomId);
                }
            }
        },
    });

    useEffect(() => {
        if (editor && document) {
            // Only update if content is different to avoid cursor jumping
            const currentContent = editor.getHTML();
            if (currentContent !== document.content) {
                editor.commands.setContent(document.content);
            }
        }
    }, [document, editor]);

    useEffect(() => {
        // Listen for document updates from other users
        const handleDocumentUpdate = (data: any) => {
            console.log('📝 Received document update:', data);
            if (editor && document && data.documentId === document.id && data.userId !== user?.id) {
                // Update content without triggering onUpdate
                const currentContent = editor.getHTML();
                if (currentContent !== data.content) {
                    console.log('🔄 Updating editor content from:', currentContent.substring(0, 50), 'to:', data.content.substring(0, 50));
                    editor.commands.setContent(data.content);
                }
            }
        };

        // Listen for typing indicators
        const handleTypingIndicator = (data: any) => {
            if (data.userId !== user?.id) {
                setIsTyping(data.isTyping);
            }
        };

        onDocumentUpdate(handleDocumentUpdate);
        onTypingIndicator(handleTypingIndicator);

        return () => {
            // Cleanup is handled by the useSocket hook
        };
    }, [editor, document, user, onDocumentUpdate, onTypingIndicator]);

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    if (!document) {
        return (
            <div className="flex-1 flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className="text-gray-400 text-6xl mb-4">📄</div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Document Selected</h3>
                    <p className="text-gray-500">Select a document from the sidebar to start editing</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-white">
            {/* Editor Toolbar */}
            <div className="border-b border-gray-200 px-6 py-3 bg-gray-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => editor?.chain().focus().toggleBold().run()}
                            className={`p-2 rounded ${editor?.isActive('bold') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            <strong>B</strong>
                        </button>
                        <button
                            onClick={() => editor?.chain().focus().toggleItalic().run()}
                            className={`p-2 rounded ${editor?.isActive('italic') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            <em>I</em>
                        </button>
                        <button
                            onClick={() => editor?.chain().focus().toggleStrike().run()}
                            className={`p-2 rounded ${editor?.isActive('strike') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            <s>S</s>
                        </button>
                        <div className="w-px h-6 bg-gray-300"></div>
                        <button
                            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                            className={`p-2 rounded ${editor?.isActive('heading', { level: 1 }) ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            H1
                        </button>
                        <button
                            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                            className={`p-2 rounded ${editor?.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            H2
                        </button>
                        <button
                            onClick={() => editor?.chain().focus().toggleBulletList().run()}
                            className={`p-2 rounded ${editor?.isActive('bulletList') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            •
                        </button>
                        <button
                            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                            className={`p-2 rounded ${editor?.isActive('orderedList') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            1.
                        </button>
                    </div>

                    {/* Connection and typing status */}
                    <div className="flex items-center space-x-4">
                        {isTyping && (
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <div className="flex space-x-1">
                                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                                <span>Someone is typing...</span>
                            </div>
                        )}

                        <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-sm text-gray-600">
                                {isConnected ? 'Live' : 'Offline'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 overflow-auto">
                <ClientOnlyEditor>
                    <EditorContent editor={editor} />
                </ClientOnlyEditor>
            </div>
        </div>
    );
} 