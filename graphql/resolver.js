const axios = require("axios");
const Word = require("../src/models/Word");
const { env } = process;

module.exports = {
    addWord: async ({ userInput }, req) => {
        const word = userInput.word;
        const existingWord = await Word.findOne({ key: word });
        if (existingWord) {
            const error = new Error("Word exists already!");
            throw error;
        }
        const URL = `https://od-api.oxforddictionaries.com/api/v2/entries/en/${word}?fields=etymologies,examples,variantForms,definitions`;
        let response = null;
        try {
            response = await axios.get(
                URL,

                {
                    headers: { app_id: env.OXFORD_APP_ID, app_key: env.OXFORD_APP_KEY },
                },
            );
        } catch (err) {
            const error = new Error(err.response.statusText);
            error.code = 404;
            throw error;
        }
        if (!response) {
            const error = new Error("Word not found.");
            error.code = 401;
            throw error;
        }
        let entries = response.data.results[0].lexicalEntries;
        let newEntries = entries.map((entry) => {
            let lexicalCategory = "NA";
            let definition = "NA";
            let example = "NA";
            let origin = "NA";
            if (entry.lexicalCategory.id) {
                lexicalCategory = entry.lexicalCategory.id;
            }
            if (entry.entries) {
                if (entry.entries[0].senses) {
                    if (entry.entries[0].senses[0].definitions) {
                        definition = entry.entries[0].senses[0].definitions[0];
                    }
                    if (entry.entries[0].senses[0].examples) {
                        example = entry.entries[0].senses[0].examples[0].text;
                    }
                }

                if (entry.entries[0].etymologies) {
                    origin = entry.entries[0].etymologies[0];
                }
            }
            return {
                lexicalCategory: lexicalCategory,
                definition: definition,
                example: example,
                origin: origin,
            };
        });
        const newWord = new Word({
            key: response.data.results[0].id,
            lexicalEntries: newEntries,
        });
        const createdWord = await newWord.save();
        return {
            ...createdWord._doc,
            _id: createdWord._id.toString(),
        };
    },

    getAllAddedWords: async () => {
        let allWords = await Word.find().sort("key");
        allWords = allWords.map((w) => {
            return {
                ...w._doc,
                _id: w._id.toString(),
            };
        });
        return {
            data: allWords,
        };
    },

    getOneWord: async ({ key }) => {
        let word = await Word.findOne({ key: key });
        return {
            ...word._doc,
            _id: word._id.toString(),
        };
    },
    
    getWords: async ({ key }) => {
        let allWords = await Word.find({
            key: {
                $regex: new RegExp(key),
            },
        }).sort("key");
        allWords = allWords.map((w) => {
            return {
                ...w._doc,
                _id: w._id.toString(),
            };
        });
        return {
            data: allWords,
        };
    },
};
