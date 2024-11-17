import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { question, documentId } = await req.json();

    if (!documentId) {
      return new Response("Missing documentId", { status: 400 });
    }

    // Check if the question is a base64 image
    const isImage =
      typeof question === "string" && question.startsWith("data:image");

    if (isImage) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "What do you see in this image? Please describe it concisely.",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: question,
                  },
                },
              ],
            },
          ],
        });

        return NextResponse.json({
          answer: response.choices[0].message.content,
        });
      } catch (error) {
        console.error("Error processing image:", error);
        return NextResponse.json({
          answer:
            "Sorry, there was an error processing the image. Please try again.",
        });
      }
    }

    // For text questions
    if (!question?.trim()) {
      return new Response("Missing question", { status: 400 });
    }

    const embeddings = new OpenAIEmbeddings({
      apiKey: process.env.OPENAI_API_KEY,
      batchSize: 512,
      model: "text-embedding-3-large",
    });

    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      filter: { documentId },
    });

    const results = await vectorStore.similaritySearch(question, 4);

    if (results.length === 0) {
      return NextResponse.json({
        answer: "I don't know the answer to that question",
      });
    }

    const contentText = results.map((r) => r.pageContent).join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are a helpful AI assistant. Using the following context from a document, 
          please answer the user's question accurately and concisely. If the context doesn't contain 
          relevant information to answer the question, please say so.
          
          Context:
          ${contentText}`,
        },
        {
          role: "user",
          content: question,
        },
      ],
    });

    return NextResponse.json({
      answer: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({
      answer: "An error occurred while processing your request.",
    });
  }
}
