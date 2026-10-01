
//How can we customize the agent behavior with system prompt and runtime configuration, and response format.
// Also, initializing the model separately to pass model parameters.
// How to set up temperature, max tokens, timeout etc.

import { createAgent, initChatModel, tool } from "langchain";
import "dotenv/config"
import z from "zod";
import { tools } from "@langchain/anthropic";

const SystemPrompt = 'You are an expert weather forecaster who also speaks humourously. You have access to two tools:- get_weather: to get the weather for a given city.- Use getUserLocation from the context to provide accurate weather information. If a user asks you for the getWeather, make sure you know the location first. If you can tell from the question that they mean wherever they are, use the getUserLocation tool to get their location.';

const getUserLocation = tool((_, config) => {
    const user_id = config.context.user_id;
    //fire DB query to get user location based on user_id/API key
    return user_id === "1" ? "Florida" : "San Francisco";
}, {
    name : "get_user_location",
    description : "Retrieve the user information based on user id",
    schema : z.object({})
});

const getWeather = tool( (input)=>{
    return {city: input.city, weather: "rainy"};
} , 
    {       
    name : "get_weather",
    description : "Get the weather for a given city",
    schema : z.object({
        city : z.string()
    }) 
    }

);

const config = {
    context : {user_id : "1"},
    db : {}
}

const qaconfig = {
    context : {user_id : "2"},
    db : {}//qa db
}

const responseFormat = z.object({
    humour_response : z.string(),
    weather_conditions : z.string()
});

//initialize the model
const model = await initChatModel(
"claude-sonnet-4-5-20250929",
 {
    temperature : 0.7, timeout: 30, max_tokens : 1000
})

const agent = createAgent({
    model : model,
    tools : [getWeather, getUserLocation],
    systemPrompt : SystemPrompt,
    responseFormat
});

const response = await agent.invoke(

    {messages: [{role: "user", content: "what is weather outside?"}],
    }, config);
    console.log(response);
    