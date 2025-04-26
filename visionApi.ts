import { ImageInfo } from 'expo-camera';

const VISION_API_ENDPOINT = 'https://vision.googleapis.com/v1/images:annotate';
const API_KEY = 'ccb04c2b39c9633882050f9d999b8732a7e03723';

interface AnnotateImageResponse {
  labelAnnotations: Array<{
    description: string;
    score: number;
  }>;
  landmarkAnnotations: Array<{
    description: string;
    score: number;
  }>;
}

export async function analyzeImage(base64Image: string): Promise<string> {
  try {
    const response = await fetch(`${VISION_API_ENDPOINT}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: base64Image,
            },
            features: [
              {
                type: 'LANDMARK_DETECTION',
                maxResults: 5,
              },
              {
                type: 'LABEL_DETECTION',
                maxResults: 5,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    const result = data.responses[0] as AnnotateImageResponse;

    let description = '';

    if (result.landmarkAnnotations?.length > 0) {
      const landmark = result.landmarkAnnotations[0];
      description += `You're looking at ${landmark.description}. `;
    }

    if (result.labelAnnotations?.length > 0) {
      description += 'I can see: ';
      description += result.labelAnnotations
        .map(label => label.description)
        .join(', ');
    }

    return description || 'I cannot identify any specific landmarks or objects in this image.';
  } catch (error) {
    console.error('Error analyzing image:', error);
    return 'Sorry, I encountered an error while analyzing the image.';
  }
}