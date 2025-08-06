import { prisma } from '../index';

export interface CanvasStroke {
    type: 'start' | 'draw' | 'end';
    x: number;
    y: number;
    color: string;
    brushSize: number;
    tool: 'pen' | 'eraser' | 'brush';
    userId: string;
    username: string;
    timestamp: number;
}

export interface CanvasState {
    strokes: CanvasStroke[];
    lastUpdated: Date;
}

export const canvasService = {
    // Save canvas state to database
    async saveCanvasState(roomId: string, state: CanvasState): Promise<void> {
        try {
            const stateJson = JSON.stringify(state);

            await prisma.canvasState.upsert({
                where: { roomId },
                update: {
                    state: stateJson,
                    updatedAt: new Date(),
                },
                create: {
                    roomId,
                    state: stateJson,
                },
            });

            console.log(`💾 Canvas state saved for room ${roomId}`);
        } catch (error) {
            console.error('Error saving canvas state:', error);
            throw new Error('Failed to save canvas state');
        }
    },

    // Load canvas state from database
    async loadCanvasState(roomId: string): Promise<CanvasState | null> {
        try {
            console.log(`🔍 Loading canvas state for room ${roomId}`);
            const canvasState = await prisma.canvasState.findUnique({
                where: { roomId },
            });

            if (!canvasState) {
                console.log(`📭 No canvas state found for room ${roomId}`);
                return null;
            }

            const state: CanvasState = JSON.parse(canvasState.state);
            console.log(`📂 Canvas state loaded for room ${roomId} with ${state.strokes.length} strokes`);
            return state;
        } catch (error) {
            console.error('Error loading canvas state:', error);
            throw new Error('Failed to load canvas state');
        }
    },

    // Clear canvas state from database
    async clearCanvasState(roomId: string): Promise<void> {
        try {
            await prisma.canvasState.delete({
                where: { roomId },
            });

            console.log(`🗑️ Canvas state cleared for room ${roomId}`);
        } catch (error) {
            console.error('Error clearing canvas state:', error);
            throw new Error('Failed to clear canvas state');
        }
    },

    // Add a stroke to the canvas state using true atomic operations
    async addStroke(roomId: string, stroke: CanvasStroke): Promise<void> {
        try {
            console.log(`🎨 Adding stroke to room ${roomId}:`, stroke);

            await prisma.$runCommandRaw({
                update: 'CanvasState',
                updates: [
                    {
                        q: { roomId: roomId },
                        u: {
                            $push: {
                                'state.strokes': {
                                    type: stroke.type,
                                    x: stroke.x,
                                    y: stroke.y,
                                    color: stroke.color,
                                    brushSize: stroke.brushSize,
                                    tool: stroke.tool,
                                    userId: stroke.userId,
                                    username: stroke.username,
                                    timestamp: stroke.timestamp
                                }
                            },
                            $set: {
                                'state.lastUpdated': new Date(),
                                updatedAt: new Date()
                            }
                        },
                        upsert: true
                    }
                ]
            });

            console.log(`✅ Stroke added atomically to room ${roomId}`);
        } catch (error) {
            console.error('Error adding stroke:', error);
            throw new Error('Failed to add stroke');
        }
    },
}; 