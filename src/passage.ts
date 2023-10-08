import Passage from '@passageidentity/passage-node';
import "dotenv/config.js"
export let passage = new Passage({
    appID: 'DuBvcJhhoGlIdQeeyW6fRArD',
    apiKey: process.env.PASSAGE_API,
});