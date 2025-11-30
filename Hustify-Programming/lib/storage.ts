import { v4 as uuidv4 } from 'uuid';

export async function uploadImage(file: Buffer, originalName: string): Promise<string> {
  try {
    // Return a placeholder URL since Firebase Storage is disabled
    return 'https://placehold.co/600x400?text=Image+Upload+Disabled';
  } catch (error) {
    console.error('Error with image:', error);
    throw error;
  }
} 