import gemini from "../config/gemini.js";

export const generateProductDetails = async (file) => {

    const base64Image = file.buffer.toString("base64");

    const prompt = `
You are an expert e-commerce product listing AI.

Analyze the product shown in the image.

Generate a professional product listing based ONLY on information
that can reasonably be identified from the image.

Return the result in this exact JSON structure:

{
    "title": "",
    "shortDescription": "",
    "description": "",
    "category": "",
    "brand": null,
    "color": "",
    "tags": []
}

Rules:

1. Create a clear and attractive product title.
2. shortDescription must be 1-2 sentences.
3. description should be detailed and suitable for an e-commerce website.
4. Identify the product category.
5. Identify the brand only if it is clearly visible.
6. If the brand cannot be identified, return null.
7. Identify the primary visible color.
8. Generate 5-10 useful search tags.
9. Never invent specifications that cannot be determined from the image.
10. Do not mention that you are an AI.
11. Return ONLY JSON.
`;

    const response = await gemini.models.generateContent({
        model: "gemini-3.8-flash",

        contents: [
            {
                inlineData: {
                    mimeType: file.mimetype,
                    data: base64Image
                }
            },
            {
                text: prompt
            }
        ],

        config: {
            responseMimeType: "application/json",

            responseSchema: {
                type: "object",

                properties: {
                    title: {
                        type: "string"
                    },

                    shortDescription: {
                        type: "string"
                    },

                    description: {
                        type: "string"
                    },

                    category: {
                        type: "string"
                    },

                    brand: {
                        type: ["string", "null"]
                    },

                    color: {
                        type: "string"
                    },

                    tags: {
                        type: "array",
                        items: {
                            type: "string"
                        }
                    }
                },

                required: [
                    "title",
                    "shortDescription",
                    "description",
                    "category",
                    "brand",
                    "color",
                    "tags"
                ]
            }
        }
    });

    return JSON.parse(response.text);
};