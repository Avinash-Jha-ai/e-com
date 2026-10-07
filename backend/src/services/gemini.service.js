import gemini from "../configs/gemini.js";

export const generateProductDetails = async (files) => {
    const prompt = `
You are an expert e-commerce product listing assistant.

Analyze the product shown across all provided images. Each image is labeled
with its zero-based index in the upload order.

Generate a professional product listing based ONLY on information that can
reasonably be identified from the images. Return only a JSON object in this shape:

{
    "title": "",
    "shortDescription": "",
    "description": "",
    "category": "",
    "brand": null,
    "color": "",
    "tags": [],
    "frontImageIndex": 0
}

Rules:
- shortDescription must be 1-2 sentences.
- Identify the brand only if clearly visible; otherwise use null.
- Generate 5-10 useful search tags.
- Never invent specifications that cannot be determined from the images.
- Choose the clearest, best-lit image showing the complete product unobstructed
  against a clean background. Set frontImageIndex to that image's zero-based index.
- Do not mention that you are an AI.
`;

    const contents = [
        {
            text: prompt
        },
        ...files.flatMap((file, index) => [
            {
                text: `Product image index ${index}:`
            },
            {
                inlineData: {
                    mimeType: file.mimetype,
                    data: file.buffer.toString("base64")
                }
            }
        ])
    ];

    const config = {
        responseMimeType: "application/json",
        responseSchema: {
            type: "object",
            properties: {
                title: { type: "string" },
                shortDescription: { type: "string" },
                description: { type: "string" },
                category: { type: "string" },
                brand: { type: ["string", "null"] },
                color: { type: "string" },
                tags: {
                    type: "array",
                    items: { type: "string" }
                },
                frontImageIndex: { type: "integer" }
            },
            required: [
                "title",
                "shortDescription",
                "description",
                "category",
                "brand",
                "color",
                "tags",
                "frontImageIndex"
            ]
        }
    };

    const models = [
        process.env.GEMINI_MODEL || "gemini-3.8-flash",
        process.env.GEMINI_FALLBACK_MODEL || "gemini-2.5-flash"
    ];

    for (let index = 0; index < models.length; index += 1) {
        try {
            const response = await gemini.models.generateContent({
                model: models[index],
                contents,
                config
            });

            return JSON.parse(response.text);
        } catch (error) {
            const status = Number(error?.status ?? error?.code);
            const canFallback = index < models.length - 1;
            const isTemporaryFailure = status === 429 || status >= 500;

            if (!canFallback || !isTemporaryFailure) {
                throw error;
            }

            console.warn(
                `Gemini model ${models[index]} failed with status ${status}; trying fallback model ${models[index + 1]}`
            );
        }
    }

    throw new Error("No Gemini model was available to generate product details");
};
