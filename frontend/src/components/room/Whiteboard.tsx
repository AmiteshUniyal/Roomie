'use client';

import { useEffect, useRef, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAppSelector } from '@/lib/store';
import { SocketEvents } from '@/types';

interface WhiteboardProps {
    roomId: string;
    isConnected: boolean;
}

type DrawingData = SocketEvents['canvas:draw'];

export default function Whiteboard({ roomId, isConnected }: WhiteboardProps) {
    const { sendCanvasDraw, onCanvasDraw, onCanvasClear, onCanvasStateLoaded, clearCanvas: socketClearCanvas } = useSocket();
    const { user } = useAppSelector((state) => state.auth);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const isDrawingRef = useRef(false);
    const lastPosRef = useRef<{ x: number; y: number } | null>(null);
    const otherUsersDrawingRef = useRef<Map<string, { x: number; y: number }>>(new Map());

    const [selectedColor, setSelectedColor] = useState('#000000');
    const [lineWidth, setLineWidth] = useState(2);
    const [selectedTool, setSelectedTool] = useState<'pen' | 'eraser'>('pen');
    const [isLoadingCanvas, setIsLoadingCanvas] = useState(false);

    const colors = [
        '#000000', '#FF0000', '#00FF00', '#0000FF',
        '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500',
        '#800080', '#008000', '#FFC0CB', '#A52A2A'
    ];

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Set canvas size
        const resizeCanvas = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Get context
        const context = canvas.getContext('2d');
        if (context) {
            context.lineCap = 'round';
            context.lineJoin = 'round';
            context.strokeStyle = selectedColor;
            context.lineWidth = lineWidth;
            contextRef.current = context;
        }

        return () => {
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    useEffect(() => {
        if (contextRef.current) {
            contextRef.current.strokeStyle = selectedColor;
            contextRef.current.lineWidth = lineWidth;
        }
    }, [selectedColor, lineWidth]);

    useEffect(() => {
        // Listen for drawing data from other users
        const handleDrawing = (data: DrawingData) => {
            if (data.userId === user?.id) return;

            const context = contextRef.current;
            if (!context) return;

            const { drawData } = data;

            // Set drawing style
            context.strokeStyle = drawData.color;
            context.lineWidth = drawData.brushSize;
            context.lineCap = 'round';
            context.lineJoin = 'round';

            if (drawData.type === 'start') {
                // Start a new path
                context.beginPath();
                context.moveTo(drawData.x, drawData.y);
                otherUsersDrawingRef.current.set(data.userId, { x: drawData.x, y: drawData.y });
            } else if (drawData.type === 'draw') {
                // Continue the path
                const lastPos = otherUsersDrawingRef.current.get(data.userId);
                if (lastPos) {
                    context.beginPath();
                    context.moveTo(lastPos.x, lastPos.y);
                    context.lineTo(drawData.x, drawData.y);
                    context.stroke();
                    // Update the last position
                    otherUsersDrawingRef.current.set(data.userId, { x: drawData.x, y: drawData.y });
                }
            } else if (drawData.type === 'end') {
                // End the path - clear the last position
                otherUsersDrawingRef.current.delete(data.userId);
            }
        };

        // Listen for canvas clear events from other users
        const handleCanvasClear = (data: SocketEvents['canvas:clear']) => {
            if (data.userId === user?.id) return;

            const canvas = canvasRef.current;
            const context = contextRef.current;
            if (canvas && context) {
                context.clearRect(0, 0, canvas.width, canvas.height);
                otherUsersDrawingRef.current.clear();
            }
        };

        // Listen for canvas state loaded events
        const handleCanvasStateLoaded = (data: SocketEvents['canvas:state:loaded']) => {
            setIsLoadingCanvas(true);

            const canvas = canvasRef.current;
            const context = contextRef.current;
            if (!canvas || !context) return;

            // Clear the canvas first
            context.clearRect(0, 0, canvas.width, canvas.height);
            otherUsersDrawingRef.current.clear();

            // Draw all existing strokes
            data.strokes.forEach((stroke) => {
                context.strokeStyle = stroke.color;
                context.lineWidth = stroke.brushSize;
                context.lineCap = 'round';
                context.lineJoin = 'round';

                if (stroke.type === 'start') {
                    context.beginPath();
                    context.moveTo(stroke.x, stroke.y);
                    otherUsersDrawingRef.current.set(stroke.userId, { x: stroke.x, y: stroke.y });
                } else if (stroke.type === 'draw') {
                    const lastPos = otherUsersDrawingRef.current.get(stroke.userId);
                    if (lastPos) {
                        context.beginPath();
                        context.moveTo(lastPos.x, lastPos.y);
                        context.lineTo(stroke.x, stroke.y);
                        context.stroke();
                    }
                    otherUsersDrawingRef.current.set(stroke.userId, { x: stroke.x, y: stroke.y });
                } else if (stroke.type === 'end') {
                    otherUsersDrawingRef.current.delete(stroke.userId);
                }
            });

            setIsLoadingCanvas(false);
            console.log(`📂 Loaded ${data.strokes.length} strokes from database`);
        };

        onCanvasDraw(handleDrawing);
        onCanvasClear(handleCanvasClear);
        onCanvasStateLoaded(handleCanvasStateLoaded);

        return () => {
            // Cleanup is handled by the useSocket hook
        };
    }, [user, onCanvasDraw, onCanvasClear, onCanvasStateLoaded]);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isConnected || !user) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        isDrawingRef.current = true;
        lastPosRef.current = { x, y };

        const context = contextRef.current;
        if (context) {
            context.beginPath();
            context.moveTo(x, y);
        }

        // Emit start drawing event
        sendCanvasDraw(roomId, user.id, {
            x,
            y,
            color: selectedColor,
            tool: selectedTool,
            strokeWidth: lineWidth,
            type: 'start',
        });
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawingRef.current || !isConnected || !user) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const context = contextRef.current;
        if (context && lastPosRef.current) {
            // Draw line from last position to current position
            context.beginPath();
            context.moveTo(lastPosRef.current.x, lastPosRef.current.y);
            context.lineTo(x, y);
            context.stroke();

            // Emit drawing data
            sendCanvasDraw(roomId, user.id, {
                x,
                y,
                color: selectedColor,
                tool: selectedTool,
                strokeWidth: lineWidth,
                type: 'draw',
            });

            lastPosRef.current = { x, y };
        }
    };

    const stopDrawing = () => {
        if (isDrawingRef.current && user) {
            // Emit end drawing event
            sendCanvasDraw(roomId, user.id, {
                x: lastPosRef.current?.x || 0,
                y: lastPosRef.current?.y || 0,
                color: selectedColor,
                tool: selectedTool,
                strokeWidth: lineWidth,
                type: 'end',
            });
            isDrawingRef.current = false;
            lastPosRef.current = null;
        }
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const context = contextRef.current;

        if (canvas && context && user) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            otherUsersDrawingRef.current.clear();

            // Emit clear event
            socketClearCanvas(roomId, user.id);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-white">
            {/* Toolbar */}
            <div className="border-b border-gray-200 px-6 py-3 bg-gray-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {/* Tool selection */}
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setSelectedTool('pen')}
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${selectedTool === 'pen'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                ✏️ Pen
                            </button>
                            <button
                                onClick={() => setSelectedTool('eraser')}
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${selectedTool === 'eraser'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                🧽 Eraser
                            </button>
                        </div>

                        {/* Color palette */}
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Color:</span>
                            <div className="flex space-x-1">
                                {colors.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setSelectedColor(color)}
                                        className={`w-6 h-6 rounded-full border-2 ${selectedColor === color ? 'border-gray-800' : 'border-gray-300'
                                            }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Line width */}
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Width:</span>
                            <input
                                type="range"
                                min="1"
                                max="20"
                                value={lineWidth}
                                onChange={(e) => setLineWidth(Number(e.target.value))}
                                className="w-20"
                            />
                            <span className="text-sm text-gray-600">{lineWidth}px</span>
                        </div>

                        {/* Clear button */}
                        <button
                            onClick={clearCanvas}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            🗑️ Clear
                        </button>
                    </div>

                    {/* Connection status */}
                    <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm text-gray-600">
                            {isConnected ? 'Live' : 'Offline'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 relative">
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="w-full h-full cursor-crosshair border border-gray-200"
                    style={{
                        backgroundColor: selectedTool === 'eraser' ? '#f3f4f6' : '#ffffff'
                    }}
                />

                {!isConnected && (
                    <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-red-600 text-4xl mb-2">⚠️</div>
                            <p className="text-gray-600">Connection lost. Reconnecting...</p>
                        </div>
                    </div>
                )}

                {isLoadingCanvas && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                            <p className="text-gray-600">Loading canvas...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 