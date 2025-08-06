'use client';

import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useSocket } from '@/hooks/useSocket';
import { useAppSelector } from '@/lib/store';
import { Document } from '@/types';

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
    const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastSentContentRef = useRef<string>('');
    const isUpdatingFromSocketRef = useRef<boolean>(false);

    const editor = useEditor({
        extensions: [StarterKit],
        content: document?.content || '',
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'text-black max-w-none focus:outline-none p-6  leading-relaxed',
            },
        },
        onUpdate: ({ editor }) => {
            if (!user || !document?.id || isUpdatingFromSocketRef.current) {
                return;
            }

            const content = editor.getHTML();

            // Only send update if content actually changed
            if (content === lastSentContentRef.current) {
                return;
            }

            // Emit typing indicator
            sendTypingIndicator(roomId, user.id, user.username, true);

            // Clear previous typing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Set timeout to stop typing indicator
            typingTimeoutRef.current = setTimeout(() => {
                sendTypingIndicator(roomId, user.id, user.username, false);
            }, 1000);

            // Clear previous update timeout
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }

            // Debounce document updates (300ms)
            updateTimeoutRef.current = setTimeout(() => {
                if (content !== lastSentContentRef.current) {
                    console.log('📤 Sending document update:', content.substring(0, 50));
                    sendDocumentUpdate(document.id, content, user.id, roomId);
                    lastSentContentRef.current = content;
                }
            }, 300);
        },
    });

    useEffect(() => {
        if (editor && document) {
            // Only update if content is different to avoid cursor jumping
            const currentContent = editor.getHTML();
            if (currentContent !== document.content) {
                console.log('🔄 Updating editor content from document:', document.content.substring(0, 50));
                isUpdatingFromSocketRef.current = true;
                editor.commands.setContent(document.content);
                lastSentContentRef.current = document.content;
                isUpdatingFromSocketRef.current = false;
            }
        }
    }, [document, editor]);

    useEffect(() => {
        // Listen for document updates from other users
        const handleDocumentUpdate = (data: { documentId: string; userId: string; content: string }) => {
            console.log('📝 Received document update:', data);
            if (editor && document && data.documentId === document.id && data.userId !== user?.id) {
                // Update content without triggering onUpdate
                const currentContent = editor.getHTML();
                if (currentContent !== data.content) {
                    console.log('🔄 Updating editor content from socket:', data.content.substring(0, 50));
                    isUpdatingFromSocketRef.current = true;
                    editor.commands.setContent(data.content);
                    lastSentContentRef.current = data.content;
                    isUpdatingFromSocketRef.current = false;
                }
            }
        };

        // Listen for typing indicators
        const handleTypingIndicator = (data: { userId: string; isTyping: boolean }) => {
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
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
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
                    </div>

                    {/* Connection and typing status */}
                    <div className="flex items-center space-x-4">
                        {isTyping && (
                            <div className="flex items-center space-x-2 text-sm text-black">
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