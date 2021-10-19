const express = require("express");
const axios = require("axios");
const responseTime = require("response-time");
const redis = require("redis");
const { promisify } = require("util");

const client = redis.createClient({
    host:"127.0.0.1",
    port: 6379
});

//Convirte el callback en promesa
const GET_REDIS = promisify(client.get).bind(client);
const SET_REDIS = promisify(client.set).bind(client);

const app = express();

app.use(responseTime());

app.get('/characters', async (req, res) => {
    try{
        //response from cache
        const replay =  await GET_REDIS('characters');
        if(replay){
            return res.json(JSON.parse(replay));
        }

        const { data } = await axios.get('https://rickandmortyapi.com/api/character');
        await SET_REDIS('characters', JSON.stringify(data));
        return res.json(data);
    }catch(err){
        console.log(err);
        res.status(500).send("ERROR");
    }
});

app.listen(3000);
console.log('Server listen on por 3000')