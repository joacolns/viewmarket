import OpenAI from 'openai';

export async function POST(request) {
  try {
    const requestData = await request.json();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const mode = requestData.mode;
    const assetType = mode === 'crypto' ? 'Criptomoneda' : 'Acción';
    const promptRole = mode === 'crypto'
      ? "You are an expert in crypto analysis. Provides concise investment recommendations (maximum 150 words) based on this technical data:"
      : "You are an expert in stock analysis. Provides concise investment recommendations (maximum 150 words) based on this technical data:";

    let userPrompt = '';
    if (requestData.predictionMode) {
      userPrompt = `
        Based on the following technical data, what would be your price prediction for the end of this month?
        ${assetType}: ${requestData.asset}
        Precio actual: $${requestData.price}
        Cambio 24h: ${requestData.change24h}%
        RSI: ${requestData.indicators.rsi}
        MACD: ${requestData.indicators.macd}
        Bandas de Bollinger: 
          Superior: ${requestData.indicators.bb.upper}
          Media: ${requestData.indicators.bb.middle}
          Inferior: ${requestData.indicators.bb.lower}
      `;
    } else if (requestData.actionQuery) {
      userPrompt = `
        Based on the following technical data, do I buy or sell? Briefly explain your recommendation.
        ${assetType}: ${requestData.asset}
        Actual price: $${requestData.price}
        24h Change: ${requestData.change24h}%
        RSI: ${requestData.indicators.rsi}
        MACD: ${requestData.indicators.macd}
        Bollinger Bands: 
          Upper: ${requestData.indicators.bb.upper}
          Middle: ${requestData.indicators.bb.middle}
          Lower: ${requestData.indicators.bb.lower}
      `;
    } else if (requestData.holdQuery) {
      userPrompt = `
        Based on the following technical data, do I maintain the current position? Briefly explain your recommendation.
        ${assetType}: ${requestData.asset}
        Actual price: $${requestData.price}
        24h Change: ${requestData.change24h}%
        RSI: ${requestData.indicators.rsi}
        MACD: ${requestData.indicators.macd}
        Bollinger Bands: 
          Upper: ${requestData.indicators.bb.upper}
          Middle: ${requestData.indicators.bb.middle}
          Lower: ${requestData.indicators.bb.lower}
      `;
    } else {
      userPrompt = `
        ${assetType}: ${requestData.asset}
        Actual price: $${requestData.price}
        24h Change: ${requestData.change24h}%
        RSI: ${requestData.indicators.rsi}
        MACD: ${requestData.indicators.macd}
        Bollinger Bands: 
          Upper: ${requestData.indicators.bb.upper}
          Middle: ${requestData.indicators.bb.middle}
          Lower: ${requestData.indicators.bb.lower}
      `;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "system",
        content: promptRole
      }, {
        role: "user",
        content: userPrompt
      }]
    });

    console.log('Data received:', {
      asset: requestData.asset,
      mode: requestData.mode,
      price: requestData.price,
      change24h: requestData.change24h,
      rsi: requestData.indicators.rsi,
      macd: requestData.indicators.macd,
      bb: requestData.indicators.bb
    });

    if (!completion.choices || completion.choices.length === 0) {
      throw new Error('OpenAI response is empty');
    }

    const analysis = completion.choices[0].message.content || 'Analysis not available';

    return new Response(JSON.stringify({ analysis }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Backend error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
