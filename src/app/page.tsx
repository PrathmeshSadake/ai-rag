"use client";
import React, { useState } from "react";

async function fetchTranscript(url: string) {
  const response = await fetch(
    `/api/transcript?url=${encodeURIComponent(url)}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch transcript");
  }
  return response.json();
}

export default function YouTubeTranscript() {
  const [url, setUrl] = useState("");
  const [transcript, setTranscript] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setTranscript(null);

    try {
      const data = await fetchTranscript(url);
      setTranscript(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>YouTube Transcript Fetcher</h1>
      <form onSubmit={handleSubmit} className='mb-4'>
        <div className='flex gap-2'>
          <input
            type='text'
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder='Enter YouTube URL'
            className='flex-grow'
          />
          <button type='submit' disabled={isLoading}>
            {isLoading ? "Fetching..." : "Fetch Transcript"}
          </button>
        </div>
      </form>

      {error && (
        <div className='mb-4'>
          <div>
            <p className='text-red-500'>Error: {error}</p>
          </div>
        </div>
      )}

      {transcript && (
        <div>
          <div>
            <div>Transcript</div>
          </div>
          <div>
            <div className='max-h-96 overflow-y-auto'>
              {transcript?.content.map(
                (
                  item: {
                    text:
                      | string
                      | number
                      | bigint
                      | boolean
                      | React.ReactElement<
                          any,
                          string | React.JSXElementConstructor<any>
                        >
                      | Iterable<React.ReactNode>
                      | React.ReactPortal
                      | Promise<React.AwaitedReactNode>
                      | null
                      | undefined;
                  },
                  index: React.Key | null | undefined
                ) => (
                  <p key={index} className='mb-2'>
                    {item.text}
                  </p>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
