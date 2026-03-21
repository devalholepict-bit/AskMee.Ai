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
export async function generateResponse(messages) {
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
}

/**
 * Streaming response — calls onToken(string) for each text token as it arrives.
 * Returns the full accumulated text when done.
 */
export async function generateResponseStream(messages, onToken) {
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

    return fullText;
}

export async function generateChatTitle(message) {

    const response = await mistralModel.invoke([
        new SystemMessage(`
            You are a helpful assistant that generates concise and descriptive titles for chat conversations.
            
            User will provide you with the first message of a chat conversation, and you will generate a title that captures the essence of the conversation in 2-4 words. The title should be clear, relevant, and engaging, giving users a quick understanding of the chat's topic.    
        `),
        new HumanMessage(`
            Generate a title for a chat conversation based on the following first message:
            "${message}"
            `)
    ])

    return response.text;

}