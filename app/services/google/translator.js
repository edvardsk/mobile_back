const { TranslationServiceClient } = require('@google-cloud/translate');

const translationClient = new TranslationServiceClient();

const {
    GOOGLE_PROJECT_ID,
    GOOGLE_LOCATION,
} = process.env;

const translateText = async (fromLanguage, toLanguage, text) => {
    const request = {
        parent: `projects/${GOOGLE_PROJECT_ID}/locations/${GOOGLE_LOCATION}`,
        contents: [text],
        mimeType: 'text/plain', // mime types: text/plain, text/html
        sourceLanguageCode: fromLanguage,
        targetLanguageCode: toLanguage,
    };

    const [response] = await translationClient.translateText(request);
    return response.translations.pop().translatedText;
};

module.exports = {
    translateText,
};
