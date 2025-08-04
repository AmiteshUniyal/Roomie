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
            const canvasState = await prisma.canvasState.findUnique({
                where: { roomId },
            });

            if (!canvasState) {
                return null;
            }

            const state: CanvasState = JSON.parse(canvasState.state);
            console.log(`📂 Canvas state loaded for room ${roomId}`);
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

    // Add a stroke to the canvas state
    async addStroke(roomId: string, stroke: CanvasStroke): Promise<void> {
        try {
            const existingState = await this.loadCanvasState(roomId);
            const newState: CanvasState = {
                strokes: existingState ? [...existingState.strokes, stroke] : [stroke],
                lastUpdated: new Date(),
            };

            await this.saveCanvasState(roomId, newState);
        } catch (error) {
            console.error('Error adding stroke:', error);
            throw new Error('Failed to add stroke');
        }
    },
}; 