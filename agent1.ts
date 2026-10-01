import { createAgent, tool } from "langchain";
import "dotenv/config"
import z from "zod";

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

const getTime = tool( (input)=>{
    return 'The current time in ${ input.city} is 3:00 PM'

} , 
    {
      name : "get_current_time",
      description : "Get the current time in a given city",
      schema : z.object({
          city : z.string()
      })
    }

)

const agent = createAgent(
    {model : "claude-sonnet-4-5-20250929",
     tools: [getWeather, getTime] 
       },

);

// Quick sanity check: ensure the Anthropic API key is present (don't print the key)
//console.log('ANTHROPIC_API_KEY present:', !!process.env.ANTHROPIC_API_KEY);

const response = await agent.invoke(

   // {messages: [{role: "user", content: "what is weather in New York?"} ]
    //{messages: [{role: "user", content: "what is time in New York?"} ]
    {messages: [{role: "user", content: "what is weather & time in New York?"} ]

    });
    console.log(response);
   //const longMessage = response.messages[response.messages.length-1].content
  // console.log(longMessage);
    