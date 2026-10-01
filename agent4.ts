
//Langchain memory management: how to preserve conversation history across interactions with the agent.
//This script creates a humorous weather agent that uses tools to find a user’s location and fetch weather, and uses LangGraph MemorySaver to remember prior turns per thread_id, but your last call reuses the same thread id for a different user which can mix memories.

import { createAgent, initChatModel, tool } from "langchain";
import "dotenv/config"
import z from "zod";
import { tools } from "@langchain/anthropic";
import {MemorySaver} from "@langchain/langgraph";

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
    configurable : {thread_id : "1"},
    context : {user_id : "1"},
    db : {}
}

const qaconfig = {
    configurable : {thread_id : "1"},
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

const checkpointer = new MemorySaver(); //remembers each thread of conversation after it is passed as parameter/argument to the agent

const agent = createAgent({
    model : model,
    tools : [getWeather, getUserLocation],
    systemPrompt : SystemPrompt,
    responseFormat,checkpointer
});

const response = await agent.invoke(

    {messages: [{role: "user", content: "what is weather outside?"}],
    }, config);

    const longMessage = response.messages[response.messages.length-1].content
    console.log(longMessage);


const response1 = await agent.invoke(

    {messages: [{role: "user", content: "what location did you just tell me about?"}],
    }, config);

    const longMessage1 = response1.messages[response1.messages.length-1].content
    console.log(longMessage1);

const response2 = await agent.invoke(

    {messages: [{role: "user", content: "Suggest me good places in that location"}],
    }, config);

    const longMessage2 = response2.messages[response2.messages.length-1].content
    console.log(longMessage2);

const response3 = await agent.invoke(

    {messages: [{role: "user", content: "what is weather outside?"}],
    }, qaconfig);

    const longMessage3 = response3.messages[response3.messages.length-1].content
    console.log(longMessage3);
    