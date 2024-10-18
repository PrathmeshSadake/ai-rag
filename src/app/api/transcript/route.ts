import axios from "axios";

export async function GET(request: any) {
  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get("url");

  if (!videoUrl) {
    return new Response(JSON.stringify({ error: "Missing video URL" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const options = {
    method: "GET",
    url: "https://youtube-transcripts.p.rapidapi.com/youtube/transcript",
    params: { url: videoUrl, chunkSize: "500" },
    headers: {
      "x-rapidapi-key": "cf13b3989bmshdb533b28a8516c9p103bb0jsn12c65fe36ebd",
      "x-rapidapi-host": "youtube-transcripts.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch transcript" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
