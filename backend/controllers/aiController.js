import OpenAI from 'openai';
import { z } from 'zod';
import Restaurant from '../models/Restaurant.js';
import ChatHistory from '../models/ChatHistory.js';

const requestSchema = z.object({
  message: z.string().min(1).max(1000),
  sessionId: z.string().min(1).max(100).optional(),
  city: z.string().max(60).optional(),
});

function buildInstructions(restaurants) {
  return `You are Darna, a concise and warm multilingual restaurant concierge for Morocco. Reply in the guest's language: French, Arabic, Darija, English, or Spanish. Recommend ONLY restaurants from the supplied live catalogue. Never invent restaurant details, prices, opening hours, reviews, or availability. If no listed restaurant fits, ask for city, cuisine, budget, or mood. Mention up to three candidates and explain in one short sentence why each fits. Be friendly and brief. Live catalogue (JSON): ${JSON.stringify(
    restaurants.map((r) => ({
      name: r.name,
      slug: r.slug,
      city: r.city,
      cuisines: r.categories,
      rating: r.rating,
      priceLevel: r.priceLevel,
      description: r.shortDescription,
    }))
  )}`;
}

export async function chat(req, res) {
  const { message, sessionId, city } = requestSchema.parse(req.body);
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({ message: 'Darna AI is not configured yet' });

  const filter = city ? { city: new RegExp(`^${city}$`, 'i') } : {};
  let restaurants = await Restaurant.find(filter)
    .sort({ rating: -1, reviewCount: -1, popularityScore: -1 })
    .limit(40)
    .select('name slug city categories rating priceLevel shortDescription');
  if (!restaurants.length && city) {
    restaurants = await Restaurant.find({})
      .sort({ rating: -1, popularityScore: -1 })
      .limit(40)
      .select('name slug city categories rating priceLevel shortDescription');
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 20_000, maxRetries: 1 });
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  let answer;
  try {
    const response = await client.responses.create({
      model,
      instructions: buildInstructions(restaurants),
      input: message,
      max_output_tokens: 500,
    });
    answer = response.output_text?.trim();
  } catch (err) {
    console.error('OpenAI error:', err.message);
    return res.status(502).json({ message: 'Darna AI is temporarily unavailable', detail: err.message });
  }
  if (!answer) return res.status(502).json({ message: 'Darna AI returned an empty response' });

  // Resolve which catalogue restaurants the model referenced so the client can render cards.
  const mentioned = restaurants.filter((r) => answer.toLowerCase().includes(r.name.toLowerCase())).slice(0, 3);

  await ChatHistory.findOneAndUpdate(
    { user: req.user._id, sessionId: sessionId || 'default' },
    {
      $push: {
        messages: {
          $each: [
            { role: 'user', content: message },
            { role: 'assistant', content: answer },
          ],
          $slice: -40,
        },
      },
    },
    { upsert: true, new: true }
  );

  res.json({
    answer,
    restaurants: (mentioned.length ? mentioned : restaurants.slice(0, 3)).map((r) => ({
      name: r.name,
      slug: r.slug,
      city: r.city,
      categories: r.categories,
      rating: r.rating,
      priceLevel: r.priceLevel,
    })),
  });
}
