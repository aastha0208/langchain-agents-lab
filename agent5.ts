//Middleware usage & importance

import { createAgent, createMiddleware, initChatModel, tool } from "langchain";
import "dotenv/config"
import z from "zod";
import { tools } from "@langchain/anthropic";
import {MemorySaver} from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";

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

const dynamicModelSelection = createMiddleware({
    name : "DynamicModelSelection",
    wrapModelCall : (request, handler)=>
    {
         const messageCount = request.messages.length;
         return handler({
            ...request, //Copy all properties from request
            model : messageCount > 3 ? advanceModel : basicModel, //Override the model property

         });    }
        

});

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

//if message count is less than 3-> Cheaper model, Advanced model for reasoning for more than 3 messages
const advanceModel = await initChatModel(
"claude-sonnet-4-5-20250929",
 {
    temperature : 0.7, timeout: 30, max_tokens : 1000
})

const baseMOdel = new ChatOpenAI(
    {
    modelName : "gpt-4o-mini"
    }
)


const checkpointer = new MemorySaver(); //remembers each thread of conversation after it is passed as parameter/argument to the agent

const agent = createAgent({
    model : model,
    tools : [getWeather, getUserLocation],
    systemPrompt : SystemPrompt,
    responseFormat,checkpointer,
    middleware : [dynamicModelSelection] as const
});

const response = await agent.invoke(

    {messages: [{role: "user", content: "what is weather outside?"}],
    }, config);

const response1 = await agent.invoke(

    {messages: [{role: "user", content: "what location did you just tell me about?"}],
    }, config);

const response2 = await agent.invoke(

    {messages: [{role: "user", content: "Suggest me good places in that location"}],
    }, config);

const response3 = await agent.invoke(

    {messages: [{role: "user", content: "what is weather outside?"}],
    }, qaconfig);

    ;
    