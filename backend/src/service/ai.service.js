import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { z } from "zod";
import { searchInternet } from "./internet.service.js"; 

const geminiModel = new ChatGoogleGenerativeAI({
    model: "gemini-flash-latest",
    apiKey: process.env.GEMINI_API_KEY
});

const mistralModel = new ChatMistralAI({
    model: "mistral-medium-latest",
    apiKey: process.env.MISTRAL_API_KEY
})

const pixtralModel = new ChatMistralAI({
    model: "pixtral-12b-2409",
    apiKey: process.env.MISTRAL_API_KEY
})

const searchInternetTool = tool(
    searchInternet,
    {
        name: "searchInternet",
        description: "Use this tool to get the latest information from the internet.",
        schema: z.object({
            query: z.string().describe("The search query to look up on the internet.")
        })
    }
)

const SYSTEM_PROMPT = `
    You are a helpful and precise assistant for answering questions.
    If you don't know the answer, say you don't know. 
    If the question requires up-to-date information, use the "searchInternet" tool to get the latest information from the internet and then answer based on the search results.
`;

const agent = createReactAgent({
    llm: mistralModel,
    tools: [ searchInternetTool ],
})

/**
 * Non-streaming response (kept for REST endpoint backward compatibility)
 */
export async function generateResponse(messages, isWebSearch = false, image = null) {
    if (image) {
        // Use Pixtral for vision — ignore web search when image present
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
        const mimeType = image.match(/data:(image\/\w+);base64/)?.[1] || 'image/jpeg'
        
        // Get last user message as the text prompt
        const lastMessage = messages[messages.length - 1]
        const textPrompt = typeof lastMessage === 'string' 
          ? lastMessage 
          : lastMessage?.content || 'What do you see in this image?'
        
        const visionMessage = new HumanMessage({
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Data}`
              }
            },
            {
              type: "text",
              text: textPrompt
            }
          ]
        })
        
        const response = await pixtralModel.invoke([visionMessage])
        return response.content
    }

    if (isWebSearch) {
        const response = await agent.invoke({
            messages: [
                new SystemMessage(SYSTEM_PROMPT),
                ...(messages.map(msg => {
                    if (msg.role == "user") {
                        return new HumanMessage(msg.content)
                    } else if (msg.role == "ai") {
                        return new AIMessage(msg.content)
                    }
                })) ]
        });
        return response.messages[ response.messages.length - 1 ].text;
    } else {
        const response = await mistralModel.invoke([
            new SystemMessage(SYSTEM_PROMPT),
            ...(messages.map(msg => {
                if (msg.role == "user") {
                    return new HumanMessage(msg.content)
                } else if (msg.role == "ai") {
                    return new AIMessage(msg.content)
                }
            }))
        ]);
        return response.content;
    }
}

/**
 * Streaming response — calls onToken(string) for each text token as it arrives.
 * Returns the full accumulated text when done.
 */
export async function generateResponseStream(messages, onToken, isWebSearch = false, image = null) {
    const formattedMessages = [
        new SystemMessage(SYSTEM_PROMPT),
        ...(messages.map(msg => {
            if (msg.role === "user") {
                return new HumanMessage(msg.content)
            } else if (msg.role === "ai") {
                return new AIMessage(msg.content)
            }
        }))
    ];

    let fullText = "";

    if (image) {
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
        const mimeType = image.match(/data:(image\/\w+);base64/)?.[1] || 'image/jpeg'
        const lastMessage = messages[messages.length - 1]
        const textPrompt = typeof lastMessage === 'string'
          ? lastMessage
          : lastMessage?.content || 'What do you see in this image?'

        const visionMessage = new HumanMessage({
          content: [
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${base64Data}` }
            },
            { type: "text", text: textPrompt }
          ]
        })

        // Stream pixtral response token by token
        const stream = await pixtralModel.stream([visionMessage])
        for await (const chunk of stream) {
          if (chunk.content) {
            fullText += chunk.content;
            onToken(chunk.content);
          }
        }
        return fullText;
    }

    if (isWebSearch) {
        const eventStream = agent.streamEvents(
            { messages: formattedMessages },
            { version: "v2" }
        );

        for await (const event of eventStream) {
            // on_chat_model_stream fires for each LLM token
            if (event.event === "on_chat_model_stream") {
                const chunk = event.data?.chunk;
                if (chunk && chunk.content && typeof chunk.content === "string") {
                    fullText += chunk.content;
                    onToken(chunk.content);
                }
            }
        }
    } else {
        const stream = await mistralModel.stream(formattedMessages);
        for await (const chunk of stream) {
            if (chunk && chunk.content && typeof chunk.content === "string") {
                fullText += chunk.content;
                onToken(chunk.content);
            }
        }
    }

    return fullText;
}

export async function generateChatTitle(message) {

    const response = await mistralModel.invoke([
        new SystemMessage(`
            You are a helpful assistant that generates concise and descriptive titles for chat conversations.
            
            Generate a short title of 2-4 words for this chat.
            Return ONLY the plain title text.
            Do NOT use markdown, asterisks, quotes, bold, 
            italics, or any special characters.
            Just plain words. Example: Understanding Artificial Intelligence
        `),
        new HumanMessage(`
            Generate a title for a chat conversation based on the following first message:
            "${message}"
            `)
    ])

    let title = response.content || response.text || response;
    // Strip all markdown symbols as a safety net
    if (typeof title === 'string') {
        title = title
            .replace(/\*\*/g, '')   // remove bold **
            .replace(/\*/g, '')     // remove italic *
            .replace(/\_\_/g, '')   // remove bold __
            .replace(/\_/g, '')     // remove italic _
            .replace(/`/g, '')      // remove code `
            .replace(/^#+\s*/g, '') // remove headings #
            .replace(/"/g, '')      // remove quotes
            .trim();
    }

    return title;
}