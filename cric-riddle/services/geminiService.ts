// FIX: Import GenerateContentResponse to correctly type the API response.
import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import type { DailyPuzzle, Difficulty } from '../types';

// A list of high-quality fallback puzzles to use if the API fails.
const fallbackPuzzles: DailyPuzzle[] = [
    {
        playerName: "Sachin Tendulkar",
        clues: [
          "I am known as the 'Little Master'.",
          "I am the only player to have scored 100 international centuries.",
          "I made my Test debut against Pakistan in 1989.",
          "I have played in six Cricket World Cups.",
          "My jersey number was 10."
        ],
        stats: {
            batting: { runs: 34357, highScore: "248*", average: 48.52, centuries: 100, fifties: 164 },
            bowling: { wickets: 201, bestFigures: "5/32", average: 46.52, economy: 4.59 }
        }
    },
    {
        playerName: "Shane Warne",
        clues: [
            "I was a right-arm leg spin bowler from Australia.",
            "I was named one of the five Wisden Cricketers of the Century.",
            "I delivered the 'Ball of the Century' to Mike Gatting in 1993.",
            "I took over 700 Test wickets.",
            "I captained the Rajasthan Royals to an IPL victory in the inaugural season."
        ],
        stats: {
            bowling: { wickets: 708, bestFigures: "8/71", average: 25.41, economy: 2.65 }
        }
    },
    {
        playerName: "Virat Kohli",
        clues: [
            "I am an Indian batsman known for my aggressive style.",
            "I am famous for my cover drive.",
            "I captained India to the final of the 2017 Champions Trophy.",
            "I am often called 'King Kohli'.",
            "I have the most centuries in ODI cricket."
        ],
        stats: {
            batting: { runs: 26733, highScore: "254*", average: 54.11, centuries: 80, fifties: 139 }
        }
    },
     {
        playerName: "Muttiah Muralitharan",
        clues: [
            "I am a Sri Lankan bowler with a unique bowling action.",
            "I am the all-time leading wicket-taker in both Test and ODI cricket.",
            "I took 800 Test wickets.",
            "My doosra was a particularly effective delivery.",
            "I was part of Sri Lanka's 1996 World Cup winning team."
        ],
        stats: {
            bowling: { wickets: 1347, bestFigures: "9/51", average: 22.86, economy: 3.51 }
        }
    }
];


const getDifficultyInstructions = (difficulty: Difficulty): string => {
    switch (difficulty) {
        case 'Easy':
            return 'The clues must be well-known facts, making them relatively easy for a casual fan.';
        case 'Medium':
            return 'The clues should offer a fair challenge, mixing some well-known facts with some slightly more obscure details.';
        case 'Hard':
            return 'The clues must be obscure, focusing on specific statistics, lesser-known achievements, or niche career details for a true expert.';
        default:
            return '';
    }
}

// Utility function to add a timeout to any promise
const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error(`Promise timed out after ${ms} ms`));
        }, ms);

        promise
            .then(value => {
                clearTimeout(timer);
                resolve(value);
            })
            .catch(reason => {
                clearTimeout(timer);
                reject(reason);
            });
    });
};


export const geminiService = {
  getDailyCricketer: async (difficulty: Difficulty, excludePlayers: string[] = []): Promise<DailyPuzzle> => {

    // Prefer Vite browser env variable, fall back to Node env for server-side usage.
    const apiKey = (
      import.meta.env?.VITE_GEMINI_API_KEY as string | undefined
    ) || (process.env.API_KEY as string | undefined);

    if (!apiKey) {
      console.warn("Gemini API key not set. Using fallback puzzles.");
      const availableFallback = fallbackPuzzles.find(p => 
        !excludePlayers.some(excluded => excluded.toLowerCase() === p.playerName.toLowerCase())
      );
      return availableFallback || fallbackPuzzles[0];
    }

    const ai = new GoogleGenAI({ apiKey });

    try {
      const exclusionInstruction = excludePlayers.length > 0 
        ? `\nIMPORTANT: You MUST NOT choose any of the following players: ${excludePlayers.join(', ')}.`
        : '';
        
      const infoPrompt = `
        Generate a JSON object for a famous cricketer guessing game. The cricketer should be internationally well-known.
        The difficulty for this puzzle is ${difficulty}.
        The JSON object must have three keys: "playerName" (a string with the cricketer's full name), "clues" (an array of 5 string clues), and "stats" (an object with their career statistics).
        The clues must be in English, start vague and get progressively more specific, following the difficulty guidelines.
        ${getDifficultyInstructions(difficulty)}
        The "stats" object should contain key career stats. For a batsman, include "batting": { "runs": number, "highScore": string, "average": number, "centuries": number, "fifties": number }. For a bowler, include "bowling": { "wickets": number, "bestFigures": string, "average": number, "economy": number }. For an all-rounder, include both.
        Do not include any markdown formatting like \`\`\`json in your response. Just the raw JSON object.
        Choose a different player than you have in previous requests.${exclusionInstruction}
      `;

      const generationPromise = ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: infoPrompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              playerName: { type: Type.STRING },
              clues: { type: Type.ARRAY, items: { type: Type.STRING } },
              stats: {
                type: Type.OBJECT,
                properties: {
                  batting: { type: Type.OBJECT, nullable: true, properties: { runs: { type: Type.INTEGER }, highScore: { type: Type.STRING }, average: { type: Type.NUMBER }, centuries: { type: Type.INTEGER }, fifties: { type: Type.INTEGER } } },
                  bowling: { type: Type.OBJECT, nullable: true, properties: { wickets: { type: Type.INTEGER }, bestFigures: { type: Type.STRING }, average: { type: Type.NUMBER }, economy: { type: Type.NUMBER } } }
                }
              }
            },
            required: ['playerName', 'clues', 'stats']
          }
        }
      });
      
      // Increase timeout to 20 seconds for more complex requests
      // FIX: Explicitly type infoResponse as GenerateContentResponse to resolve type inference issue.
      const infoResponse: GenerateContentResponse = await withTimeout(generationPromise, 20000);

      const playerInfo = JSON.parse(infoResponse.text.trim());
      if (!playerInfo.playerName || !Array.isArray(playerInfo.clues) || playerInfo.clues.length !== 5 || !playerInfo.stats) {
        throw new Error("Invalid text format from Gemini API");
      }
      
      return {
        playerName: playerInfo.playerName,
        clues: playerInfo.clues,
        stats: playerInfo.stats,
      };

    } catch (error) {
      console.error("Error fetching from Gemini API or timeout:", error);
    
      // Find a fallback puzzle that hasn't been played yet.
      const availableFallback = fallbackPuzzles.find(p => 
          !excludePlayers.some(excluded => excluded.toLowerCase() === p.playerName.toLowerCase())
      );
      
      // If an available fallback is found, return it. Otherwise, return the first puzzle from the list.
      return availableFallback || fallbackPuzzles[0];
    }
  },
};